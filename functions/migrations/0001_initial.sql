-- Initial schema for TO-free tournaments

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  discord_id TEXT UNIQUE,
  gamertag TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  game TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL,
  startgg_slug TEXT,
  join_code TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  checked_in INTEGER DEFAULT 0,
  seed INTEGER,
  PRIMARY KEY (tournament_id, player_id)
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  slot INTEGER NOT NULL,
  player1_id TEXT REFERENCES players(id) ON DELETE SET NULL,
  player2_id TEXT REFERENCES players(id) ON DELETE SET NULL,
  score1 INTEGER,
  score2 INTEGER,
  winner_id TEXT REFERENCES players(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  reported_by TEXT REFERENCES players(id) ON DELETE SET NULL,
  next_winner_match_id TEXT,
  next_loser_match_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tournaments_join_code ON tournaments(join_code);
CREATE INDEX IF NOT EXISTS idx_entries_tournament ON entries(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_player ON matches(player1_id, player2_id);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  tournament_id TEXT REFERENCES tournaments(id) ON DELETE SET NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_player ON sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_players_discord ON players(discord_id);
