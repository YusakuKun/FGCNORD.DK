import {
  ApiContext,
  corsHeaders,
  getOrigin,
  handleError,
  json,
  ResponseError,
} from "../../lib/api";
import { createSession } from "../../lib/session";
import { ulid } from "../../lib/ulid";

export async function onRequestPost(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    const body = (await ctx.request.json()) as { gamertag?: string };
    const gamertag = body.gamertag?.trim();
    if (!gamertag || gamertag.length < 2) {
      throw new ResponseError("Gamertag skal være mindst 2 tegn.", 400);
    }

    const playerId = ulid();
    await ctx.env.DB.prepare(
      "INSERT INTO players (id, discord_id, gamertag, created_at) VALUES (?, NULL, ?, ?)",
    )
      .bind(playerId, gamertag, Date.now())
      .run();

    const { cookie } = await createSession(
      ctx.env.DB,
      ctx.env.SESSION_SECRET,
      playerId,
    );

    return json(
      { success: true, player: { id: playerId, gamertag } },
      { headers: { "Set-Cookie": cookie, ...corsHeaders(origin) } },
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
