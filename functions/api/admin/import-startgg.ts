/**
 * POST /api/admin/import-startgg — importér færdige sæt fra et start.gg-event
 * til Elo-ranglisten.
 *
 * Flow:
 *  1. Henter alle completed sets (state 3) for eventet, side for side.
 *  2. Matcher hver spillers gamertag mod vores players-tabel
 *     (case-insensitiv, klanpræfiks som "FGC | Tag" fjernes).
 *  3. Lægger Elo-resultatet på via applyRatingResult — men hvert set kun
 *     én gang (dedup via startgg_imported_sets-tabellen).
 *  4. Poster en opsummering på Discord.
 *
 * Body: { slug: "tournament/x/event/y" (eller fuld URL), game?: "ultimate" }
 * Sæt hvor en spiller ikke kan matches, springes over (ikke markeret som
 * importeret) — de kan hentes med på et senere tidspunkt, når spilleren
 * er oprettet i systemet.
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
import { DISCORD_COLORS, gameLabel, notifyDiscord } from "../../lib/discord";
import { applyRatingResult } from "../../lib/rating";
import {
  mapVideogame,
  normalizeEventSlug,
  startggQuery,
} from "../../lib/startgg";

const GAMES = ["melee", "ultimate", "roa2"];
const MAX_PAGES = 10; // 48 sæt pr. side → op til 480 sæt pr. import

interface SetNode {
  id: string | number;
  winnerId: string | number | null;
  displayScore: string | null;
  slots: {
    entrant: {
      id: string | number;
      participants: { gamerTag: string }[] | null;
    } | null;
  }[];
}

interface EventSetsData {
  event: {
    id: string;
    name: string;
    videogame: { name: string } | null;
    tournament: { name: string } | null;
    sets: {
      pageInfo: { totalPages: number } | null;
      nodes: SetNode[];
    } | null;
  } | null;
}

/** Normalisér et gamertag til sammenligning: lowercase + fjern klanpræfiks. */
function normalizeTag(tag: string): string {
  let t = tag.trim().toLowerCase();
  const pipe = t.lastIndexOf("|");
  if (pipe >= 0) t = t.slice(pipe + 1);
  const bracket = t.lastIndexOf("]");
  if (bracket >= 0) t = t.slice(bracket + 1);
  return t.trim();
}

/** Find en spiller i D1 ud fra et start.gg-gamertag. */
async function findPlayerId(
  db: D1Database,
  tag: string,
): Promise<string | null> {
  const full = tag.trim().toLowerCase();
  const stripped = normalizeTag(tag);
  if (!full && !stripped) return null;
  const row = await db
    .prepare(
      "SELECT id FROM players WHERE LOWER(gamertag) = ? OR LOWER(gamertag) = ? LIMIT 1",
    )
    .bind(full, stripped)
    .first<{ id: string }>();
  return row?.id ?? null;
}

