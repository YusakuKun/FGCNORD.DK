import {
  ApiContext,
  corsHeaders,
  error,
  getOrigin,
  handleError,
  json,
  requireSession,
  ResponseError,
} from "../../lib/api";
import { confirmMatchResult, loadMatch } from "../../lib/match";

export async function onRequestGet(
  context: EventContext<Env, "id", { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    const match = await loadMatch(ctx.env.DB, ctx.params.id);
    if (!match) {
      return error("Kampen findes ikke.", 404, corsHeaders(origin));
    }
    return json(match, { headers: corsHeaders(origin) });
  } catch (err) {
    return handleError(err, origin);
  }
}

export async function onRequestPost(
  context: EventContext<Env, "id", { ctx: ApiContext }>,
): Promise<Response> {
  // Report result
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    const session = await requireSession(ctx);
    const matchId = ctx.params.id;

    const body = (await ctx.request.json()) as {
      score1?: number;
      score2?: number;
    };
    const score1 = Number(body.score1);
    const score2 = Number(body.score2);

    if (
      !Number.isFinite(score1) ||
      !Number.isFinite(score2) ||
      score1 < 0 ||
      score2 < 0
    ) {
      throw new ResponseError("Ugyldig score.", 400);
    }

    const match = await loadMatch(ctx.env.DB, matchId);
    if (!match) {
      return error("Kampen findes ikke.", 404, corsHeaders(origin));
    }

    if (match.player1_id !== session.player_id && match.player2_id !== session.player_id) {
      throw new ResponseError("Du kan kun rapportere dine egne kampe.", 403);
    }

    if (match.status === "confirmed") {
      throw new ResponseError("Kampen er allerede bekræftet.", 400);
    }

    const winnerId =
      score1 > score2
        ? match.player1_id
        : score2 > score1
          ? match.player2_id
          : null;
    if (!winnerId) {
      throw new ResponseError("Kampen må ikke ende uafgjort.", 400);
    }

    if (match.status === "reported" || match.status === "disputed") {
      const sameReport =
        match.score1 === score1 &&
        match.score2 === score2 &&
        match.winner_id === winnerId;
      const isOpponent = match.reported_by !== session.player_id;

      if (sameReport && isOpponent) {
        await confirmMatchResult(
          ctx.env.DB,
          match,
          score1,
          score2,
          winnerId,
          match.reported_by ?? session.player_id,
        );
        return json({ success: true, status: "confirmed" }, { headers: corsHeaders(origin) });
      }

      await ctx.env.DB.prepare(
        "UPDATE matches SET status = 'disputed' WHERE id = ?",
      )
        .bind(matchId)
        .run();
      return json(
        {
          success: true,
          status: "disputed",
          message: "Resultatet er uenigt. Kald en referee.",
        },
        { headers: corsHeaders(origin) },
      );
    }

    await ctx.env.DB.prepare(
      `UPDATE matches SET score1 = ?, score2 = ?, winner_id = ?, status = 'reported',
        reported_by = ? WHERE id = ?`,
    )
      .bind(score1, score2, winnerId, session.player_id, matchId)
      .run();

    return json(
      {
        success: true,
        status: "reported",
        message: "Afventer modstanderens bekræftelse.",
      },
      { headers: corsHeaders(origin) },
    );
  } catch (err) {
    return handleError(err, origin);
  }
}

export async function onRequestPut(
  context: EventContext<Env, "id", { ctx: ApiContext }>,
): Promise<Response> {
  // Confirm opponent's report
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    const session = await requireSession(ctx);
    const matchId = ctx.params.id;

    const match = await loadMatch(ctx.env.DB, matchId);
    if (!match) {
      return error("Kampen findes ikke.", 404, corsHeaders(origin));
    }

    if (match.player1_id !== session.player_id && match.player2_id !== session.player_id) {
      throw new ResponseError("Du kan kun bekræfte dine egne kampe.", 403);
    }

    if (match.status !== "reported" && match.status !== "disputed") {
      throw new ResponseError("Kampen kan ikke bekræftes lige nu.", 400);
    }

    if (match.reported_by === session.player_id) {
      throw new ResponseError("Du kan ikke bekræfte dit eget resultat.", 400);
    }

    if (
      match.score1 === null ||
      match.score2 === null ||
      match.winner_id === null
    ) {
      throw new ResponseError("Manglende resultatdata.", 400);
    }

    await confirmMatchResult(
      ctx.env.DB,
      match,
      match.score1,
      match.score2,
      match.winner_id,
      match.reported_by ?? session.player_id,
    );

    return json({ success: true, status: "confirmed" }, { headers: corsHeaders(origin) });
  } catch (err) {
    return handleError(err, origin);
  }
}

export async function onRequestDelete(
  context: EventContext<Env, "id", { ctx: ApiContext }>,
): Promise<Response> {
  // Dispute opponent's report
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    const session = await requireSession(ctx);
    const matchId = ctx.params.id;

    const match = await loadMatch(ctx.env.DB, matchId);
    if (!match) {
      return error("Kampen findes ikke.", 404, corsHeaders(origin));
    }

    if (match.player1_id !== session.player_id && match.player2_id !== session.player_id) {
      throw new ResponseError("Du kan kun dispute dine egne kampe.", 403);
    }

    if (match.status !== "reported") {
      throw new ResponseError("Kampen kan ikke disputes lige nu.", 400);
    }

    if (match.reported_by === session.player_id) {
      throw new ResponseError("Du kan ikke dispute dit eget resultat.", 400);
    }

    await ctx.env.DB.prepare("UPDATE matches SET status = 'disputed' WHERE id = ?")
      .bind(matchId)
      .run();

    return json(
      {
        success: true,
        status: "disputed",
        message: "Resultatet er under review. Kald en referee.",
      },
      { headers: corsHeaders(origin) },
    );
  } catch (err) {
    return handleError(err, origin);
  }
}

export async function onRequestOptions(
  context: EventContext<Env, "id", { ctx: ApiContext }>,
): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(getOrigin(context.data.ctx.request)),
  });
}
