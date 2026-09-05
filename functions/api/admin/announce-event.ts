/**
 * POST /api/admin/announce-event — annoncér et start.gg-event på Discord.
 *
 * Henter event-detaljer fra start.gg og poster et flot embed med ping til
 * @Medlem (eller DISCORD_PING_ROLE_ID). Bruges til at hype kommende weeklies
 * og større events.
 *
 * Body: { slug: "tournament/x" eller "tournament/x/event/y" eller fuld URL }
 */

import {
  ApiContext,
  corsHeaders,
  getOrigin,
  handleError,
  json,
  requireAdmin,
  ResponseError,
} from "../../lib/api";
import { DISCORD_COLORS, notifyDiscord } from "../../lib/discord";
import { normalizeEventSlug, startggQuery } from "../../lib/startgg";

interface TournamentData {
  tournament: {
    name: string;
    slug: string;
    startAt: number | null;
    endAt: number | null;
    city: string | null;
    numAttendees: number | null;
    images: { type: string | null; url: string }[] | null;
    events: { name: string; numEntrants: number | null }[] | null;
  } | null;
}

export async function onRequestPost(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    requireAdmin(ctx);

    const body = (await ctx.request.json()) as { slug?: string };
    const rawSlug = body.slug?.trim();
    if (!rawSlug) {
      throw new ResponseError("Mangler start.gg-slug.", 400);
    }
    // Annoncering sker på turneringsniveau — strip evt. /event/...-delen
    const normalized = normalizeEventSlug(rawSlug);
    const tournamentSlug = normalized.split("/event/")[0];

    const data = await startggQuery<TournamentData>(
      ctx.env,
      `query TournamentInfo($slug: String!) {
        tournament(slug: $slug) {
          name slug startAt endAt city numAttendees
          images { type url }
          events { name numEntrants }
        }
      }`,
      { slug: tournamentSlug },
    );
    const t = data.tournament;
    if (!t) {
      throw new ResponseError(
        "Fandt ikke turneringen på start.gg — tjek slug'en.",
        404,
      );
    }

    const pingRoleId = ctx.env.DISCORD_PING_ROLE_ID || ctx.env.DISCORD_MEMBER_ROLE_ID;
    const eventList = (t.events || [])
      .map(
        (e) =>
          `• ${e.name}${e.numEntrants ? ` (${e.numEntrants} tilmeldte)` : ""}`,
      )
      .join("\n");

    await notifyDiscord(
      ctx.env,
      {
        title: `📅 ${t.name}`,
        description: "Tilmelding er åben på start.gg — skriv jer på!",
        color: DISCORD_COLORS.brick,
        url: `https://start.gg/${t.slug}`,
        fields: [
          ...(t.startAt
            ? [
                {
                  name: "Hvornår",
                  value: `<t:${t.startAt}:F>`,
                  inline: true,
                },
              ]
            : []),
          ...(t.city ? [{ name: "Hvor", value: t.city, inline: true }] : []),
          ...(eventList ? [{ name: "Events", value: eventList }] : []),
        ],
        footer: { text: "FGC Nord · start.gg" },
      },
      { pingRoleId },
    );

    return json(
      { success: true, event: t.name },
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
