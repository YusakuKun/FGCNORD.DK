import { ArrowUpRight, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { gameDotColors, gameLabels } from "@/components/turneringer/gameStyles";
import type { FgcEvent } from "@/types";

interface CountdownProps {
  event: FgcEvent | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: number, now: number): TimeLeft {
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Live countdown til det næste kommende event */
export function Countdown({ event }: CountdownProps) {
  const target = useMemo(
    () => (event ? new Date(event.date).getTime() : 0),
    [event],
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!event) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [event]);

  if (!event) return null;

  const t = getTimeLeft(target, now);
  const units = [
    { value: pad(t.days), label: "dage" },
    { value: pad(t.hours), label: "timer" },
    { value: pad(t.minutes), label: "min" },
    { value: pad(t.seconds), label: "sek" },
  ];
  const dot = gameDotColors[event.game ?? "all"];

  return (
    <section
      aria-label="Nedtælling til næste event"
      className="relative overflow-hidden rounded-2xl border-[3px] border-ink bg-ink p-5 text-cream shadow-poster sm:p-6"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-2xl"
        style={{ background: dot }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-brick-soft">
            <Timer className="h-4 w-4" aria-hidden="true" />
            Næste event
          </p>
          <h2 className="mt-1 truncate font-heading text-xl font-bold sm:text-2xl">
            <span
              className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
              style={{ background: dot }}
              aria-hidden="true"
            />
            {event.title}
          </h2>
          <p className="mt-1 text-sm text-cream/70">
            {gameLabels[event.game ?? "all"]} ·{" "}
            {new Date(event.date).toLocaleDateString("da-DK", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {event.location && ` · ${event.location}`}
          </p>
        </div>

        <div className="flex items-center gap-2" role="timer" aria-live="off">
          {units.map((u) => (
            <div
              key={u.label}
              className="flex min-w-[3.25rem] flex-col items-center rounded-lg border-2 border-cream/25 bg-cream/10 px-2 py-1.5"
            >
              <span className="font-display text-xl leading-none tabular-nums sm:text-2xl">
                {u.value}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-cream/60">
                {u.label}
              </span>
            </div>
          ))}
        </div>

        <a
          href={event.startggUrl || event.url || "https://start.gg/fgcnord"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-[3px] border-cream bg-brick px-5 py-2.5 text-sm font-bold uppercase tracking-[0.04em] text-ink shadow-poster-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brick-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick-soft focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          Tilmeld <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
