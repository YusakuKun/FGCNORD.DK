/**
 * Delt lobby-logik: åben lobby, fremmøde, stations-tildeling.
 * En lobby har N stations. Kampe i kø (queued) rykker automatisk op,
 * når en station bliver fri.
 */

export interface LobbyRow {
  id: string;
  title: string;
  game: string;
  status: string;
  stations: number;
  created_at: number;
  closed_at: number | null;
}

export interface LobbyMatchRow {
  id: string;
  session_id: string;
  station: number | null;
  player1_id: string;
  player2_id: string;
  score1: number | null;
  score2: number | null;
  winner_id: string | null;
  status: string;
  reported_by: string | null;
  created_at: number;
  finished_at: number | null;
  p1_tag?: string;
  p2_tag?: string;
  p1_discord?: string | null;
  p2_discord?: string | null;
}

export async function getOpenLobby(db: D1Database): Promise<LobbyRow | null> {
  return db
    .prepare("SELECT * FROM lobby_sessions WHERE status = 'open' ORDER BY created_at DESC LIMIT 1")
    .first<LobbyRow>();
}

export async function getLobby(db: D1Database, id: string): Promise<LobbyRow | null> {
  return db.prepare("SELECT * FROM lobby_sessions WHERE id = ?").bind(id).first<LobbyRow>();
}

/** Fuld lobby-tilstand til frontend: fremmødte + kampe med gamertags */
export async function loadLobbyState(db: D1Database, lobbyId: string) {
  const attendees = await db
    .prepare(
      `SELECT p.id, p.gamertag, p.discord_avatar, a.joined_at,
              r.rating, r.wins, r.losses
       FROM lobby_attendees a
       JOIN players p ON p.id = a.player_id
       LEFT JOIN ratings r ON r.player_id = p.id AND r.game = (SELECT game FROM lobby_sessions WHERE id = a.session_id)
       WHERE a.session_id = ?
       ORDER BY a.joined_at ASC`,
    )
    .bind(lobbyId)
    .all();

  const matches = await db
    .prepare(
      `SELECT m.*, p1.gamertag AS p1_tag, p2.gamertag AS p2_tag,
              p1.discord_id AS p1_discord, p2.discord_id AS p2_discord
       FROM lobby_matches m
       JOIN players p1 ON p1.id = m.player1_id
       JOIN players p2 ON p2.id = m.player2_id
       WHERE m.session_id = ?
       ORDER BY m.created_at ASC`,
    )
    .bind(lobbyId)
    .all<LobbyMatchRow>();

  return {
    attendees: attendees.results || [],
    matches: matches.results || [],
  };
}

/**
 * Tildel frie stations til de ældste kampe i køen.
 * Returnerer kampe der netop blev kaldt (til Discord-notifikation).
 */
export async function promoteQueue(
  db: D1Database,
  lobby: LobbyRow,
): Promise<LobbyMatchRow[]> {
  const busy = await db
    .prepare(
      `SELECT DISTINCT station FROM lobby_matches
       WHERE session_id = ? AND station IS NOT NULL
       AND status IN ('called', 'reported')`,
    )
    .bind(lobby.id)
    .all<{ station: number }>();

  const busyStations = new Set((busy.results || []).map((r) => r.station));
  const freeStations: number[] = [];
  for (let s = 1; s <= lobby.stations; s++) {
    if (!busyStations.has(s)) freeStations.push(s);
  }
  if (freeStations.length === 0) return [];

  const queued = await db
    .prepare(
      `SELECT m.*, p1.gamertag AS p1_tag, p2.gamertag AS p2_tag,
              p1.discord_id AS p1_discord, p2.discord_id AS p2_discord
       FROM lobby_matches m
       JOIN players p1 ON p1.id = m.player1_id
       JOIN players p2 ON p2.id = m.player2_id
       WHERE m.session_id = ? AND m.status = 'queued'
       ORDER BY m.created_at ASC
       LIMIT ?`,
    )
    .bind(lobby.id, freeStations.length)
    .all<LobbyMatchRow>();

  const called: LobbyMatchRow[] = [];
  const rows = queued.results || [];
  for (let i = 0; i < rows.length; i++) {
    const station = freeStations[i];
    await db
      .prepare("UPDATE lobby_matches SET station = ?, status = 'called' WHERE id = ?")
      .bind(station, rows[i].id)
      .run();
    called.push({ ...rows[i], station, status: "called" });
  }
  return called;
}
