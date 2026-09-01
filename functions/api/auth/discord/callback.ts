import {
  ApiContext,
  corsHeaders,
  getOrigin,
  handleError,
  ResponseError,
} from "../../../lib/api";
import { createSession } from "../../../lib/session";
import { ulid } from "../../../lib/ulid";

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
}

function getRedirectUri(ctx: ApiContext): string {
  return (
    ctx.env.DISCORD_REDIRECT_URI ||
    `${new URL(ctx.request.url).origin}/api/auth/discord/callback`
  );
}

function decodeReturnTo(state: string | null): string {
  if (!state) return "/";
  try {
    const b64 = state.replaceAll("-", "+").replaceAll("_", "/");
    const parsed = JSON.parse(atob(b64)) as { r?: string };
    const r = parsed.r || "/";
    return r.startsWith("/") && !r.startsWith("//") ? r : "/";
  } catch {
    return "/";
  }
}

/** Tjek om Discord-brugeren er på vores server (kræver bot token + guild id) */
async function checkGuildMembership(
  ctx: ApiContext,
  discordUserId: string,
): Promise<boolean | null> {
  const botToken = ctx.env.DISCORD_BOT_TOKEN;
  const guildId = ctx.env.DISCORD_GUILD_ID;
  const roleId = ctx.env.DISCORD_MEMBER_ROLE_ID;
  if (!botToken || !guildId) return null; // ikke konfigureret — lad være med at ændre status
  try {
    const res = await fetch(
      `https://discord.com/api/guilds/${guildId}/members/${discordUserId}`,
      { headers: { Authorization: `Bot ${botToken}` } },
    );
    if (res.ok) {
      // Medlemskab = medlemsrollen på serveren. Er rollen ikke konfigureret,
      // tæller rent server-medlemskab.
      if (!roleId) return true;
      const member = (await res.json()) as { roles?: string[] };
      return Array.isArray(member.roles) && member.roles.includes(roleId);
    }
    if (res.status === 404) return false;
    return null; // andre fejl: rør ikke eksisterende status
  } catch {
    return null;
  }
}

export async function onRequestGet(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    const url = new URL(ctx.request.url);
    const code = url.searchParams.get("code");
    const errorDesc = url.searchParams.get("error_description");
    if (errorDesc) {
      throw new ResponseError(errorDesc, 400);
    }
    if (!code) {
      throw new ResponseError("Manglende Discord-kode.", 400);
    }

    const clientId = ctx.env.DISCORD_CLIENT_ID;
    const clientSecret = ctx.env.DISCORD_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new ResponseError("Discord OAuth er ikke konfigureret.", 503);
    }

    const redirectUri = getRedirectUri(ctx);

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      throw new ResponseError(`Discord token fejl: ${text}`, 502);
    }
    const tokenData = (await tokenRes.json()) as DiscordTokenResponse;

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    });
    if (!userRes.ok) {
      const text = await userRes.text();
      throw new ResponseError(`Discord bruger fejl: ${text}`, 502);
    }
    const user = (await userRes.json()) as DiscordUser;

    const username = user.global_name || user.username;
    const isMember = await checkGuildMembership(ctx, user.id);
    const now = Date.now();

    let player = await ctx.env.DB.prepare(
      "SELECT id, discord_id, gamertag, created_at FROM players WHERE discord_id = ?",
    )
      .bind(user.id)
      .first<{ id: string; discord_id: string; gamertag: string; created_at: number }>();

    if (!player) {
      const playerId = ulid();
      await ctx.env.DB.prepare(
        `INSERT INTO players (id, discord_id, gamertag, discord_username, discord_avatar, is_member, member_since, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          playerId,
          user.id,
          username,
          username,
          user.avatar ?? null,
          isMember === true ? 1 : 0,
          isMember === true ? now : null,
          now,
        )
        .run();
      player = { id: playerId, discord_id: user.id, gamertag: username, created_at: now };
    } else {
      // Opdatér profilfelter — og medlemsstatus, hvis vi kunne tjekke den
      if (isMember === null) {
        await ctx.env.DB.prepare(
          "UPDATE players SET discord_username = ?, discord_avatar = ? WHERE id = ?",
        )
          .bind(username, user.avatar ?? null, player.id)
          .run();
      } else if (isMember) {
        await ctx.env.DB.prepare(
          "UPDATE players SET discord_username = ?, discord_avatar = ?, is_member = 1, member_since = COALESCE(member_since, ?) WHERE id = ?",
        )
          .bind(username, user.avatar ?? null, now, player.id)
          .run();
      } else {
        await ctx.env.DB.prepare(
          "UPDATE players SET discord_username = ?, discord_avatar = ?, is_member = 0, member_since = NULL WHERE id = ?",
        )
          .bind(username, user.avatar ?? null, player.id)
          .run();
      }
    }

    const { cookie } = await createSession(
      ctx.env.DB,
      ctx.env.SESSION_SECRET,
      player.id,
    );

    const safeReturnTo = decodeReturnTo(url.searchParams.get("state"));

    return new Response(null, {
      status: 302,
      headers: {
        Location: safeReturnTo,
        "Set-Cookie": cookie,
        ...corsHeaders(origin),
      },
    });
  } catch (err) {
    return handleError(err, origin);
  }
}
