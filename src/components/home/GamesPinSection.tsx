import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Sparkle } from "@/components/Sparkle";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const GAMES: Array<{
  id: string;
  navn: string;
  logo?: string;
  /** Banner-grafik i stedet for logo (fx spil uden eget logo-asset) */
  banner?: string;
  tekst: string;
  chip: string;
  bg: string;
  accent: string;
}> = [
  {
    id: "melee",
    navn: "SUPER SMASH BROS. MELEE",
    logo: "/game-logos/melee-logo.svg",
    tekst: "Klassikeren fra 2001. Hurtig, teknisk og stadig levende. Vi har CRT'er og GameCubes klar hver uge.",
    chip: "GameCube · CRT",
    bg: "from-red-900/40 via-orange-900/30 to-coal",
    accent: "#FF4500",
  },
  {
    id: "ultimate",
    navn: "SUPER SMASH BROS. ULTIMATE",
    logo: "/game-logos/ultimate-logo.svg",
    tekst: "Danmarks største smash-scene. Vores ugentlige turneringer kører med selvbetjent tilmelding via start.gg — nemt for alle.",
    chip: "Switch · Weeklys",
    bg: "from-red-900/40 via-yellow-900/20 to-coal",
    accent: "#FFD200",
  },
  {
    id: "rivals2",
    navn: "RIVALS OF AETHER 2",
    logo: "/game-logos/rivals2-logo.png",
    tekst: "Den nye platform fighter på blokken. Kom og vær med fra starten — vi bygger scenen op sammen.",
    chip: "PC · Ny scene",
    bg: "from-emerald-900/30 via-teal-900/20 to-coal",
    accent: "#4FD1C5",
  },
  {
    id: "mkwii",
    navn: "MARIO KART WII",
    banner: "/gallery-himmerlan-mkwii.jpg",
    tekst: "Vores elskede side-event. Når bracket er færdig, ryger hjulene på — alle kan være med, og heldet kan vende på sidste omgang.",
    chip: "Wii · Side-events",
    bg: "from-lime-900/30 via-green-900/20 to-coal",
    accent: "#95D600",
  },
];

/**
 * Pin-sektion på coal: ét spil i fokus ad gangen.
 * Synlighed styres af React-state (CSS-transitions) — GSAP står KUN for
 * pin + scroll-progress, så layoutet aldrig overlapper, selv hvis GSAP
 * ikke initialiserer (fx reduced motion eller script-fejl).
 */
function GamesPinSection() {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !container.current) return;

      ScrollTrigger.create({
        trigger: container.current,
        start: "top top",
        end: `+=${(GAMES.length - 1) * 100}%`,
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          setActive(Math.min(GAMES.length - 1, Math.floor(self.progress * GAMES.length)));
          setProgress(self.progress);
        },
      });
    },
    { scope: container }
  );

  return (
    <section ref={container} className="relative overflow-hidden bg-coal text-cream">
      {/* Baggrundsgradient der skifter subtilt */}
      {GAMES.map((g, i) => (
        <div
          key={g.id}
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${g.bg} transition-opacity duration-700 ${
            active === i ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
      ))}

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1200px] flex-col justify-center px-6 py-24">
        <div className="relative pl-8 md:pl-14">
          {/* Progress-bar i venstre kant */}
          <div className="absolute left-0 top-1/2 h-48 w-[6px] -translate-y-1/2 rounded-full bg-cream/15">
            <div
              className="h-full w-full origin-top rounded-full bg-brick"
              style={{ transform: `scaleY(${progress})` }}
            />
          </div>

          <div className="flex items-baseline justify-between gap-6">
            <h2 className="font-display text-[34px] uppercase leading-[1.05] tracking-[-0.01em] md:text-[56px]">
              Vi spiller
            </h2>
            <span className="font-heading text-xl font-extrabold tracking-[-0.02em] text-brick-soft md:text-2xl">
              0{active + 1}/0{GAMES.length}
            </span>
          </div>

          <div className="relative mt-14 min-h-[380px] md:min-h-[340px]">
            {GAMES.map((g, i) => {
              const isActive = active === i;
              return (
                <div
                  key={g.id}
                  className="game-panel absolute inset-0 flex flex-col justify-center transition-all duration-500 ease-out"
                  style={{
                    opacity: isActive ? 1 : 0,
                    visibility: isActive ? "visible" : "hidden",
                    transform: isActive
                      ? "translateY(0) scale(1)"
                      : `translateY(${i < active ? -40 : 40}px) scale(0.97)`,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  aria-hidden={!isActive}
                >
                  <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center">
                    <div className="flex w-full max-w-[320px] items-center justify-center overflow-hidden rounded-2xl border-[3px] border-ink bg-cream shadow-poster-lg">
                      {g.banner ? (
                        <img
                          src={g.banner}
                          alt={g.navn}
                          className="aspect-[16/10] w-full object-cover"
                        />
                      ) : (
                        <img
                          src={g.logo}
                          alt={g.navn}
                          className="h-auto w-full max-w-[260px] object-contain p-6 lg:p-8"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-[30px] uppercase leading-[1.05] text-cream md:text-[48px]">
                        {g.navn}
                      </h3>
                      <p className="mt-5 max-w-xl text-[16px] leading-[1.7] text-cream/80 md:text-[17px]">
                        {g.tekst}
                      </p>
                      <span
                        className="mt-6 inline-block rounded-full border-2 border-cream/50 px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-cream/85"
                        style={{ borderColor: `${g.accent}80`, color: g.accent }}
                      >
                        {g.chip}
                      </span>
                      <Sparkle size={30} className="mt-6 block" color={g.accent} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GamesPinSection;
export { GamesPinSection };
