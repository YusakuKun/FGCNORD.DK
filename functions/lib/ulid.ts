/**
 * Simple time-sortable unique ID.
 * Format: <milliseconds since epoch base36>_<10 random base36 chars>
 */
export function ulid(): string {
  const time = Date.now().toString(36);
  const random = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join("");
  return `${time}_${random}`;
}
