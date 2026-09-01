import { ArrowUpRight, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { gameChipClasses, gameLabels } from "@/components/turneringer/gameStyles";
import { getStartggEvents, type StartggEvent } from "@/lib/startggApi";
import { cn } from "@/lib/utils";

function formatEventDate(startAt: number | null): string {
  if (!startAt) return "Dato TBA";
  return new Date(startAt).toLocaleDateString("da-DK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Live-strip med FGC Nords kommende events direkte fra start.gg.
 * Renderer ingenting hvis integrationen ikke er sat op, eller der
 * ikke er nogen kommende events — så står kalenderen alene.
 */
export function StartggEvents() {
  const [events, setEvents] = useState<StartggEvent[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStartggEvents()
      .then((res) => {
        if (!cancelled) setEvents(res.configured ? res.events : []);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!events || events.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold uppercase text-ink">
          Direkte fra start.gg
        </h2>
        <a
          href="https://start.gg/fgcnord"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-sm font-bold text-brick hover:underline"
        >
          start.gg/fgcnord <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <li key={event.id}>
            <a
              href={event.url}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col rounded-xl border-[3px] border-ink bg-cream-dim shadow-poster transition-all duration-200 hover:-translate-y-1 hover:shadow-poster-sm"
            >
              {event.image && (
                <div className="h-24 overflow-hidden rounded-t-lg border-b-[3px] border-ink">
                  <img
                    src={event.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <p className="font-heading font-bold leading-tight text-ink">
                  {event.name}
                </p>
                <p className="mt-1 text-sm font-bold text-brick">
                  {formatEventDate(event.startAt)}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-ink/60">
                  {event.isOnline ? (
                    <>🌐 Online</>
                  ) : (
                    <>
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {event.city || "Aalborg"}
                    </>
                  )}
                  <span className="mx-1">·</span>
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  {event.numAttendees} tilmeldte
                </p>
                {event.events.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {event.events.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className={cn(
                          "rounded-md border border-ink px-1.5 py-0.5 text-[11px] font-bold",
                          e.game ? gameChipClasses[e.game] : "bg-cream text-ink",
                        )}
                        title={`${e.name} — ${e.numEntrants} tilmeldte`}
                      >
                        {e.game ? gameLabels[e.game] : e.name}
                        {e.numEntrants > 0 ? ` (${e.numEntrants})` : ""}
                      </span>
                    ))}
                  </div>
                )}
                <span className="mt-3 inline-flex items-center gap-1 pt-1 text-sm font-bold text-brick">
                  Tilmeld på start.gg
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
