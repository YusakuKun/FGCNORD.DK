import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { Sparkle } from "@/components/Sparkle";
import { HeroDecor } from "./HeroDecor";
import { DiscordIcon, DISCORD_URL } from "@/components/Navbar";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const STATS = [
  { icon: Users, value: "50+", label: "Spillere" },
  { icon: Calendar, value: "Ugentligt", label: "Events" },
  { icon: MapPin, value: "Aalborg", label: "Nordjylland" },
];

const GAME_CHIPS = [
  { label: "Melee", color: "bg-red-500" },
  { label: "Ultimate", color: "bg-blue-500" },
  { label: "RoA2", color: "bg-emerald-500" },
];

function HeroSection() {
  return (
    <section className="halftone relative overflow-hidden bg-cream">
      <HeroDecor />
      <div className="relative mx-auto flex min-h-[92vh] max-w-[1200px] flex-col justify-center px-6 py-20 lg:py-0">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text content */}
          <div className="relative z-10 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-1.5 shadow-poster-sm"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-brick" />
              <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink">
                Forening for platform fighters
              </span>
            </motion.div>

            <h1 className="font-display text-[52px] uppercase leading-[0.95] tracking-[-0.03em] text-ink sm:text-[72px] md:text-[90px] lg:text-[84px] xl:text-[100px]">
              {"NORDJYLLANDS".split("").map((char, i) => (
                <motion.span
                  key={`n1-${i}`}
                  className="inline-block"
                  initial={{ y: "110%", rotate: 6 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.03 }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
              <br />
              {"HJEM FOR".split("").map((char, i) => (
                <motion.span
                  key={`n2-${i}`}
                  className="inline-block"
                  initial={{ y: "110%", rotate: 6 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.35 + i * 0.03 }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
              <br />
              <motion.span
                className="inline-block text-brick"
                initial={{ y: "110%", rotate: 6 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.65 }}
              >
                SMASH
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="mt-6 max-w-md text-[17px] leading-[1.7] text-olive md:text-[18px]"
            >
              Kom og spil Melee, Ultimate og Rivals of Aether 2 med os. Alle niveauer er velkomne —
              fra første smash til evo-top 8.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/bliv-medlem"
                className="group inline-flex items-center gap-2.5 rounded-full border-[3px] border-ink bg-brick px-8 py-3.5 text-[15px] font-semibold uppercase tracking-[0.02em] text-cream shadow-poster transition-all duration-200 hover:-translate-y-1 hover:bg-brick-soft hover:shadow-poster-lg"
              >
                Bliv medlem
                <Sparkle size={16} color="#F7F1E6" className="transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
              </Link>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full border-[3px] border-ink bg-cream px-8 py-3.5 text-[15px] font-semibold uppercase tracking-[0.02em] text-ink shadow-poster-sm transition-all duration-200 hover:-translate-y-1 hover:bg-ink hover:text-cream"
              >
                <DiscordIcon size={18} /> Join Discord
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.15 }}
              className="mt-8 flex flex-wrap gap-2"
            >
              {GAME_CHIPS.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-cream px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] shadow-poster-sm"
                >
                  <span className={`h-2 w-2 rounded-full ${chip.color}`} />
                  {chip.label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Hero image */}
          <div className="relative z-10 order-1 flex items-center justify-center lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.3 }}
              className="relative"
            >
              {/* Background decorative frame */}
              <div className="absolute -right-5 -top-5 -z-10 h-full w-full rounded-2xl border-[3px] border-ink bg-olive shadow-poster" />
              <div className="absolute -bottom-5 -left-5 -z-10 h-full w-full rounded-2xl border-[3px] border-ink bg-brick shadow-poster" />

              <img
                src="/hero-illustration.png"
                alt="Illustration af to krydsede spilcontrollere i 70'er-plakatstil"
                className="relative w-full max-w-[520px] rounded-2xl border-[3px] border-ink bg-cream shadow-poster-lg"
              />

              <motion.img
                src="/fgc4v3_transparent.png"
                alt="FGC Nord badge-logo"
                className="absolute -left-8 -top-12 w-[140px] drop-shadow-[4px_4px_0_#141413] md:-left-12 md:-top-16 md:w-[180px]"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                className="absolute -bottom-4 -right-4 rounded-xl border-[3px] border-ink bg-cream px-4 py-3 shadow-poster"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-olive">Næste weekly</p>
                <p className="font-heading text-lg font-bold text-ink">Fredag 18:00</p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          className="relative z-10 mt-16 grid grid-cols-3 gap-4 border-y-[3px] border-ink bg-cream py-5 shadow-poster sm:flex sm:justify-center sm:gap-12 lg:absolute lg:bottom-10 lg:left-6 lg:right-6 lg:grid lg:grid-cols-3 lg:gap-4"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center gap-1 text-center"
            >
              <stat.icon className="h-5 w-5 text-brick" />
              <span className="font-display text-xl leading-none text-ink sm:text-2xl">{stat.value}</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-olive">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export { HeroSection };
export default HeroSection;
