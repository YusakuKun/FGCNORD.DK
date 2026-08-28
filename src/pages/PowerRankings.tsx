import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/PageHeader";
import {
  PR_EDITIONS,
  PR_GAME_COLORS,
  PR_GAME_LABELS,
  type PrEdition,
} from "@/data/powerRankings";

function EditionCard({ edition, index }: { edition: PrEdition; index: number }) {
  const color = PR_GAME_COLORS[edition.game];
  const top3 = edition.players.filter((p) => p.rank <= 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: index % 2 === 0 ? -1 : 1 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
    >
      <Link
        to={`/pr/${edition.slug}`}
        className="group block rounded-2xl border-[3px] border-cream/15 bg-ink/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brick hover:shadow-[0_8px_32px_rgba(0,174,239,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick-soft"
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-coal"
            style={{ backgroundColor: color }}
          >
            {PR_GAME_LABELS[edition.game]}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream/40">
            {edition.code}
          </span>
        </div>

        <h2 className="mt-4 font-display text-2xl uppercase text-cream sm:text-3xl">
          {edition.quarter}
        </h2>
        <p className="mt-1 text-sm text-cream/60">{edition.period}</p>

        <ol className="mt-5 space-y-1.5">
          {top3.map((p) => (
            <li key={p.tag} className="flex items-center gap-3 text-sm">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-display text-xs font-bold text-coal"
                style={{ backgroundColor: color }}
              >
                {p.rank}
              </span>
              <span className="font-heading font-bold text-cream">{p.tag}</span>
            </li>
          ))}
        </ol>

        <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-brick-soft transition-transform duration-200 group-hover:translate-x-1">
          Se hele listen <ArrowRight size={15} aria-hidden="true" />
        </span>
      </Link>
    </motion.div>
  );
}

export function PowerRankings() {
  return (
    <div className="min-h-screen bg-coal pb-20 text-cream">
      <PageHeader
        eyebrow="Arkiv"
        title="Power Rankings"
        description="Kvartalsvise ranglister over Nordjyllands bedste spillere — udarbejdet af et panel på baggrund af turneringresultater. Én udgave per spil per kvartal."
      />

      <div className="container-site px-4 py-10 sm:px-6 lg:px-8">
        {PR_EDITIONS.length === 0 ? (
          <p className="text-cream/60">Ingen ranglister endnu — første udgave er på vej.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PR_EDITIONS.map((e, i) => (
              <EditionCard key={e.slug} edition={e} index={i} />
            ))}
          </div>
        )}

        <div className="mt-14 rounded-2xl border-2 border-brick/30 bg-ink/60 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <TrendingUp className="mt-1 h-6 w-6 shrink-0 text-brick" aria-hidden="true" />
            <div>
              <h2 className="font-heading text-lg font-bold text-cream">
                Sådan laver vi ranglisterne
              </h2>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-cream/75">
                Et panel af erfarne spillere fra community'et vurderer hvert kvartal
                resultaterne fra vores weeklies, månedlige turneringer og større events
                som HimmerLAN. Placeringer, modstanderstyrke og konsistens tæller.
                Synes du, at du mangler på listen? Bevis det på banen — tilmeld dig
                næste turnering og gør det umuligt at overse dig.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
