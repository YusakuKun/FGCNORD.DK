import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Users, CalendarDays, ArrowRight, Gamepad2, Radio } from "lucide-react";
import Hero from "../components/home/Hero";
import GamesPinSection from "../components/home/GamesPinSection";
import CommunityStats from "../components/home/CommunityStats";
import EventCard from "../components/events/EventCard";
import SectionHeading from "../components/ui/SectionHeading";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { events } from "../data/events";

const gameTeasers = [
  {
    name: "Smash Melee",
    tagline: "20 år gammelt. Stadig uovertruffent.",
    href: "/raekkefoelge#melee",
    src: "/stage-strike-banner.jpg?v=2",
  },
  {
    name: "Smash Ultimate",
    tagline: "Danmarks største smash-scene.",
    href: "/raekkefoelge#ultimate",
    src: "/stage-strike-banner-ultimate.jpg?v=2",
  },
];

const nextEvents = [...events]
  .filter((e) => e.status !== "afholdt")
  .sort((a, b) => a.date.localeCompare(b.date))
  .slice(0, 3);

export default function Home() {
  return (
    <>
      <Hero />

      <CommunityStats />

      {/* Spil-teasere */}
      <section className="bg-cream py-20">
        <div className="container-site">
          <SectionHeading
            kicker="Vores spil"
            title="To scener, ét fællesskab"
            description="Melee og Ultimate kører side om side — begge med ugentlige weeklies, ranglister og turneringer i Nordjylland."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {gameTeasers.map((g, i) => (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.1, duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
              >
                <Link
                  to={g.href}
                  className="group relative block overflow-hidden rounded-2xl shadow-sm ring-1 ring-ink/5 transition-shadow hover:shadow-xl"
                >
                  <img
                    src={g.src}
                    alt={g.name}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-coal/85 via-coal/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-2xl font-bold text-cream">
                      {g.name}
                    </h3>
                    <p className="mt-1 text-sm text-cream/80">{g.tagline}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brick-soft transition-colors group-hover:text-cream">
                      Se rangliste
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Næste events */}
      <section className="bg-white py-20">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              kicker="Kalender"
              title="Næste events"
              description="Weeklies hver uge og større turneringer i kalenderen — der er altid et bracket at joine."
            />
            <Button to="/events" variant="ghost" className="mb-2">
              Alle events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {nextEvents.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {nextEvents.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-ink/60">
              Der er pt. ingen kommende events — hold øje med Discord for
              spontane weeklies.
            </p>
          )}
        </div>
      </section>

      {/* Community / Discord CTA */}
      <section className="relative overflow-hidden bg-coal py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brick/15 blur-3xl"
        />
        <div className="container-site relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brick-soft">
                Fællesskabet
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-cream sm:text-4xl">
                Alting foregår på Discord
              </h2>
              <p className="mt-4 max-w-xl text-cream/70">
                Turneringstilmelding, crew battles, salty suites og memes —
                Discord-serveren er hjertet af FGC Nord. Hop ind og sig hej,
                også selvom du aldrig har været til en turnering før.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-cream/80">
                {[
                  { icon: CalendarDays, text: "Tilmelding til weeklies og majors" },
                  { icon: Trophy, text: "Resultater, ranglister og PR-opdateringer" },
                  { icon: Gamepad2, text: "Find modstandere til netplay og friendlies" },
                  { icon: Users, text: "Carpooling og logi til større events" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brick/15 text-brick-soft">
                      <Icon className="h-4 w-4" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  href="https://discord.gg/fgcnord"
                  variant="primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Discord
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button to="/om-os" variant="ghost" className="text-cream hover:text-brick-soft">
                  Læs om foreningen
                </Button>
              </div>
            </div>
            <Card className="border-cream/10 bg-ink/40 p-8 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                </span>
                <p className="text-sm font-semibold text-cream">
                  Lige nu på serveren
                </p>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { name: "#tournament-talk", desc: "Bracket-hype og seeding-diskussion" },
                  { name: "#find-modstander", desc: "Netplay og friendlies aftales her" },
                  { name: "#announcements", desc: "Nye events annonceres først her" },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="rounded-xl border border-cream/10 bg-coal/60 p-4"
                  >
                    <p className="font-mono text-sm font-semibold text-brick-soft">
                      {c.name}
                    </p>
                    <p className="mt-1 text-xs text-cream/60">{c.desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 flex items-center gap-2 text-xs text-cream/50">
                <Radio className="h-3.5 w-3.5 text-brick-soft" />
                Streamhighlights deles løbende i #clips
              </p>
            </Card>
          </div>
        </div>
      </section>

      <GamesPinSection />
    </>
  );
}
