-- Dedup-tabel for start.gg resultat-import.
-- Hvert importeret set registreres her, så en import aldrig tæller dobbelt.

CREATE TABLE IF NOT EXISTS startgg_imported_sets (
  set_id TEXT PRIMARY KEY,
  event_slug TEXT NOT NULL,
  imported_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_startgg_imported_event ON startgg_imported_sets(event_slug);
