import { ArrowUpRight, CalendarPlus, MapPin, Users } from "lucide-react";
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

const gameStyles: Record<string, { bg: string; text: string; dot: string }> = {
  melee: { bg: "bg-red-100", text: "text-red-900", dot: "bg-red-500" },
  ultimate: { bg: "bg-blue-100", text: "text-blue-900", dot: "bg-blue-500" },
  roa2: { bg: "bg-emerald-100", text: "text-emerald-900", dot: "bg-emerald-500" },
  all: { bg: "bg-amber-100", text: "text-amber-900", dot: "bg-amber-500" },
};

const formatIcons = {
  online: Users,
  offline: MapPin,
};

function getStatus(date: string): { label: string; className: string } {
  const eventDate = new Date(date);
  const now = new Date();
  const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (eventDate < now) {
    return { label: "Afsluttet", className: "bg-ink/10 text-ink/50" };
  }
  if (diffHours < 48) {
    return { label: "Snart", className: "bg-brick/15 text-brick" };
  }
  return { label: "Åben", className: "bg-emerald-100 text-emerald-800" };
}

/** Eventkort m. dato-badge, spil-chips og start.gg-knap */
export function EventCard({ event, variant = "default" }: EventCardProps) {
  const start = new Date(event.date);
  const day = start.getDate();
  const month = start.toLocaleDateString("da-DK", { month: "short" });
  const weekday = start.toLocaleDateString("da-DK", { weekday: "short" });
  const time = start.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });

  const isPast = start < new Date();
  const status = getStatus(event.date);
  const game = event.game || "all";
  const style = gameStyles[game] || gameStyles.all;
  const FormatIcon = event.format === "online" ? formatIcons.online : formatIcons.offline;

  return (
    <article
      className={cn(
        "group relative flex h-full min-w-[280px] flex-col overflow-hidden rounded-2xl border-[3px] border-ink bg-cream shadow-poster transition-all duration-300 hover:-translate-y-2 hover:shadow-poster-lg",
        variant === "olive" && "bg-cream",
        isPast && "opacity-70"
      )}
    >
      {/* Top accent bar */}
      <div className={cn("h-2 w-full", style.dot)} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-4">
          {/* Date badge */}
          <div className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-xl border-[3px] border-ink bg-brick text-cream shadow-poster-sm">
            <span className="font-heading text-2xl font-extrabold leading-none tracking-[-0.02em]">
              {day}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">{month}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
                  status.className
                )}
              >
                {status.label}
              </span>
              {event.format && (
                <span className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-cream-dim px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/70">
                  <FormatIcon className="h-3 w-3" />
                  {event.format === "online" ? "Online" : "Offline"}
                </span>
              )}
            </div>
            <h3 className="font-heading text-xl font-bold leading-tight text-ink md:text-[22px]">
              {event.title}
            </h3>
            <p className="mt-1 text-[13px] font-semibold text-olive">
              {weekday} · kl. {time}
            </p>
          </div>
        </div>

        {/* Game chip */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em]",
              style.bg,
              style.text
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", style.dot)} />
            {gameLabels[game] || game}
          </span>
        </div>

        {/* Description */}
        {event.description && (
          <p className="mt-3 line-clamp-2 text-[15px] leading-[1.6] text-olive">
            {event.description}
          </p>
        )}

        {/* Location & attendance */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] font-semibold text-olive">
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </span>
          )}
          {event.attendees !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {event.attendees}
              {event.maxAttendees ? ` / ${event.maxAttendees}` : ""} tilmeldte
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2 pt-5">
          <a
            href={event.startggUrl || event.url || "/turneringer"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-ink px-5 py-2.5 text-[14px] font-semibold uppercase tracking-[0.02em] text-cream shadow-poster-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brick hover:shadow-poster"
          >
            Tilmeld på start.gg <ArrowUpRight size={17} />
          </a>
          <AddToCalendarButton event={event} />
        </div>
      </div>
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
      <CalendarPlus size={17} />
      Tilføj til kalender
    </button>
  );
}
