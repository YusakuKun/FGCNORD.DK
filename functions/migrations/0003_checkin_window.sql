-- Check-in window: turneringer får et planlagt starttidspunkt (runde 1),
-- så check-in automatisk åbner 15 min før.

ALTER TABLE tournaments ADD COLUMN start_at INTEGER;
