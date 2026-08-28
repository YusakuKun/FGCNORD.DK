import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Sparkle } from "@/components/Sparkle";
import { WaveDivider } from "@/components/WaveDivider";
import { SectionHeader } from "@/components/SectionHeader";
import { EventCard } from "@/components/EventCard";
import { CTASection } from "@/components/CTASection";
import { GamesPinSection } from "@/components/home/GamesPinSection";
import { HeroSection } from "@/components/home/HeroSection";
import { StageStrikeTeaser } from "@/components/home/StageStrikeTeaser";
import { upcomingEvents } from "@/data/events";

const VALUES = [
  { title: "Fællesskab først", text: "Alle er velkomne, uanset alder og niveau." },
  { title: "Grassroots", text: "Drevet af frivillige, for spillerne." },
  { title: "Lokal forankring", text: "Nordjylland er vores hjemmebane." },
];

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function Home() {
  return (
    <>
      {/* 1. HERO */}
      <HeroSection />

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
      <StageStrikeTeaser />

      {/* 7. CTA */}
      <CTASection />
    </>
  );
}
