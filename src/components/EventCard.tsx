import { ArrowUpRight, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FgcEvent } from "@/types";

interface EventCardProps {
  event: FgcEvent;
  variant?: "default" | "cream" | "olive";
}

const gameLabels: Record<string, string> = {
  melee: "Melee",
  ultimate: "Ultimate",
  roa2: "Rivals 2",
  all: "Alle spil",
};

/** Eventkort m. dato-badge, spil-chips og start.gg-knap */
export function EventCard({ event, variant = "default" }: EventCardProps) {
  const start = new Date(event.date);
  const day = start.getDate();
  const month = start.toLocaleDateString("da-DK", { month: "short" });
  const weekday = start.toLocaleDateString("da-DK", { weekday: "short" });
  const time = start.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });

  const spil = event.game ? [gameLabels[event.game] || event.game] : [];

  return (
    <article
      className={cn(
        "group flex h-full min-w-[280px] flex-col rounded-2xl border-[3px] border-ink p-6 shadow-poster transition-all duration-200 hover:-translate-y-1 hover:shadow-poster-lg",
        variant === "olive" ? "bg-cream text-ink" : "bg-cream text-ink"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center rounded-xl border-[3px] border-ink bg-brick text-cream shadow-poster-sm">
          <span className="font-heading text-2xl font-extrabold leading-none tracking-[-0.02em]">
            {day}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]">{month}</span>
        </div>
        <div className="min-w-0">
          <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-olive">
            {weekday} · kl. {time}
          </span>
          <h3 className="mt-1 font-heading text-[22px] font-bold leading-tight text-ink md:text-[24px]">
            {event.title}
          </h3>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {spil.map((spilName) => (
          <span
            key={spilName}
            className="rounded-full border-2 border-ink bg-cream-dim px-3 py-1 text-[12px] font-bold uppercase tracking-[0.1em] text-ink"
          >
            {spilName}
          </span>
        ))}
      </div>

      <p className="mt-3 text-[15px] font-semibold text-olive">
        {event.location}
        {event.location && (event.attendees !== undefined || event.maxAttendees !== undefined) && " · "}
        {event.attendees !== undefined && `${event.attendees} tilmeldte`}
        {event.maxAttendees !== undefined && ` · max ${event.maxAttendees}`}
      </p>

      <a
        href={event.startggUrl || event.url || "/turneringer"}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-ink px-5 py-2.5 pt-3 text-[15px] font-semibold uppercase tracking-[0.02em] text-cream shadow-poster-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brick hover:shadow-poster"
      >
        Tilmeld på start.gg <ArrowUpRight size={18} />
      </a>
    </article>
  );
}

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

export function AddToCalendarButton({
  event,
  className,
}: {
  event: FgcEvent;
  className?: string;
}) {
  const handleClick = () => {
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
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border-[3px] border-ink bg-transparent px-4 py-2 text-[14px] font-semibold uppercase tracking-[0.02em] text-ink transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-cream",
        className
      )}
    >
      <CalendarPlus size={18} />
      Tilføj til kalender
    </button>
  );
}
