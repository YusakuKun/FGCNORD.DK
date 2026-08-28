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

    if (tournament.status !== "checkin" && tournament.status !== "signup") {
      throw new ResponseError("Check-in er ikke åben.", 400);
    }

    const entry = await ctx.env.DB.prepare(
      "SELECT 1 FROM entries WHERE tournament_id = ? AND player_id = ?",
    )
      .bind(tournament.id, session.player_id)
      .first();

    if (!entry) {
      throw new ResponseError("Du er ikke tilmeldt turneringen.", 400);
    }

    await ctx.env.DB.prepare(
      "UPDATE entries SET checked_in = 1 WHERE tournament_id = ? AND player_id = ?",
    )
      .bind(tournament.id, session.player_id)
      .run();

    return json({ success: true }, { headers: corsHeaders(origin) });
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
