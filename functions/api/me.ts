import { corsHeaders, getOrigin, handleError, json } from "../lib/api";
import { readSession } from "../lib/session";

interface MemberPlayerRow {
  id: string;
  gamertag: string;
  discord_username: string | null;
  discord_avatar: string | null;
  is_member: number;
  member_since: number | null;
}

/**
 * GET /api/me — login- og medlemsstatus for den aktuelle session.
 * Bruges fx af /bliv-medlem til at vise "du er medlem"-kortet.
 */
export async function onRequestGet(
  context: EventContext<Env, never, unknown>,
): Promise<Response> {
  const origin = getOrigin(context.request);
  try {
    const { session, player } = await readSession(
      context.request,
      context.env.DB,
      context.env.SESSION_SECRET,
    );

    if (!session || !player) {
      return json(
        { authenticated: false, isMember: false },
        { headers: corsHeaders(origin) },
      );
    }

    const row = await context.env.DB.prepare(
      "SELECT id, gamertag, discord_username, discord_avatar, is_member, member_since FROM players WHERE id = ?",
    )
      .bind(player.id)
      .first<MemberPlayerRow>();

    const isMember = row?.is_member === 1;
    const avatarUrl =
      row?.discord_avatar && player.discord_id
        ? `https://cdn.discordapp.com/avatars/${player.discord_id}/${row.discord_avatar}.png?size=128`
        : null;

    return json(
      {
        authenticated: true,
        isMember,
        memberSince: row?.member_since ?? null,
        player: {
          id: row?.id ?? player.id,
          gamertag: row?.gamertag ?? player.gamertag,
          username: row?.discord_username ?? null,
          avatarUrl,
        },
      },
      { headers: corsHeaders(origin) },
    );
  } catch (err) {
    return handleError(err, origin);
  }
}

export async function onRequestOptions(
  context: EventContext<Env, never, unknown>,
): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(getOrigin(context.request)),
  });
}
