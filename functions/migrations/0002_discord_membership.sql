-- Discord-baseret medlems-tracking

ALTER TABLE players ADD COLUMN discord_username TEXT;
ALTER TABLE players ADD COLUMN discord_avatar TEXT;
ALTER TABLE players ADD COLUMN is_member INTEGER NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN member_since INTEGER;

CREATE INDEX IF NOT EXISTS idx_players_member ON players(is_member);
