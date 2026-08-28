import {
  ApiContext,
  corsHeaders,
  error,
  getOrigin,
  handleError,
  json,
  requireAdmin,
  ResponseError,
} from "../../../lib/api";
import { generateDoubleElimination } from "../../../lib/bracket";
import { markReadyMatches, resolveByes } from "../../../lib/match";

export async function onRequestPost(
  context: EventContext<Env, "code", { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    requireAdmin(ctx);
    const code = ctx.params.code;

    const tournament = await ctx.env.DB.prepare(
      "SELECT id, status, format FROM tournaments WHERE join_code = ?",
    )
      .bind(code)
      .first<{ id: string; status: string; format: string }>();

    if (!tournament) {
      return error("Turneringen findes ikke.", 404, corsHeaders(origin));
    }

    if (tournament.status !== "signup" && tournament.status !== "checkin") {
      throw new ResponseError("Turneringen er allerede startet.", 400);
    }

    if (tournament.format !== "double_elim") {
      throw new ResponseError("Kun double elimination understøttes i MVP.", 400);
    }

    const entrants = await ctx.env.DB.prepare(
      `SELECT p.id, p.gamertag
       FROM entries e
       JOIN players p ON p.id = e.player_id
       WHERE e.tournament_id = ?
       ORDER BY e.seed ASC, p.gamertag ASC`,
    )
      .bind(tournament.id)
      .all<{ id: string; gamertag: string }>();

    const entrantList = entrants.results || [];
    if (entrantList.length < 2) {
      throw new ResponseError("Der skal mindst 2 deltagere til at starte.", 400);
    }

    const generated = generateDoubleElimination(entrantList);

    const stmt = ctx.env.DB.prepare(
      `INSERT INTO matches
       (id, tournament_id, round, slot, player1_id, player2_id, score1, score2,
        winner_id, status, reported_by, next_winner_match_id, next_loser_match_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, NULL, 'pending', NULL, ?, ?, ?)`,
    );

    const batch = generated.map((m) =>
      stmt.bind(
        m.id,
        tournament.id,
        m.round,
        m.slot,
        m.player1_id,
        m.player2_id,
        m.next_winner_match_id,
        m.next_loser_match_id,
        Date.now(),
      ),
    );
    await ctx.env.DB.batch(batch);

    await ctx.env.DB.prepare(
      "UPDATE tournaments SET status = 'live' WHERE id = ?",
    )
      .bind(tournament.id)
      .run();

    await resolveByes(ctx.env.DB, tournament.id);
    await markReadyMatches(ctx.env.DB, tournament.id);

    return json(
      { success: true, matches: generated.length },
      { headers: corsHeaders(origin) },
    );
  } catch (err) {
    return handleError(err, origin);
  }
}

export async function onRequestOptions(
  context: EventContext<Env, "code", { ctx: ApiContext }>,
): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(getOrigin(context.data.ctx.request)),
  });
}