export async function onRequestPost(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    requireAdmin(ctx);

    const body = (await ctx.request.json()) as {
      slug?: string;
      game?: string;
    };
    const rawSlug = body.slug?.trim();
    if (!rawSlug) {
      throw new ResponseError("Mangler start.gg-slug.", 400);
    }
    const eventSlug = normalizeEventSlug(rawSlug);
    if (!eventSlug.includes("/event/")) {
      throw new ResponseError(
        "Slug'en skal pege på et event, fx tournament/weekly-77/event/ultimate-singles.",
        400,
      );
    }

    // Hent alle færdige sæt (state 3 = completed), side for side
    const allSets: SetNode[] = [];
    let eventName = "";
    let tournamentName = "";
    let videogameName: string | null = null;
    let page = 1;
    let totalPages = 1;
    do {
      const data = await startggQuery<EventSetsData>(
        ctx.env,
        `query EventSets($slug: String!, $page: Int!) {
          event(slug: $slug) {
            id name
            videogame { name }
            tournament { name }
            sets(page: $page, perPage: 48, filters: { state: [3], showByes: false }) {
              pageInfo { totalPages }
              nodes {
                id winnerId displayScore
                slots { entrant { id participants { gamerTag } } }
              }
            }
          }
        }`,
        { slug: eventSlug, page },
      );
      if (!data.event) {
        throw new ResponseError(
          "Fandt ikke eventet på start.gg — tjek at slug'en er rigtig.",
          404,
        );
      }
      eventName = data.event.name;
      tournamentName = data.event.tournament?.name ?? "";
      videogameName = data.event.videogame?.name ?? null;
      allSets.push(...(data.event.sets?.nodes ?? []));
      totalPages = data.event.sets?.pageInfo?.totalPages ?? 1;
      page += 1;
    } while (page <= totalPages && page <= MAX_PAGES);

    if (allSets.length === 0) {
      throw new ResponseError("Eventet har ingen færdige sæt endnu.", 400);
    }

    const game =
      body.game && GAMES.includes(body.game)
        ? body.game
        : mapVideogame(videogameName);
    if (!game) {
      throw new ResponseError(
        `Kan ikke genkende spillet "${videogameName ?? "ukendt"}" — vælg spil manuelt.`,
        400,
      );
    }

    let imported = 0;
    let skipped = 0;
    const unmatched = new Set<string>();

    for (const set of allSets) {
      // Ingen vinder (uafgjort/uafsluttet) eller DQ → tæller ikke
      if (set.winnerId == null || /dq/i.test(set.displayScore ?? "")) {
        skipped += 1;
        continue;
      }
      const winnerSlot = set.slots.find(
        (s) => s.entrant && String(s.entrant.id) === String(set.winnerId),
      );
      const loserSlot = set.slots.find(
        (s) => s.entrant && String(s.entrant.id) !== String(set.winnerId),
      );
      if (!winnerSlot?.entrant || !loserSlot?.entrant) {
        skipped += 1;
        continue;
      }

      // Dedup: er sættet allerede importeret?
      const seen = await ctx.env.DB
        .prepare("SELECT set_id FROM startgg_imported_sets WHERE set_id = ?")
        .bind(String(set.id))
        .first();
      if (seen) {
        skipped += 1;
        continue;
      }

      const winnerTag = winnerSlot.entrant.participants?.[0]?.gamerTag ?? "";
      const loserTag = loserSlot.entrant.participants?.[0]?.gamerTag ?? "";
      const winnerPid = await findPlayerId(ctx.env.DB, winnerTag);
      const loserPid = await findPlayerId(ctx.env.DB, loserTag);

      if (!winnerPid || !loserPid) {
        // Bevidst IKKE markeret som importeret — kan hentes senere
        if (!winnerPid && winnerTag) unmatched.add(winnerTag);
        if (!loserPid && loserTag) unmatched.add(loserTag);
        skipped += 1;
        continue;
      }

      await applyRatingResult(ctx.env.DB, game, winnerPid, loserPid);
      await ctx.env.DB
        .prepare(
          "INSERT INTO startgg_imported_sets (set_id, event_slug, imported_at) VALUES (?, ?, ?)",
        )
        .bind(String(set.id), eventSlug, Date.now())
        .run();
      imported += 1;
    }

    // Opsummering på Discord (fejler stille hvis webhook ikke er sat)
    const unmatchedList = [...unmatched];
    context.waitUntil(
      notifyDiscord(ctx.env, {
        title: `🏆 Ranglisten opdateret: ${tournamentName || eventName}`,
        description: `${gameLabel(game)} · ${eventName} — ${imported} nye sæt er talt med.`,
        color: DISCORD_COLORS.gold,
        fields: [
          { name: "Nye sæt", value: String(imported), inline: true },
          { name: "Sprunget over", value: String(skipped), inline: true },
          ...(unmatchedList.length > 0
            ? [
                {
                  name: "Gamertags uden match (opret dem i lobbyen)",
                  value: unmatchedList.slice(0, 10).join(", "),
                },
              ]
            : []),
        ],
      }),
    );

    return json(
      {
        success: true,
        event: eventName,
        tournament: tournamentName,
        game,
        totalSets: allSets.length,
        imported,
        skipped,
        unmatched: unmatchedList,
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
