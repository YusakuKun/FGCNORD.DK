-- Lobby-system: ugentlige casuals + rating (skakklub-model).
-- Både lobby-casuals og turneringskampe tæller på ratingen.

CREATE TABLE IF NOT EXISTS lobby_sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  game TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open / closed
  stations INTEGER NOT NULL DEFAULT 2,
  created_at INTEGER NOT NULL,
  closed_at INTEGER
);

CREATE TABLE IF NOT EXISTS lobby_attendees (
  session_id TEXT NOT NULL REFERENCES lobby_sessions(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (session_id, player_id)
);

CREATE TABLE IF NOT EXISTS lobby_matches (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES lobby_sessions(id) ON DELETE CASCADE,
  station INTEGER,                     -- NULL mens kampen er i kø
  player1_id TEXT NOT NULL REFERENCES players(id),
  player2_id TEXT NOT NULL REFERENCES players(id),
  score1 INTEGER,
  score2 INTEGER,
  winner_id TEXT REFERENCES players(id) ON DELETE SET NULL,
  status TEXT NOT NULL,                -- queued / called / reported / done / cancelled
  reported_by TEXT REFERENCES players(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL,
  finished_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_lobby_attendees_session ON lobby_attendees(session_id);
CREATE INDEX IF NOT EXISTS idx_lobby_matches_session ON lobby_matches(session_id);
CREATE INDEX IF NOT EXISTS idx_lobby_matches_status ON lobby_matches(status);

-- Rating pr. spiller pr. spil (Elo, start 1000)
CREATE TABLE IF NOT EXISTS ratings (
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 1000,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (player_id, game)
);

CREATE INDEX IF NOT EXISTS idx_ratings_game ON ratings(game, rating DESC);
