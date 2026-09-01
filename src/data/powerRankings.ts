/**
 * Power Rankings — kvartalsvise ranglister for FGC Nord.
 *
 * Navngivning:
 * - slug (URL + filnavn):  `2026-q3-rivals-2`  →  fgcnord.dk/pr/2026-q3-rivals-2
 * - code (brandet sigil):  `2026Q3PRRIVALS2`   →  vises på siden
 *
 * Tilføj en ny udgave ved at lægge et objekt i PR_EDITIONS (nyeste øverst).
 */

export type PrGame = "melee" | "ultimate" | "roa2";

export const PR_GAME_LABELS: Record<PrGame, string> = {
  melee: "Melee",
  ultimate: "Ultimate",
  roa2: "Rivals of Aether 2",
};

export const PR_GAME_COLORS: Record<PrGame, string> = {
  melee: "#E57373",
  ultimate: "#00AEEF",
  roa2: "#34D399",
};

export interface PrPlayer {
  rank: number;
  tag: string;
  /** Karakterer/ruster, fx "Fox, Falco" eller "Kragg" */
  characters?: string;
  /** +/- i forhold til sidste kvartal; "new" = ny på listen; undefined = uændret */
  movement?: number | "new";
  /** Kort panel-kommentar */
  blurb?: string;
}

export interface PrEdition {
  /** URL-slug, fx "2026-q3-rivals-2" */
  slug: string;
  /** Brandet editionskode, fx "2026Q3PRRIVALS2" */
  code: string;
  game: PrGame;
  /** Visningstitel, fx "Q3 2026" */
  quarter: string;
  /** Vurderingsperiode, fx "juli–september 2026" */
  period: string;
  published: string; // ISO-dato
  intro: string;
  /** Panel der har stemt */
  panel: string[];
  players: PrPlayer[];
  honorableMentions?: string[];
}

export const PR_EDITIONS: PrEdition[] = [
  {
    slug: "2026-q3-rivals-2",
    code: "2026Q3PRRIVALS2",
    game: "roa2",
    quarter: "Q3 2026",
    period: "juli–september 2026",
    published: "2026-08-28",
    intro:
      "Første udgave af FGC Nords Rivals of Aether 2 power ranking! Baseret på resultater fra HimmerLAN IGEN og sommerens weeklies. Panelet har vægtet placeringer, modstanderstyrke og konsistens.",
    panel: ["FGC Nord-panelet"],
    players: [
      {
        rank: 1,
        tag: "LS99 | Førskeren",
        characters: "Forsburn",
        movement: "new",
        blurb:
          "Ubestridt nr. 1 efter sejren ved HimmerLAN IGEN. Satte standarden for hele regionens RoA2-scene.",
      },
      {
        rank: 2,
        tag: "VibVib",
        characters: "Kragg",
        movement: "new",
        blurb:
          "Stabil hele sommeren og en stærk 2. plads ved HimmerLAN. Farlig i lange sets.",
      },
      {
        rank: 3,
        tag: "FGCA | Synchron",
        movement: "new",
        blurb: "International erfaring skinner igennem — 3. plads ved HimmerLAN IGEN.",
      },
      {
        rank: 4,
        tag: "+HOPE+",
        movement: "new",
        blurb: "Dobbelt-trussel: top 4 i RoA2 OG vinder af Ultimate-bracketen ved HimmerLAN.",
      },
      { rank: 5, tag: "Claods", movement: "new" },
      { rank: 5, tag: "Helio", movement: "new" },
      { rank: 7, tag: "King Funk", movement: "new" },
      { rank: 7, tag: "Froodle", movement: "new" },
    ],
    honorableMentions: ["Flere lovende navne fra weeklies — vi ser jer!"],
  },
  {
    slug: "2026-q3-ultimate",
    code: "2026Q3PRULTIMATE",
    game: "ultimate",
    quarter: "Q3 2026",
    period: "juli–september 2026",
    published: "2026-08-28",
    intro:
      "Ultimate-scenen i Nordjylland lever i bedste velgående. HimmerLAN IGEN gav os masser af data at arbejde med — her er panelets første officielle rangering.",
    panel: ["FGC Nord-panelet"],
    players: [
      {
        rank: 1,
        tag: "+HOPE+",
        movement: "new",
        blurb:
          "Vandt HimmerLAN IGEN uden at tabe momentum. Regionens bedste Ultimate-spiller lige nu.",
      },
      {
        rank: 2,
        tag: "Lets talk",
        characters: "Jigglypuff",
        movement: "new",
        blurb: "Puff-magien virker. 2. plads ved HimmerLAN og utrolig svær at lukke ned.",
      },
      {
        rank: 3,
        tag: "cedd",
        characters: "Captain Falcon",
        movement: "new",
        blurb: "Eksplosiv og konsekvent — viste sig frem med en top-3-placering.",
      },
      { rank: 4, tag: "Limited LARP Works", characters: "R.O.B.", movement: "new" },
      { rank: 5, tag: "LS99 | Førskeren", characters: "Snake", movement: "new" },
      { rank: 5, tag: "NSB HIM | Josi", characters: "Inkling", movement: "new" },
      { rank: 7, tag: "KOOl", movement: "new" },
      { rank: 7, tag: "4 Kværkeby | Corrin XCX", movement: "new" },
    ],
    honorableMentions: ["Johnic", "Zapdicado"],
  },
];

export function getPrEdition(slug: string): PrEdition | undefined {
  return PR_EDITIONS.find((e) => e.slug === slug);
}
