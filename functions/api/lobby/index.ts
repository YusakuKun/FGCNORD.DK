import {
  ApiContext,
  corsHeaders,
  getOrigin,
  handleError,
  json,
  requireAdmin,
  ResponseError,
} from "../../lib/api";
import { DISCORD_COLORS, gameLabel, notifyDiscord } from "../../lib/discord";
import { getOpenLobby, loadLobbyState } from "../../lib/lobby";
import { ulid } from "../../lib/ulid";

const GAMES = ["melee", "ultimate", "roa2"];

/** GET /api/lobby — offentlig: den åbne lobby med fremmødte og kampe */
export async function onRequestGet(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    const lobby = await getOpenLobby(ctx.env.DB);
    if (!lobby) {
      return json({ lobby: null }, { headers: corsHeaders(origin) });
    }
    const state = await loadLobbyState(ctx.env.DB, lobby.id);
    return json({ lobby: { ...lobby, ...state } }, { headers: corsHeaders(origin) });
  } catch (err) {
    return handleError(err, origin);
  }
}

/** POST /api/lobby — admin: åbn aftenens lobby */
export async function onRequestPost(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    requireAdmin(ctx);

    const body = (await ctx.request.json()) as {
      title?: string;
      game?: string;
      stations?: number;
    };

    const title = body.title?.trim();
    if (!title || title.length < 2) {
      throw new ResponseError("Giv lobbyen en titel.", 400);
    }
    const game = body.game?.toLowerCase();
    if (!game || !GAMES.includes(game)) {
      throw new ResponseError(`Ugyldigt spil. Vælg: ${GAMES.join(", ")}.`, 400);
    }
    const stations = Math.min(Math.max(Number(body.stations) || 2, 1), 20);

    const existing = await getOpenLobby(ctx.env.DB);
    if (existing) {
      throw new ResponseError(`Der er allerede en åben lobby: "${existing.title}". Luk den først.`, 409);
    }

    const id = ulid();
    const now = Date.now();
    await ctx.env.DB.prepare(
      "INSERT INTO lobby_sessions (id, title, game, status, stations, created_at) VALUES (?, ?, ?, 'open', ?, ?)",
    )
      .bind(id, title, game, stations, now)
      .run();

    const pingRoleId = ctx.env.DISCORD_PING_ROLE_ID || ctx.env.DISCORD_MEMBER_ROLE_ID;
    context.waitUntil(
      notifyDiscord(
        ctx.env,
        {
          title: `🕹️ Lobby åben: ${title}`,
          description: `${gameLabel(game)} — meld dig til i lobbyen og find modstandere til casuals. Alle kampe tæller på ranglisten!`,
          color: DISCORD_COLORS.brick,
          url: `${new URL(ctx.request.url).origin}/lobby`,
          fields: [{ name: "Stations", value: `${stations}`, inline: true }],
          footer: { text: "fgcnord.dk/lobby" },
        },
        { pingRoleId },
      ),
    );

    return json({ success: true, lobby: { id, title, game, stations } }, { headers: corsHeaders(origin) });
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
