import type { D1Database } from "@cloudflare/workers-types";

export interface MatchRow {
  id: string;
  tournament_id: string;
  round: number;
  slot: number;
  player1_id: string | null;
  player2_id: string | null;
  score1: number | null;
  score2: number | null;
  winner_id: string | null;
  status: string;
  reported_by: string | null;
  next_winner_match_id: string | null;
  next_loser_match_id: string | null;
  created_at: number;
}

function placePlayer(
  match: MatchRow,
  playerId: string,
): "player1_id" | "player2_id" | null {
  if (match.player1_id === playerId || match.player2_id === playerId) return null;
  if (match.player1_id === null) return "player1_id";
  if (match.player2_id === null) return "player2_id";
  return null;
}

export async function loadMatches(
  db: D1Database,
  tournamentId: string,
): Promise<MatchRow[]> {
  const result = await db
    .prepare(
      `SELECT id, tournament_id, round, slot, player1_id, player2_id,
              score1, score2, winner_id, status, reported_by,
              next_winner_match_id, next_loser_match_id, created_at
       FROM matches WHERE tournament_id = ? ORDER BY round DESC, slot ASC`,
    )
    .bind(tournamentId)
    .all<MatchRow>();
  return (result.results as MatchRow[]) || [];
}

export async function loadMatch(
  db: D1Database,
  matchId: string,
): Promise<MatchRow | null> {
  return db
    .prepare(
      `SELECT id, tournament_id, round, slot, player1_id, player2_id,
              score1, score2, winner_id, status, reported_by,
              next_winner_match_id, next_loser_match_id, created_at
       FROM matches WHERE id = ?`,
    )
    .bind(matchId)
    .first<MatchRow>();
}

export async function updateMatchStatus(
  db: D1Database,
  matchId: string,
  updates: Partial<MatchRow>,
): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value as string | number | null);
    }
  }
  if (fields.length === 0) return;
  values.push(matchId);
  await db
    .prepare(`UPDATE matches SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function advanceWinner(
  db: D1Database,
  match: MatchRow,
): Promise<void> {
  if (!match.winner_id || !match.next_winner_match_id) return;
  const next = await loadMatch(db, match.next_winner_match_id);
  if (!next) return;
  const slot = placePlayer(next, match.winner_id);
  if (!slot) return;
  await updateMatchStatus(db, next.id, { [slot]: match.winner_id });
}

export async function advanceLoser(
  db: D1Database,
  match: MatchRow,
): Promise<void> {
  if (!match.winner_id || !match.next_loser_match_id) return;
  const loserId =
    match.winner_id === match.player1_id ? match.player2_id : match.player1_id;
  if (!loserId) return;
  const next = await loadMatch(db, match.next_loser_match_id);
  if (!next) return;
  const slot = placePlayer(next, loserId);
  if (!slot) return;
  await updateMatchStatus(db, next.id, { [slot]: loserId });
}

export function isReady(match: MatchRow): boolean {
  return (
    match.status === "pending" &&
    match.player1_id !== null &&
    match.player2_id !== null
  );
}

export async function resolveByes(
  db: D1Database,
  tournamentId: string,
): Promise<void> {
  const matches = await loadMatches(db, tournamentId);
  const pending = matches.filter((m) => m.status === "pending");

  for (const match of pending) {
    const hasBye =
      (match.player1_id === null && match.player2_id !== null) ||
      (match.player2_id === null && match.player1_id !== null);
    if (!hasBye) continue;

    const winnerId = match.player1_id ?? match.player2_id;
    await updateMatchStatus(db, match.id, {
      status: "confirmed",
      winner_id: winnerId,
      score1: match.player1_id === winnerId ? 1 : 0,
      score2: match.player2_id === winnerId ? 1 : 0,
    });
    const updated: MatchRow = { ...match, status: "confirmed", winner_id: winnerId };
    await advanceWinner(db, updated);
    await advanceLoser(db, updated);
  }
}

export async function confirmMatchResult(
  db: D1Database,
  match: MatchRow,
  score1: number,
  score2: number,
  winnerId: string,
  reportedBy: string,
): Promise<void> {
  await updateMatchStatus(db, match.id, {
    score1,
    score2,
    winner_id: winnerId,
    status: "confirmed",
    reported_by: reportedBy,
  });

  const updated: MatchRow = {
    ...match,
    score1,
    score2,
    winner_id: winnerId,
    status: "confirmed",
    reported_by: reportedBy,
  };
  await advanceWinner(db, updated);
  await advanceLoser(db, updated);
}

export async function getPlayerCurrentMatch(
  db: D1Database,
  tournamentId: string,
  playerId: string,
): Promise<MatchRow | null> {
  const result = await db
    .prepare(
      `SELECT id, tournament_id, round, slot, player1_id, player2_id,
              score1, score2, winner_id, status, reported_by,
              next_winner_match_id, next_loser_match_id, created_at
       FROM matches
       WHERE tournament_id = ?
         AND (player1_id = ? OR player2_id = ?)
         AND status IN ('pending', 'ready', 'reported')
       ORDER BY round DESC, slot ASC LIMIT 1`,
    )
    .bind(tournamentId, playerId, playerId)
    .first<MatchRow>();
  return result ?? null;
}

export async function markReadyMatches(
  db: D1Database,
  tournamentId: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE matches SET status = 'ready'
       WHERE tournament_id = ? AND status = 'pending'
         AND player1_id IS NOT NULL AND player2_id IS NOT NULL`,
    )
    .bind(tournamentId)
    .run();
}
