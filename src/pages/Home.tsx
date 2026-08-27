import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Sparkle } from "@/components/Sparkle";
import { WaveDivider } from "@/components/WaveDivider";
import { SectionHeader } from "@/components/SectionHeader";
import { EventCard } from "@/components/EventCard";
import { CTASection } from "@/components/CTASection";
import { GamesPinSection } from "@/components/home/GamesPinSection";
import { HeroDecor } from "@/components/home/HeroDecor";
import { DiscordIcon, DISCORD_URL } from "@/components/Navbar";
import { upcomingEvents } from "@/data/events";

const VALUES = [
  { title: "Fællesskab først", text: "Alle er velkomne, uanset alder og niveau." },
  { title: "Grassroots", text: "Drevet af frivillige, for spillerne." },
  { title: "Lokal forankring", text: "Nordjylland er vores hjemmebane." },
];

const TEASER_THUMBS = [
  "/stage-thumbs/battlefield.png",
  "/stage-thumbs/final-destination.png",
  "/stage-thumbs/smashville.png",
  "/stage-thumbs/town-and-city.png",
];

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function Home() {
  return (
    <>
      {/* 1. HERO */}
      <section className="halftone relative overflow-hidden bg-cream">
        <HeroDecor />
        <div className="mx-auto grid min-h-[92vh] max-w-[1200px] items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-0">
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-[13px] font-bold uppercase tracking-[0.18em] text-brick"
            >
              Forening for platform fighters · Aalborg & Nordjylland
            </motion.p>
            <h1 className="mt-5 font-display text-[44px] uppercase leading-[1.02] tracking-[-0.02em] md:text-[88px]">
              {"NORDJYLLANDS HJEM FOR SMASH".split(" ").map((ord, i) => (
                <span key={i} className="inline-block overflow-hidden align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.08 }}
                  >
                    {ord}&nbsp;
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="mt-6 max-w-lg text-[16px] leading-[1.7] text-olive md:text-[17px]"
            >
              FGC Nord er en ny forening for alle, der elsker Super Smash Bros. Melee, Ultimate og
              Rivals of Aether 2. Kom og spil — uanset alder og niveau.
            </motion.p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              {[
                <Link
                  key="medlem"
                  to="/bliv-medlem"
                  className="group inline-flex items-center gap-2.5 rounded-full border-[3px] border-ink bg-brick px-8 py-3.5 text-[15px] font-semibold uppercase tracking-[0.02em] text-cream shadow-poster transition-all duration-200 hover:-translate-y-0.5 hover:bg-brick-soft hover:shadow-poster-lg"
                >
                  Bliv medlem
                  <Sparkle size={16} color="#F7F1E6" className="transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
                </Link>,
                <a
                  key="discord"
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border-[3px] border-ink bg-transparent px-8 py-3.5 text-[15px] font-semibold uppercase tracking-[0.02em] text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink hover:text-cream"
                >
                  <DiscordIcon size={18} /> Join Discord
                </a>,
              ].map((btn, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.7 + i * 0.12 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {btn}
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-8 flex gap-2.5"
            >
              {["Melee", "Ultimate", "RoA2"].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border-2 border-ink bg-cream px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em]"
                >
                  {chip}
                </span>
              ))}
            </motion.div>
          </div>

          <div className="relative z-10 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: EASE, delay: 0.3 }}
              className="relative"
            >
              <img
                src="/hero-illustration.png"
                alt="Illustration af to krydsede spilcontrollere i 70'er-plakatstil"
                className="w-full max-w-[560px] rounded-2xl border-[3px] border-ink shadow-poster-lg"
              />
              <img
                src="/fgc4v3_transparent.png"
                alt="FGC Nord badge-logo"
                className="absolute -top-16 left-1/2 w-[150px] -translate-x-1/2 animate-float md:-top-24 md:w-[220px]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. WAVE DIVIDER */}
      <div className="bg-olive">
        <WaveDivider fill="#51512A" flip className="bg-cream" />
      </div>

      {/* 3. KOMMENDE EVENTS */}
      <section className="bg-olive pb-24 pt-4 text-cream">
        <div className="mx-auto max-w-[1200px] px-6">
          <SectionHeader eyebrow="Kalender" title="Kommende events" light />
          <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
            {upcomingEvents.map((event, i) => (
              <motion.div
                key={event.id}
                className="snap-center"
                initial={{ opacity: 0, y: 40, rotate: -1.5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
              >
                <EventCard event={event} variant="olive" />
              </motion.div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              to="/turneringer"
              className="link-underline inline-flex items-center gap-2 text-[15px] font-semibold uppercase tracking-[0.02em] text-cream"
            >
              Se alle turneringer <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. HVAD ER FGC NORD */}
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 lg:grid-cols-2">
          <motion.div
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            whileInView={{ clipPath: "inset(0 0% 0 0)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <img
              src="/community-photo-1.png"
              alt="Spillere samlet omkring skærme i et nordjysk forsamlingshus"
              className="w-full rounded-2xl border-[3px] border-ink shadow-poster-lg"
            />
          </motion.div>
          <div>
            <SectionHeader eyebrow="Om os" title="Hvad er FGC Nord?" />
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="mt-6 text-[16px] leading-[1.7] text-olive md:text-[17px]"
            >
              Vi er en grassroots-forening stiftet af spillere i Nordjylland. Vi afholder ugentlige
              turneringer, træningsaftener og større events — i lokaler i Aalborg. Hos os er der
              plads til både den nysgerrige nybegynder og den garvede turneringsspiller.
            </motion.p>
            <ul className="mt-8 space-y-5">
              {VALUES.map((v, i) => (
                <motion.li
                  key={v.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: EASE, delay: i * 0.15 }}
                  className="flex items-start gap-4"
                >
                  <motion.span
                    initial={{ rotate: -90, scale: 0 }}
                    whileInView={{ rotate: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: i * 0.15 }}
                    className="mt-1"
                  >
                    <Sparkle size={22} />
                  </motion.span>
                  <div>
                    <h3 className="font-heading text-lg font-bold">{v.title}</h3>
                    <p className="text-[15px] text-olive">{v.text}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
              className="mt-9"
            >
              <Link
                to="/om"
                className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-transparent px-7 py-3 text-[15px] font-semibold uppercase tracking-[0.02em] text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink hover:text-cream"
              >
                Læs om foreningen <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. SPILLENE — pin-sektion (GSAP ScrollTrigger, isoleret komponent) */}
      <GamesPinSection />

      {/* 6. STAGE STRIKE TEASER */}
      <section className="bg-cream py-16 text-center md:py-24">
        <div className="mx-auto max-w-[820px] px-6">
          <SectionHeader eyebrow="Værktøj" title="Strike som en pro" centered />
          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-[1.7] text-olive md:text-[17px]">
            Brug vores interaktive stage strike-værktøj til Ultimate og Melee — med reglerne bygget
            ind. Perfekt til weeklies og træning.
          </p>
          <div className="mt-10 flex justify-center gap-4 overflow-x-auto px-2 pb-2">
            {TEASER_THUMBS.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 30, rotate: i % 2 === 0 ? -3 : 3 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                className="group relative w-[160px] shrink-0 md:w-[190px]"
              >
                <img
                  src={src}
                  alt="Stage thumbnail fra stage strike-værktøjet"
                  className="w-full rounded-xl border-[3px] border-ink shadow-poster"
                />
                {i === 1 && (
                  <svg
                    viewBox="0 0 100 60"
                    className="pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <line x1="8" y1="6" x2="92" y2="54" stroke="#A84434" strokeWidth="7" strokeLinecap="round" />
                    <line x1="92" y1="6" x2="8" y2="54" stroke="#A84434" strokeWidth="7" strokeLinecap="round" />
                  </svg>
                )}
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="mt-10"
          >
            <Link
              to="/stage-strike"
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-brick px-8 py-3.5 text-[15px] font-semibold uppercase tracking-[0.02em] text-cream shadow-poster transition-all duration-200 hover:-translate-y-0.5 hover:bg-brick-soft hover:shadow-poster-lg"
            >
              Prøv værktøjet <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 7. CTA */}
      <CTASection />
    </>
  );
}
