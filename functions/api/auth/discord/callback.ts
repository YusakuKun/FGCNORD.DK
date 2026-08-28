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

    let player = await ctx.env.DB.prepare(
      "SELECT id, discord_id, gamertag, created_at FROM players WHERE discord_id = ?",
    )
      .bind(user.id)
      .first<{ id: string; discord_id: string; gamertag: string; created_at: number }>();

    if (!player) {
      const playerId = ulid();
      const gamertag = user.global_name || user.username;
      await ctx.env.DB.prepare(
        "INSERT INTO players (id, discord_id, gamertag, created_at) VALUES (?, ?, ?, ?)",
      )
        .bind(playerId, user.id, gamertag, Date.now())
        .run();
      player = {
        id: playerId,
        discord_id: user.id,
        gamertag,
        created_at: Date.now(),
      };
    }

    const { cookie } = await createSession(
      ctx.env.DB,
      ctx.env.SESSION_SECRET,
      player.id,
    );

    const returnTo = url.searchParams.get("state") || "/";
    const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : "/";

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
