import {
  ApiContext,
  corsHeaders,
  getOrigin,
  handleError,
  json,
} from "../lib/api";

const GAMES = ["melee", "ultimate", "roa2"];

/** GET /api/leaderboard?game=ultimate — offentlig rangliste pr. spil */
export async function onRequestGet(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    const url = new URL(ctx.request.url);
    const game = url.searchParams.get("game")?.toLowerCase() || "ultimate";
    if (!GAMES.includes(game)) {
      return json({ error: `Ugyldigt spil. Vælg: ${GAMES.join(", ")}.` }, { status: 400, headers: corsHeaders(origin) });
    }

    const rows = await ctx.env.DB.prepare(
      `SELECT p.gamertag, p.discord_id, p.discord_avatar, r.rating, r.wins, r.losses, r.matches_played, r.updated_at
       FROM ratings r
       JOIN players p ON p.id = r.player_id
       WHERE r.game = ?
       ORDER BY r.rating DESC
       LIMIT 100`,
    )
      .bind(game)
      .all();

    return json(
      { game, players: rows.results || [] },
      { headers: corsHeaders(origin) },
    );
  } catch (err) {
    return handleError(err, origin);
  }
}

export async function onRequestOptions(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(getOrigin(context.data.ctx.request)),
  });
}
