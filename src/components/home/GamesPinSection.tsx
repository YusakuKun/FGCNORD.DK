import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

gsap.registerPlugin(ScrollTrigger);

interface GamePin {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  banner: string;
}

const games: GamePin[] = [
  {
    id: "melee",
    name: "Super Smash Bros. Melee",
    tagline: "Spillet der aldrig dør",
    description:
      "Melee-scenen i Nordjylland er kompakt men dedikeret. Vi kører ugentlige weeklies med CRT'er, streams de fleste bracket-runder og sender hvert år spillere til nationals og EU-majors.",
    href: "/raekkefoelge#melee",
    banner: "/stage-strike-banner.jpg?v=2",
  },
  {
    id: "ultimate",
    name: "Super Smash Bros. Ultimate",
    tagline: "Danmarks største smash-scene",
    description:
      "Ultimate trækker de største deltagerfelter i regionen. Fra helt nye spillere til landets bedste — alle er velkomne ved vores weeklies, og ranglisten opdateres efter hver turnering.",
    href: "/raekkefoelge#ultimate",
    banner: "/stage-strike-banner-ultimate.jpg?v=2",
  },
  {
    id: "roa2",
    name: "Rivals of Aether 2",
    tagline: "Den nye platform fighter",
    description:
      "RoA2 er det nyeste skud på stammen i FGC Nord. Scenen vokser hurtigt, og vi afholder løbende side-events og turneringer — perfekt hvis du vil være med fra starten.",
    href: "/raekkefoelge#roa2",
    banner: "/hero-roa2.png",
  },
  {
    id: "mkwii",
    name: "Mario Kart Wii",
    tagline: "Side-events og retro-hygge",
    description:
      "Mario Kart Wii er vores evigt populære side-event: Retro-konsoller, items på fuld blus og kaos på Rainbow Road. Perfekt opvarmning eller paus under de store brackets.",
    href: "/raekkefoelge#mkwii",
    banner: "/stage-strike-banner-mkwii.jpg?v=2",
  },
];

export default function GamesPinSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".game-pin-panel");

      const tween = gsap.to(track, {
        xPercent: -100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * (panels.length - 1)}`,
          pin: true,
          scrub: 1,
          snap: {
            snapTo: 1 / (panels.length - 1),
            duration: { min: 0.15, max: 0.45 },
            ease: "power1.inOut",
          },
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      panels.forEach((panel) => {
        const img = panel.querySelector(".game-pin-bg");
        if (!img) return;
        gsap.fromTo(
          img,
          { scale: 1.12 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-ink">
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 bg-gradient-to-b from-ink/80 to-transparent px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <SectionHeading
          dark
          kicker="Spil hos FGC Nord"
          title="Fire scener — ét nordjysk fællesskab"
        />
      </div>

      <div
        ref={trackRef}
        className="flex h-screen w-[400vw] will-change-transform"
      >
        {games.map((game, i) => (
          <article
            key={game.id}
            className="game-pin-panel relative flex h-screen w-screen shrink-0 items-end overflow-hidden"
          >
            <img
              src={game.banner}
              alt=""
              aria-hidden="true"
              className="game-pin-bg absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/20" />

            <div className="relative z-10 w-full px-4 pb-16 sm:px-6 lg:px-8">
              <div className="container-site">
                <p className="font-mono text-sm font-semibold text-brick-soft">
                  {String(i + 1).padStart(2, "0")} / {String(games.length).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-3xl font-bold text-cream sm:text-5xl">
                  {game.name}
                </h3>
                <p className="mt-2 text-lg font-medium text-brick-soft">
                  {game.tagline}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream/75 sm:text-base">
                  {game.description}
                </p>
                <Link
                  to={game.href}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brick px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brick-soft hover:text-coal"
                >
                  Se ranglisten
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
