import { ulid } from "./ulid";

export interface Entrant {
  id: string;
  gamertag: string;
}

export interface GeneratedMatch {
  id: string;
  round: number;
  slot: number;
  player1_id: string | null;
  player2_id: string | null;
  next_winner_match_id: string | null;
  next_loser_match_id: string | null;
}

function nextPowerOfTwo(n: number): number {
  return n <= 1 ? 1 : 1 << (32 - Math.clz32(n - 1));
}

export function generateDoubleElimination(entrants: Entrant[]): GeneratedMatch[] {
  const n = entrants.length;
  const m = nextPowerOfTwo(n);
  const W = Math.log2(m);

  const padded: (Entrant | null)[] = [...entrants];
  while (padded.length < m) padded.push(null);

  const matches: GeneratedMatch[] = [];
  const byId = new Map<string, GeneratedMatch>();

  function create(round: number, slot: number): GeneratedMatch {
    const match: GeneratedMatch = {
      id: ulid(),
      round,
      slot,
      player1_id: null,
      player2_id: null,
      next_winner_match_id: null,
      next_loser_match_id: null,
    };
    matches.push(match);
    byId.set(match.id, match);
    return match;
  }

  // Winners bracket: rounds 1..W
  const wb: GeneratedMatch[][] = [];
  for (let r = 1; r <= W; r++) {
    const count = m >> r;
    wb[r] = [];
    for (let s = 0; s < count; s++) wb[r].push(create(r, s));
  }

  // Seed WB round 1
  for (let s = 0; s < m / 2; s++) {
    wb[1][s].player1_id = padded[s]?.id ?? null;
    wb[1][s].player2_id = padded[m - 1 - s]?.id ?? null;
  }

  // Link WB forward
  for (let r = 1; r < W; r++) {
    for (let s = 0; s < wb[r].length; s++) {
      wb[r][s].next_winner_match_id = wb[r + 1][Math.floor(s / 2)].id;
    }
  }

  // Losers bracket rounds 1..L where L = 2*(W-1)
  const lbRounds = W >= 2 ? 2 * (W - 1) : 0;
  const lb: GeneratedMatch[][] = [];
  for (let r = 1; r <= lbRounds; r++) {
    const k = Math.floor((r + 1) / 2);
    const count = m >> (k + 1);
    lb[r] = [];
    for (let s = 0; s < count; s++) lb[r].push(create(-r, s));
  }

  // Link LB forward
  for (let r = 1; r < lbRounds; r++) {
    const currentCount = lb[r].length;
    const nextCount = lb[r + 1].length;
    if (nextCount === 0) continue;
    if (nextCount === currentCount) {
      for (let s = 0; s < currentCount; s++) {
        lb[r][s].next_winner_match_id = lb[r + 1][s].id;
      }
    } else {
      for (let s = 0; s < currentCount; s++) {
        lb[r][s].next_winner_match_id = lb[r + 1][Math.floor(s / 2)].id;
      }
    }
  }

  // Link WB losers into LB
  if (lbRounds >= 1) {
    const lb1Count = lb[1].length;
    for (let s = 0; s < lb1Count; s++) {
      wb[1][s].next_loser_match_id = lb[1][s].id;
      wb[1][s + lb1Count].next_loser_match_id = lb[1][s].id;
    }
  }
  for (let r = 2; r <= W; r++) {
    const lbRound = 2 * (r - 1);
    if (lbRound > lbRounds) break;
    for (let s = 0; s < wb[r].length; s++) {
      wb[r][s].next_loser_match_id = lb[lbRound][s].id;
    }
  }

  // Grand finals
  const gf = create(0, 0);
  if (W >= 1) {
    wb[W][0].next_winner_match_id = gf.id;
  }
  if (lbRounds >= 1) {
    lb[lbRounds][0].next_winner_match_id = gf.id;
  }

  // Bracket reset match (only meaningful if LB winner beats WB winner)
  if (n >= 2) {
    const reset = create(0, 1);
    gf.next_winner_match_id = reset.id;
  }

  return matches;
}

export function getByeWinners(matches: GeneratedMatch[]): GeneratedMatch[] {
  return matches.filter((m) => {
    const a = m.player1_id;
    const b = m.player2_id;
    return (a === null && b !== null) || (b === null && a !== null);
  });
}

export interface MatchWithResult extends GeneratedMatch {
  status: string;
  winner_id: string | null;
}

export interface Standing {
  place: number;
  entrant: Entrant;
}

export function getStandings(
  matches: MatchWithResult[],
  entrants: Entrant[],
): Standing[] {
  const eliminated = new Map<string, number>();

  for (const m of matches) {
    if (m.status === "confirmed" && m.winner_id) {
      const loserId =
        m.winner_id === m.player1_id ? m.player2_id : m.player1_id;
      if (loserId && !eliminated.has(loserId)) {
        eliminated.set(loserId, Math.abs(m.round));
      }
    }
  }

  const sorted = Array.from(eliminated.entries()).sort((a, b) => a[1] - b[1]);
  const byId = new Map(entrants.map((e) => [e.id, e]));

  return sorted.map(([id], index) => ({
    place: index + 1,
    entrant: byId.get(id) ?? { id, gamertag: "Ukendt" },
  }));
}
