import type { FgcEvent } from "@/types";

/**
 * 1.0-oprydning: ingen fallback-events med opdigtede datoer/deltagere.
 * Events hentes live (start.gg / kalender) på /turneringer.
 * De tomme arrays bevares, så siderne viser en pæn tom-tilstand.
 */
export const upcomingEvents: FgcEvent[] = [];

export const allEvents: FgcEvent[] = [];
