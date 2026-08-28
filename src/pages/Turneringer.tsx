import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  CalendarIcon,
  CalendarRange,
  Clock,
  Filter,
  Gamepad2,
  Globe,
  LayoutGrid,
  List,
  MapPin,
  RotateCcw,
  SearchX,
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
  melee: "bg-brick/12 text-brick border-brick/30",
  ultimate: "bg-olive/12 text-olive border-olive/30",
  roa2: "bg-brick-soft/12 text-brick border-brick/30",
  all: "bg-cream-dim text-ink border-ink/20",
};

const gameIcons: Record<string, string> = {
  melee: "🦊",
  ultimate: "🥊",
  roa2: "⚡",
  all: "🎮",
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

  const activeFiltersCount = useMemo(() => {
    return [gameFilter !== "all", dateFilter !== "upcoming", formatFilter !== "all"].filter(
      Boolean
    ).length;
  }, [gameFilter, dateFilter, formatFilter]);

  const resetFilters = () => {
    setGameFilter("all");
    setDateFilter("upcoming");
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
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            value={stats.upcoming}
            label="Kommende"
            icon={<CalendarDays className="h-5 w-5 sm:h-6 sm:w-6" />}
            accent="brick"
          />
          <StatCard
            value={stats.offline}
            label="Offline"
            icon={<MapPin className="h-5 w-5 sm:h-6 sm:w-6" />}
            accent="olive"
          />
          <StatCard
            value={stats.online}
            label="Online"
            icon={<Globe className="h-5 w-5 sm:h-6 sm:w-6" />}
            accent="brick-soft"
          />
        </div>
      </PageHeader>

      <section className="section-padding bg-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-6 overflow-hidden rounded-2xl border-[3px] border-ink bg-cream-dim shadow-poster sm:mb-8">
            <div className="flex items-center gap-2 border-b-2 border-ink/10 bg-ink p-3 sm:p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brick text-cream">
                <Filter className="h-4 w-4" />
              </div>
              <span className="font-heading font-bold text-cream">Filtrer events</span>
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-auto">
                  {activeFiltersCount} aktiv{activeFiltersCount === 1 ? "t" : "e"} filter
                  {activeFiltersCount === 1 ? "" : "e"}
                </Badge>
              )}
            </div>

            <div className="p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
                <FilterSelect
                  label="Spil"
                  icon={<Gamepad2 className="h-4 w-4" />}
                  value={gameFilter}
                  onChange={setGameFilter}
                  options={gameOptions}
                />
                <FilterSelect
                  label="Dato"
                  icon={<CalendarRange className="h-4 w-4" />}
                  value={dateFilter}
                  onChange={setDateFilter}
                  options={dateOptions}
                />
                <FilterSelect
                  label="Format"
                  icon={<Users className="h-4 w-4" />}
                  value={formatFilter}
                  onChange={setFormatFilter}
                  options={formatOptions}
                />

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-2 border-ink bg-cream hover:bg-ink hover:text-cream"
                    onClick={resetFilters}
                    disabled={activeFiltersCount === 0}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Nulstil filtre
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 shadow-poster-sm">
                <Clock className="h-4 w-4 text-olive" />
                <p className="text-sm font-semibold text-ink">
                  {loading
                    ? "Henter events..."
                    : `${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""} fundet`}
                </p>
              </div>
              <Badge variant={source === "google" ? "secondary" : "outline"}>
                {source === "google" ? "Google Calendar" : "Demo-data"}
              </Badge>
            </div>

            <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-cream p-1 shadow-poster-sm">
              <ViewToggleButton active={view === "grid"} onClick={() => setView("grid")} ariaLabel="Grid visning">
                <LayoutGrid className="h-4 w-4" />
              </ViewToggleButton>
              <ViewToggleButton active={view === "list"} onClick={() => setView("list")} ariaLabel="Liste visning">
                <List className="h-4 w-4" />
              </ViewToggleButton>
            </div>
          </div>

          {/* Error alert */}
          {error && source === "fallback" && (
            <Alert className="mb-6" variant="olive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Kalender ikke tilsluttet</AlertTitle>
              <AlertDescription>
                Vi kunne ikke hente events fra Google Calendar, så vi viser demo-data i stedet. Sæt
                VITE_GOOGLE_CALENDAR_ID og VITE_GOOGLE_CALENDAR_API_KEY i din .env-fil for at hente
                rigtige events.
              </AlertDescription>
            </Alert>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="card-poster flex h-full flex-col p-6"
                >
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-[68px] w-[68px] rounded-xl" />
                    <div className="flex-1 space-y-2 pt-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                  <Skeleton className="mt-4 h-4 w-40" />
                  <Skeleton className="mt-auto h-11 w-full rounded-full" />
                </div>
              ))}
            </div>
          )}

          {/* Event grid/list */}
          <AnimatePresence mode="wait">
            {!loading && (
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
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
                  <EmptyState onReset={resetFilters} />
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

function StatCard({
  value,
  label,
  icon,
  accent,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  accent: "brick" | "olive" | "brick-soft";
}) {
  const accentClasses = {
    brick: "border-brick bg-brick text-cream",
    olive: "border-olive bg-olive text-cream",
    "brick-soft": "border-brick-soft bg-brick-soft text-cream",
  };

  return (
    <div className="card-poster group relative overflow-hidden bg-cream p-3 text-center transition-all hover:-translate-y-1 hover:shadow-poster-lg sm:p-4">
      <div
        className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 ${accentClasses[accent]} shadow-poster-sm transition-transform group-hover:scale-110 sm:mb-3 sm:h-12 sm:w-12`}
      >
        {icon}
      </div>
      <p className="font-display text-2xl leading-none text-ink sm:text-3xl">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink/60 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="w-full">
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink/70">
        {icon}
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ViewToggleButton({
  active,
  onClick,
  ariaLabel,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "ghost"}
      size="icon"
      className={`h-8 w-8 rounded-full ${active ? "" : "text-ink/70 hover:bg-cream-dim hover:text-ink"}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="card-poster flex flex-col items-center bg-cream-dim p-10 text-center sm:p-14"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink bg-cream shadow-poster-sm">
        <SearchX className="h-8 w-8 text-brick" />
      </div>
      <h3 className="font-heading text-2xl font-bold text-ink">Ingen events fundet</h3>
      <p className="mt-2 max-w-md text-ink/60">
        Der matcher ikke nogen events med de valgte filtre. Prøv at fjerne nogle filtre eller
        skift til en anden visning.
      </p>
      <Button
        variant="default"
        className="mt-6 rounded-full border-[3px] border-ink bg-ink px-6 text-cream shadow-poster-sm hover:bg-brick"
        onClick={onReset}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Nulstil filtre
      </Button>
    </motion.div>
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
      className="card-poster-interactive flex flex-col gap-4 bg-cream p-4 sm:flex-row sm:items-center"
    >
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-ink bg-brick text-center text-cream shadow-poster-sm">
        <span className="font-display text-lg leading-none">{start.getDate()}</span>
        <span className="text-[10px] font-bold uppercase">
          {start.toLocaleDateString("da-DK", { month: "short" })}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          {event.game && (
            <Badge variant="outline" className={gameBadgeClasses[event.game]}>
              <span className="mr-1">{gameIcons[event.game]}</span>
              {event.game === "melee" && "Melee"}
              {event.game === "ultimate" && "Ultimate"}
              {event.game === "roa2" && "Rivals 2"}
              {event.game === "all" && "Alle spil"}
            </Badge>
          )}
          {event.format && (
            <Badge variant="outline" className="border-ink/20 bg-cream-dim text-ink">
              {isOnline ? <Globe className="mr-1 h-3 w-3" /> : <MapPin className="mr-1 h-3 w-3" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
          )}
        </div>
        <h3 className="truncate font-heading text-base font-bold sm:text-lg">{event.title}</h3>
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
          className="rounded-full border-[3px] border-ink bg-ink text-cream hover:bg-brick-soft"
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
