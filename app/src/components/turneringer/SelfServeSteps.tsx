import { CheckSquare, ClipboardList, Gamepad2, UserPlus } from "lucide-react";

import { SectionHeader } from "@/components/SectionHeader";
import { Sparkle } from "@/components/Sparkle";

const steps = [
  {
    icon: UserPlus,
    title: "Tilmeld dig online",
    text: "Find eventet på start.gg/fgcnord og tilmeld dig hjemmefra. Det tager under et minut — og du kan altid afmelde igen.",
  },
  {
    icon: CheckSquare,
    title: "Check ind",
    text: "Mød op (eller hop online) og check ind via start.gg senest 10 minutter før start. Så ved bracket-botten, at du er klar.",
  },
  {
    icon: Gamepad2,
    title: "Spil dine kampe",
    text: "Følg din bracket, find din modstander og spil kampen. Er du i tvivl om regler, sidder erfarne spillere altid ved siden af.",
  },
  {
    icon: ClipboardList,
    title: "Indberet selv resultatet",
    text: "Vinderen indberetter resultatet direkte på start.gg. Bracket opdateres automatisk — ingen turneringsleder påkrævet.",
  },
];

/** 4-trins forklaring af det selvbetjente turneringsformat */
export function SelfServeSteps() {
  return (
    <section className="section-padding border-t-2 border-ink bg-ink text-cream">
      <div className="container-site px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <Sparkle
            color="#4FC3F7"
            size={28}
            className="absolute -top-2 right-0 hidden md:block"
          />
          <SectionHeader
            eyebrow="Selvbetjent format"
            title="Sådan kører vores turneringer"
            description="Alle vores events kører uden dedikeret turneringsleder. Du klarer det hele selv — fra tilmelding til indberetning — direkte på start.gg."
            light
          />
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="relative flex h-full flex-col rounded-2xl border-2 border-cream/25 bg-cream/5 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brick hover:bg-cream/10"
              >
                <span
                  className="absolute -top-3 left-5 rounded-full border-2 border-ink bg-brick px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-widest text-ink"
                  aria-hidden="true"
                >
                  Trin {i + 1}
                </span>
                <Icon
                  className="mt-3 h-7 w-7 text-brick-soft"
                  aria-hidden="true"
                />
                <h3 className="mt-3 font-heading text-lg font-bold text-cream">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">
                  {step.text}
                </p>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 text-center text-sm text-cream/60">
          Kort sagt: tilmeld → check ind → spil → indberet.{" "}
          <a
            href="https://start.gg/fgcnord"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-brick-soft underline decoration-2 underline-offset-2 hover:text-brick"
          >
            start.gg/fgcnord
          </a>
        </p>
      </div>
    </section>
  );
}
