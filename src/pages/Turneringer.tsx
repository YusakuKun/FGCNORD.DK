import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  CalendarIcon,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AddToCalendarButton, EventCard } from "@/components/EventCard";
import { PageHeader } from "@/components/PageHeader";
import { CTASection } from "@/components/CTASection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allEvents } from "@/data/events";
import { fetchCalendarEvents } from "@/lib/calendar";
import type { FgcEvent } from "@/types";

const gameOptions = [
  { value: "all", label: "Alle spil" },
  { value: "melee", label: "Melee" },
  { value: "ultimate", label: "Ultimate" },
  { value: "roa2", label: "Rivals 2" },
];

const dateOptions = [
  { value: "upcoming", label: "Kommende" },
  { value: "all", label: "Alle datoer" },
];

const formatOptions = [
  { value: "all", label: "Alle formater" },
  { value: "offline", label: "Offline" },
  { value: "online", label: "Online" },
];

const gameBadgeClasses: Record<string, string> = {
  melee: "bg-red-100 text-red-800 border-red-200",
  ultimate: "bg-blue-100 text-blue-800 border-blue-200",
  roa2: "bg-emerald-100 text-emerald-800 border-emerald-200",
  all: "bg-amber-100 text-amber-800 border-amber-200",
};

export function Turneringer() {
  const [events, setEvents] = useState<FgcEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"google" | "fallback">("fallback");

  const [gameFilter, setGameFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("upcoming");
  const [formatFilter, setFormatFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchCalendarEvents();
        if (!cancelled) {
          setEvents(result.events);
          setSource(result.source);
          if (result.error) {
            setError(result.error);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setEvents(allEvents);
          setSource("fallback");
          setError(err instanceof Error ? err.message : "Fejl ved indlæsning");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
      const eventDate = new Date(event.date);

      if (gameFilter !== "all" && event.game !== gameFilter) return false;
      if (formatFilter !== "all" && event.format !== formatFilter) return false;
      if (dateFilter === "upcoming" && eventDate < now) return false;

      return true;
    });
  }, [events, gameFilter, dateFilter, formatFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter((e) => new Date(e.date) >= now).length;
    const offline = events.filter((e) => e.format === "offline").length;
    const online = events.filter((e) => e.format === "online").length;
    return { upcoming, offline, online };
  }, [events]);

  const resetFilters = () => {
    setGameFilter("all");
    setDateFilter("all");
    setFormatFilter("all");
  };

  return (
    <>
      <PageHeader
        eyebrow="Turneringer"
        title="Eventkalender"
        description="Find kommende turneringer, weeklies og sociale events fra FGC Nord. Filtrer efter spil, format og dato."
      >
        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-xl border-2 border-ink bg-cream p-3 text-center shadow-poster sm:p-4">
            <CalendarDays className="mx-auto mb-1 h-5 w-5 text-brick sm:h-6 sm:w-6" />
            <p className="font-display text-xl sm:text-2xl">{stats.upcoming}</p>
            <p className="text-[10px] text-ink/60 sm:text-xs">Kommende</p>
          </div>
          <div className="rounded-xl border-2 border-ink bg-cream p-3 text-center shadow-poster sm:p-4">
            <MapPin className="mx-auto mb-1 h-5 w-5 text-olive sm:h-6 sm:w-6" />
            <p className="font-display text-xl sm:text-2xl">{stats.offline}</p>
            <p className="text-[10px] text-ink/60 sm:text-xs">Offline</p>
          </div>
          <div className="rounded-xl border-2 border-ink bg-cream p-3 text-center shadow-poster sm:p-4">
            <Users className="mx-auto mb-1 h-5 w-5 text-brick-soft sm:h-6 sm:w-6" />
            <p className="font-display text-xl sm:text-2xl">{stats.online}</p>
            <p className="text-[10px] text-ink/60 sm:text-xs">Online</p>
          </div>
        </div>
      </PageHeader>

      <section className="section-padding bg-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-6 rounded-xl border-2 border-ink bg-cream-dim p-4 shadow-poster sm:mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-brick" />
                <span className="font-heading font-bold">Filtrer events</span>
              </div>

              <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-end">
                <div className="w-full sm:w-[160px]">
                  <label className="mb-1 block text-xs font-bold text-ink/60">
                    Spil
                  </label>
                  <Select value={gameFilter} onValueChange={setGameFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gameOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-[160px]">
                  <label className="mb-1 block text-xs font-bold text-ink/60">
                    Dato
                  </label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-[160px]">
                  <label className="mb-1 block text-xs font-bold text-ink/60">
                    Format
                  </label>
                  <Select value={formatFilter} onValueChange={setFormatFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/60">
              {loading
                ? "Henter events..."
                : `${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""} fundet`}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={source === "google" ? "secondary" : "outline"}>
                {source === "google" ? "Google Calendar" : "Demo-data"}
              </Badge>
              <div className="flex rounded-md border-2 border-ink bg-cream p-0.5 shadow-poster-sm">
                <Button
                  type="button"
                  variant={view === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setView("grid")}
                  aria-label="Grid visning"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={view === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setView("list")}
                  aria-label="Liste visning"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Error alert */}
          {error && source === "fallback" && (
            <Alert className="mb-6" variant="olive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Kalender ikke tilsluttet</AlertTitle>
              <AlertDescription>
                Vi kunne ikke hente events fra Google Calendar, så vi viser
                demo-data i stedet. Sæt VITE_GOOGLE_CALENDAR_ID og
                VITE_GOOGLE_CALENDAR_API_KEY i din .env-fil for at hente rigtige
                events.
              </AlertDescription>
            </Alert>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border-2 border-ink bg-cream p-5 shadow-poster"
                >
                  <div className="flex gap-4">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="mt-4 h-20 w-full" />
                  <Skeleton className="mt-4 h-10 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Event grid/list */}
          <AnimatePresence mode="wait">
            {!loading && (
              <motion.div
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {filteredEvents.length > 0 ? (
                  view === "grid" ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredEvents.map((event, i) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <EventCard event={event} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEvents.map((event, i) => (
                        <EventListItem key={event.id} event={event} index={i} />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="rounded-xl border-2 border-ink bg-cream-dim p-12 text-center shadow-poster">
                    <CalendarDays className="mx-auto mb-4 h-12 w-12 text-ink/30" />
                    <h3 className="font-heading text-xl font-bold">
                      Ingen events fundet
                    </h3>
                    <p className="mt-2 text-ink/60">
                      Prøv at ændre filtrene for at se flere events.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 border-ink"
                      onClick={resetFilters}
                    >
                      Nulstil filtre
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <CTASection />
    </>
  );
}

function EventListItem({ event, index }: { event: FgcEvent; index: number }) {
  const start = new Date(event.date);
  const isOnline = event.format === "online";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex flex-col gap-4 rounded-xl border-2 border-ink bg-cream p-4 shadow-poster-sm transition-all hover:shadow-poster sm:flex-row sm:items-center"
    >
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-ink bg-cream-dim text-center shadow-poster-sm">
        <span className="font-display text-lg leading-none">
          {start.getDate()}
        </span>
        <span className="text-[10px] font-bold uppercase">
          {start.toLocaleDateString("da-DK", { month: "short" })}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {event.game && (
            <Badge variant="outline" className={gameBadgeClasses[event.game]}>
              {event.game === "melee" && "Melee"}
              {event.game === "ultimate" && "Ultimate"}
              {event.game === "roa2" && "Rivals 2"}
              {event.game === "all" && "Alle spil"}
            </Badge>
          )}
          {event.format && (
            <Badge variant="outline">
              {isOnline ? "Online" : "Offline"}
            </Badge>
          )}
        </div>
        <h3 className="truncate font-heading text-base font-bold sm:text-lg">
          {event.title}
        </h3>
        <p className="mt-0.5 text-sm text-ink/60">
          {start.toLocaleDateString("da-DK", {
            weekday: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {event.location && ` · ${event.location}`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch lg:flex-row">
        <AddToCalendarButton event={event} />
        <Button
          asChild
          variant="default"
          size="sm"
          className="bg-brick text-cream hover:bg-brick-soft"
        >
          <a href={event.url || "/turneringer"}>
            <CalendarIcon className="mr-1.5 h-4 w-4" />
            Se event
          </a>
        </Button>
      </div>
    </motion.div>
  );
}
