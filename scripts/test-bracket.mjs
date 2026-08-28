// Quick sanity test for double-elimination bracket engine.
// Run: node scripts/test-bracket.mjs

import { generateDoubleElimination } from "../functions/lib/bracket.ts";

function entrants(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    gamertag: `Player ${i + 1}`,
  }));
}

function inspect(size) {
  const matches = generateDoubleElimination(entrants(size));
  const wb = matches.filter((m) => m.round > 0);
  const lb = matches.filter((m) => m.round < 0);
  const gf = matches.filter((m) => m.round === 0);
  const seeded = matches.filter((m) => m.round === 1);
  const byes = matches.filter(
    (m) =>
      (m.player1_id === null && m.player2_id !== null) ||
      (m.player2_id === null && m.player1_id !== null),
  );

  console.log(`\n--- ${size} entrants ---`);
  console.log(`Total matches: ${matches.length}`);
  console.log(`WB matches: ${wb.length}`);
  console.log(`LB matches: ${lb.length}`);
  console.log(`GF matches: ${gf.length}`);
  console.log(`WB R1 matches (seeded): ${seeded.length}`);
  console.log(`Bye matches: ${byes.length}`);

  // Sanity: total should be 2*nextPowerOfTwo - 1 (includes GF)
  const pow2 = Math.pow(2, Math.ceil(Math.log2(Math.max(size, 1))));
  const expected = 2 * pow2 - 1;
  console.log(`Expected total: ${expected} — ${matches.length === expected ? "OK" : "FAIL"}`);

  // Check links
  const orphanWinners = wb.filter((m) => m.round > 1 && m.next_winner_match_id === null);
  const orphanLosers = lb.filter((m) => m.round < -1 && m.next_winner_match_id === null);
  console.log(`Orphan WB (excl. final): ${orphanWinners.length}`);
  console.log(`Orphan LB (excl. final): ${orphanLosers.length}`);

  // Show WB round distribution
  const wbRounds = {};
  for (const m of wb) {
    wbRounds[m.round] = (wbRounds[m.round] || 0) + 1;
  }
  console.log("WB rounds:", wbRounds);
  const lbRounds = {};
  for (const m of lb) {
    lbRounds[m.round] = (lbRounds[m.round] || 0) + 1;
  }
  console.log("LB rounds:", lbRounds);
}

for (const n of [2, 3, 7, 8, 9, 16, 32]) {
  inspect(n);
}
