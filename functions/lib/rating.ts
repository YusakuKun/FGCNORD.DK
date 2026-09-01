/**
 * Elo-rating — skakklub-modellen.
 * Alle bekræftede kampe tæller: både lobby-casuals og turneringskampe.
 * Start-rating 1000, K=32. Rating er pr. spiller pr. spil.
 */

const K_FACTOR = 32;
const START_RATING = 1000;

export interface RatingRow {
  player_id: string;
  game: string;
  rating: number;
  wins: number;
  losses: number;
  matches_played: number;
  updated_at: number;
}

function expectedScore(ra: number, rb: number): number {
  return 1 / (1 + Math.pow(10, (rb - ra) / 400));
}

async function getRating(
  db: D1Database,
  playerId: string,
  game: string,
): Promise<RatingRow> {
  const row = await db
    .prepare("SELECT * FROM ratings WHERE player_id = ? AND game = ?")
    .bind(playerId, game)
    .first<RatingRow>();
  if (row) return row;
  return {
    player_id: playerId,
    game,
    rating: START_RATING,
    wins: 0,
    losses: 0,
    matches_played: 0,
    updated_at: Date.now(),
  };
}

/**
 * Opdater rating efter en bekræftet kamp. Returnerer de nye ratings,
 * så vi kan vise ændringen (fx "+14") i Discord-opslag.
 */
export async function applyRatingResult(
  db: D1Database,
  game: string,
  winnerId: string,
  loserId: string,
): Promise<{ winnerDelta: number; loserDelta: number; winnerRating: number; loserRating: number }> {
  const winner = await getRating(db, winnerId, game);
  const loser = await getRating(db, loserId, game);

  const expWin = expectedScore(winner.rating, loser.rating);
  const winnerDelta = Math.round(K_FACTOR * (1 - expWin));
  const loserDelta = Math.round(K_FACTOR * (0 - (1 - expWin)));

  const now = Date.now();
  const winnerRating = winner.rating + winnerDelta;
  const loserRating = loser.rating + loserDelta;

  await db
    .prepare(
      `INSERT INTO ratings (player_id, game, rating, wins, losses, matches_played, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(player_id, game) DO UPDATE SET
         rating = excluded.rating,
         wins = excluded.wins,
         losses = excluded.losses,
         matches_played = excluded.matches_played,
         updated_at = excluded.updated_at`,
    )
    .bind(
      winnerId,
      game,
      winnerRating,
      winner.wins + 1,
      winner.losses,
      winner.matches_played + 1,
      now,
    )
    .run();

  await db
    .prepare(
      `INSERT INTO ratings (player_id, game, rating, wins, losses, matches_played, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(player_id, game) DO UPDATE SET
         rating = excluded.rating,
         wins = excluded.wins,
         losses = excluded.losses,
         matches_played = excluded.matches_played,
         updated_at = excluded.updated_at`,
    )
    .bind(
      loserId,
      game,
      loserRating,
      loser.wins,
      loser.losses + 1,
      loser.matches_played + 1,
      now,
    )
    .run();

  return { winnerDelta, loserDelta, winnerRating, loserRating };
}
