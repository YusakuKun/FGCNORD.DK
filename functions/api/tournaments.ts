import {
  ApiContext,
  corsHeaders,
  getOrigin,
  handleError,
  json,
  requireAdmin,
  ResponseError,
} from "../lib/api";
import { ulid } from "../lib/ulid";

const GAMES = ["melee", "ultimate", "roa2"];
const FORMATS = ["double_elim", "single_elim", "round_robin"];

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function onRequestPost(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    requireAdmin(ctx);

    const body = (await ctx.request.json()) as {
      name?: string;
      game?: string;
      format?: string;
      startgg_slug?: string;
    };

    const name = body.name?.trim();
    if (!name || name.length < 2) {
      throw new ResponseError("Turneringsnavn skal være mindst 2 tegn.", 400);
    }

    const game = body.game?.toLowerCase();
    if (!game || !GAMES.includes(game)) {
      throw new ResponseError(`Ugyldigt spil. Vælg: ${GAMES.join(", ")}.`, 400);
    }

    const format = body.format?.toLowerCase() || "double_elim";
    if (!FORMATS.includes(format)) {
      throw new ResponseError(`Ugyldigt format. Vælg: ${FORMATS.join(", ")}.`, 400);
    }

    const id = ulid();
    const joinCode = generateJoinCode();
    const now = Date.now();

    await ctx.env.DB.prepare(
      `INSERT INTO tournaments (id, name, game, format, status, startgg_slug, join_code, created_at)
       VALUES (?, ?, ?, ?, 'signup', ?, ?, ?)`,
    )
      .bind(id, name, game, format, body.startgg_slug || null, joinCode, now)
      .run();

    return json(
      {
        success: true,
        tournament: {
          id,
          name,
          game,
          format,
          status: "signup",
          join_code: joinCode,
          startgg_slug: body.startgg_slug || null,
          created_at: now,
        },
      },
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
