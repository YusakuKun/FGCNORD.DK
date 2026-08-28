import { ArrowUpRight, CalendarPlus, Wifi, WifiOff } from "lucide-react";

import {
  gameChipClasses,
  gameDotColors,
  gameLabels,
  isPastEvent,
} from "@/components/turneringer/gameStyles";
import { cn } from "@/lib/utils";
import type { FgcEvent } from "@/types";

function generateCalendarFile(event: FgcEvent): string {
  const start = new Date(event.date);
  const end = event.endDate
    ? new Date(event.endDate)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ""}`,
    `LOCATION:${event.location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
}

function downloadIcs(event: FgcEvent) {
  const blob = new Blob([generateCalendarFile(event)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, "_")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Grid-eventkort med dato-badge, spilchips i spilfarver og tilmeldings-progress */
export function TurneringCard({ event }: { event: FgcEvent }) {
  const start = new Date(event.date);
  const past = isPastEvent(event);
  const game = event.game ?? "all";
  const dot = gameDotColors[game];
  const isOnline = event.format === "online";

  const hasCapacity =
    event.attendees !== undefined && event.maxAttendees !== undefined;
  const pct = hasCapacity
    ? Math.min(100, Math.round((event.attendees! / event.maxAttendees!) * 100))
    : 0;
  const full = hasCapacity && event.attendees! >= event.maxAttendees!;

  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col rounded-2xl border-[3px] border-ink bg-cream p-5 shadow-poster transition-all duration-200 hover:-translate-y-1 hover:shadow-poster-lg",
        past && "opacity-60 grayscale-[30%]",
      )}
    >
      <div className="flex items-start gap-4">
        {/* Dato-badge */}
        <div
          className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border-[3px] border-ink text-ink shadow-poster-sm"
          style={{ background: dot }}
          aria-hidden="true"
        >
          <span className="font-heading text-2xl font-extrabold leading-none">
            {start.getDate()}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
            {start.toLocaleDateString("da-DK", { month: "short" })}
          </span>
        </div>
        <div className="min-w-0">
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-olive">
            {start.toLocaleDateString("da-DK", { weekday: "short" })} · kl.{" "}
            {start.toLocaleTimeString("da-DK", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <h3 className="mt-1 font-heading text-xl font-bold leading-tight text-ink">
            {event.title}
          </h3>
        </div>
      </div>

      {/* Spil + format chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={cn(
            "rounded-full border-2 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em]",
            gameChipClasses[game],
          )}
        >
          {gameLabels[game]}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-cream-dim px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-ink">
          {isOnline ? (
            <Wifi className="h-3 w-3" aria-hidden="true" />
          ) : (
            <WifiOff className="h-3 w-3" aria-hidden="true" />
          )}
          {isOnline ? "Online" : "Offline"}
        </span>
        {past && (
          <span className="rounded-full border-2 border-ink bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-cream">
            Afholdt
          </span>
        )}
      </div>

      {event.description && (
        <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-ink/70">
          {event.description}
        </p>
      )}

      {event.location && (
        <p className="mt-2 text-sm font-semibold text-olive">
          {event.location}
        </p>
      )}

      {/* X/Y tilmeldte progress */}
      {hasCapacity && (
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-xs font-bold">
            <span className="text-ink">
              {event.attendees}/{event.maxAttendees} tilmeldte
            </span>
            {full ? (
              <span className="uppercase tracking-widest text-brick">Fyldt</span>
            ) : (
              <span className="text-ink/50">{pct}%</span>
            )}
          </div>
          <div
            className="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-ink bg-cream-dim"
            role="progressbar"
            aria-valuenow={event.attendees}
            aria-valuemin={0}
            aria-valuemax={event.maxAttendees}
            aria-label={`${event.attendees} af ${event.maxAttendees} tilmeldte`}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: dot }}
            />
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <a
          href={event.startggUrl || event.url || "https://start.gg/fgcnord"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-ink px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.02em] text-cream shadow-poster-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brick hover:text-ink hover:shadow-poster focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
        >
          {past ? "Se resultater" : "Tilmeld på start.gg"}
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={() => downloadIcs(event)}
          aria-label={`Tilføj ${event.title} til kalender`}
          title="Tilføj til kalender"
          className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-transparent p-2.5 text-ink transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
        >
          <CalendarPlus size={18} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
