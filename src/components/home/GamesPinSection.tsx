import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Sparkle } from "@/components/Sparkle";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const GAMES = [
  {
    navn: "SUPER SMASH BROS. MELEE",
    tekst: "Klassikeren fra 2001. Hurtig, teknisk og stadig levende. Vi har CRT'er og GameCubes klar hver uge.",
    chip: "GameCube · CRT",
  },
  {
    navn: "SUPER SMASH BROS. ULTIMATE",
    tekst: "Danmarks største smash-scene. Vores ugentlige turneringer kører med selvbetjent tilmelding via start.gg — nemt for alle.",
    chip: "Switch · Weeklys",
  },
  {
    navn: "RIVALS OF AETHER 2",
    tekst: "Den nye platform fighter på blokken. Kom og vær med fra starten — vi bygger scenen op sammen.",
    chip: "PC · Ny scene",
  },
];

/** Pin-sektion på coal: ét spil i fokus ad gangen, scrub-skrift + progress-bar. GSAP isoleret her. */
function GamesPinSection() {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;
      const panels = gsap.utils.toArray<HTMLElement>(".game-panel");
      gsap.set(panels, { autoAlpha: 0, y: 60 });
      gsap.set(panels[0], { autoAlpha: 1, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            const idx = Math.min(2, Math.floor(self.progress * 3));
            setActive(idx);
            gsap.to(".game-progress-fill", { scaleY: self.progress, overwrite: "auto", duration: 0.1 });
          },
        },
      });

      panels.forEach((panel, i) => {
        if (i === 0) return;
        tl.to(panels[i - 1], { autoAlpha: 0, y: -60, duration: 0.4 }, i)
          .to(panel, { autoAlpha: 1, y: 0, duration: 0.4 }, i + 0.1);
      });
    },
    { scope: container }
  );

  return (
    <section ref={container} className="halftone-dark relative bg-coal text-cream">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1200px] flex-col justify-center px-6 py-24">
        <div className="relative pl-8 md:pl-14">
          {/* Progress-bar i venstre kant */}
          <div className="absolute left-0 top-1/2 h-48 w-[6px] -translate-y-1/2 rounded-full bg-cream/15">
            <div
              className="game-progress-fill h-full w-full origin-top rounded-full bg-brick"
              style={{ transform: "scaleY(0)" }}
            />
          </div>

          <div className="flex items-baseline justify-between gap-6">
            <h2 className="font-display text-[34px] uppercase leading-[1.05] tracking-[-0.01em] md:text-[56px]">
              Vi spiller
            </h2>
            <span className="font-heading text-xl font-extrabold tracking-[-0.02em] text-brick-soft md:text-2xl">
              0{active + 1}/03
            </span>
          </div>

          <div className="relative mt-14 min-h-[280px] md:min-h-[240px]">
            {GAMES.map((g) => (
              <div key={g.navn} className="game-panel absolute inset-0">
                <h3 className="font-display text-[30px] uppercase leading-[1.05] text-cream md:text-[48px]">
                  {g.navn}
                </h3>
                <p className="mt-5 max-w-xl text-[16px] leading-[1.7] text-cream/80 md:text-[17px]">
                  {g.tekst}
                </p>
                <span className="mt-6 inline-block rounded-full border-2 border-cream/50 px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-cream/85">
                  {g.chip}
                </span>
                <Sparkle size={30} className="mt-6 block" color="#C96A58" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GamesPinSection;
export { GamesPinSection };
