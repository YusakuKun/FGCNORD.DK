import {
  ApiContext,
  corsHeaders,
  error,
  getOrigin,
  handleError,
  json,
  requireSession,
  ResponseError,
} from "../../../lib/api";

export async function onRequestPost(
  context: EventContext<Env, "code", { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    const session = await requireSession(ctx);
    const code = ctx.params.code;

    const tournament = await ctx.env.DB.prepare(
      "SELECT id, status FROM tournaments WHERE join_code = ?",
    )
      .bind(code)
      .first<{ id: string; status: string }>();

    if (!tournament) {
      return error("Turneringen findes ikke.", 404, corsHeaders(origin));
    }

    if (tournament.status !== "signup" && tournament.status !== "checkin") {
      throw new ResponseError("Turneringen accepterer ikke flere tilmeldinger.", 400);
    }

    const existing = await ctx.env.DB.prepare(
      "SELECT 1 FROM entries WHERE tournament_id = ? AND player_id = ?",
    )
      .bind(tournament.id, session.player_id)
      .first();
    if (existing) {
      throw new ResponseError("Du er allerede tilmeldt denne turnering.", 409);
    }

    await ctx.env.DB.prepare(
      "INSERT INTO entries (tournament_id, player_id, checked_in, seed) VALUES (?, ?, 0, NULL)",
    )
      .bind(tournament.id, session.player_id)
      .run();

    return json(
      { success: true, tournament_id: tournament.id },
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
