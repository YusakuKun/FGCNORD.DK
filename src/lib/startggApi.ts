const API_BASE = "/api";

export interface StartggEvent {
  id: string;
  name: string;
  url: string;
  startAt: number | null;
  endAt: number | null;
  city: string | null;
  isOnline: boolean;
  numAttendees: number;
  image: string | null;
  events: { id: string; name: string; game: string | null; numEntrants: number }[];
}

/** Hent FGC Nords kommende events fra start.gg (via vores backend). */
export async function getStartggEvents(): Promise<{
  configured: boolean;
  events: StartggEvent[];
}> {
  const res = await fetch(`${API_BASE}/startgg/events`, {
    credentials: "same-origin",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<{ configured: boolean; events: StartggEvent[] }>;
}
