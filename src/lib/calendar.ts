import { allEvents } from "@/data/events";
import type { FgcEvent } from "@/types";

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

interface GoogleCalendarResponse {
  items?: GoogleCalendarEvent[];
  error?: {
    code: number;
    message: string;
  };
}

const CACHE_KEY = "fgc_nord_calendar_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutter

interface CacheEntry {
  events: FgcEvent[];
  fetchedAt: number;
}

function getCachedEvents(): FgcEvent[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CacheEntry = JSON.parse(raw);
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.events;
  } catch {
    return null;
  }
}

function setCachedEvents(events: FgcEvent[]) {
  try {
    const entry: CacheEntry = { events, fetchedAt: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignorer cache-fejl
  }
}

function parseGameFromText(text?: string): FgcEvent["game"] {
  if (!text) return "all";
  const lower = text.toLowerCase();
  if (lower.includes("melee")) return "melee";
  if (lower.includes("ultimate")) return "ultimate";
  if (lower.includes("rivals") || lower.includes("roa2") || lower.includes("roa 2")) return "roa2";
  return "all";
}

function parseFormatFromText(text?: string): FgcEvent["format"] {
  if (!text) return "offline";
  const lower = text.toLowerCase();
  if (lower.includes("online") || lower.includes("netplay")) return "online";
  return "offline";
}

function mapGoogleEvent(event: GoogleCalendarEvent): FgcEvent {
  const start = event.start?.dateTime || event.start?.date;
  const end = event.end?.dateTime || event.end?.date;
  const description = event.description || "";
  const location = event.location || "";

  return {
    id: event.id,
    title: event.summary || "Untitled event",
    date: start || new Date().toISOString(),
    endDate: end,
    description,
    location,
    game: parseGameFromText(`${description} ${event.summary}`),
    format: parseFormatFromText(`${description} ${location}`),
    url: "/turneringer",
  };
}

export async function fetchCalendarEvents(): Promise<{
  events: FgcEvent[];
  source: "google" | "fallback";
  error?: string;
}> {
  const calendarId = import.meta.env.VITE_GOOGLE_CALENDAR_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;

  // Brug cache hvis tilgængelig
  const cached = getCachedEvents();
  if (cached) {
    return { events: cached, source: "google" };
  }

  // Hvis credentials mangler, brug fallback med det samme
  if (!calendarId || !apiKey || calendarId.includes("your-calendar")) {
    return { events: allEvents, source: "fallback" };
  }

  try {
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId
      )}/events`
    );
    url.searchParams.set("key", apiKey);
    url.searchParams.set("timeMin", new Date().toISOString());
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("singleEvents", "true");

    const response = await fetch(url.toString());
    const data: GoogleCalendarResponse = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || "Kunne ikke hente kalenderdata");
    }

    const events = (data.items || [])
      .filter((event) => event.start)
      .map(mapGoogleEvent)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setCachedEvents(events);
    return { events, source: "google" };
  } catch (err) {
    console.error("Google Calendar fejl:", err);
    return {
      events: allEvents,
      source: "fallback",
      error: err instanceof Error ? err.message : "Ukendt fejl",
    };
  }
}
