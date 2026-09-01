import {
  ApiContext,
  corsHeaders,
  getOrigin,
  handleError,
  json,
} from "../../lib/api";
import { mapVideogame, startggConfigured, startggQuery } from "../../lib/startgg";

interface CurrentUserData {
  currentUser: { id: string } | null;
}

interface TournamentsData {
  tournaments: {
    nodes: {
      id: string;
      name: string;
      slug: string;
      startAt: number | null;
      endAt: number | null;
      city: string | null;
      isOnline: boolean | null;
      numAttendees: number | null;
      images: { type: string | null; url: string }[] | null;
      events: {
        id: string;
        name: string;
        numEntrants: number | null;
        videogame: { name: string } | null;
      }[] | null;
    }[];
  } | null;
}

/**
 * GET /api/startgg/events — offentlig: FGC Nords kommende events på start.gg.
 * Returnerer { configured: false, events: [] } hvis token ikke er sat —
 * så falder frontend tilbage på kalender/hardcoded events.
 */
export async function onRequestGet(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  const headers = { ...corsHeaders(origin), "Cache-Control": "public, max-age=300" };
  try {
    if (!startggConfigured(ctx.env)) {
      return json({ configured: false, events: [] }, { headers });
    }

    // Hvem ejer tokenet? → hent turneringer oprettet af den bruger
    const me = await startggQuery<CurrentUserData>(
      ctx.env,
      "query WhoAmI { currentUser { id } }",
    );
    const ownerId = me.currentUser?.id;
    if (!ownerId) {
      return json({ configured: false, events: [] }, { headers });
    }

    const data = await startggQuery<TournamentsData>(
      ctx.env,
      `query UpcomingTournaments($ownerId: ID!) {
        tournaments(query: { perPage: 20, filter: { ownerId: $ownerId } }) {
          nodes {
            id name slug startAt endAt city isOnline numAttendees
            images { type url }
            events { id name numEntrants videogame { name } }
          }
        }
      }`,
      { ownerId },
    );

    const cutoff = Date.now() - 6 * 60 * 60 * 1000; // vis også events der startede for op til 6t siden
    const events = (data.tournaments?.nodes || [])
      .filter((t) => ((t.endAt ?? t.startAt ?? 0) as number) * 1000 >= cutoff)
      .sort((a, b) => (a.startAt ?? 0) - (b.startAt ?? 0))
      .slice(0, 8)
      .map((t) => ({
        id: t.id,
        name: t.name,
        url: `https://start.gg/${t.slug}`,
        startAt: t.startAt ? t.startAt * 1000 : null,
        endAt: t.endAt ? t.endAt * 1000 : null,
        city: t.city,
        isOnline: !!t.isOnline,
        numAttendees: t.numAttendees ?? 0,
        image:
          t.images?.find((i) => i.type === "banner")?.url ?? t.images?.[0]?.url ?? null,
        events: (t.events || []).map((e) => ({
          id: e.id,
          name: e.name,
          game: mapVideogame(e.videogame?.name),
          numEntrants: e.numEntrants ?? 0,
        })),
      }));

    return json({ configured: true, events }, { headers });
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
