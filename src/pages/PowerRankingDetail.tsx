import { motion } from "framer-motion";
import { ArrowLeft, ArrowUp, ArrowDown, Minus, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  getPrEdition,
  PR_GAME_COLORS,
  PR_GAME_LABELS,
  type PrPlayer,
} from "@/data/powerRankings";
import { Placeholder } from "@/pages/Placeholder";

function Movement({ m }: { m?: number | "new" }) {
  if (m === "new")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brick/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brick-soft">
        <Sparkles size={12} aria-hidden="true" /> Ny
      </span>
    );
  if (typeof m === "number" && m > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[13px] font-bold text-emerald-400">
        <ArrowUp size={14} aria-hidden="true" /> {m}
      </span>
    );
  if (typeof m === "number" && m < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[13px] font-bold text-red-400">
        <ArrowDown size={14} aria-hidden="true" /> {Math.abs(m)}
      </span>
    );
  return (
    <span className="inline-flex items-center text-cream/30" aria-label="Uændret">
      <Minus size={14} aria-hidden="true" />
    </span>
  );
}

function PlayerRow({ player, color, index }: { player: PrPlayer; color: string; index: number }) {
  const podium = player.rank <= 3;
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={
        podium
          ? "rounded-xl border-2 bg-ink/70 p-5"
          : "rounded-xl border-2 border-white/10 bg-ink/50 p-4"
      }
      style={podium ? { borderColor: color } : undefined}
    >
      <div className="flex items-center gap-4">
        <span
          className={`flex shrink-0 items-center justify-center rounded-lg font-display font-bold text-coal ${
            podium ? "h-12 w-12 text-xl" : "h-9 w-9 text-sm"
          }`}
          style={{ backgroundColor: color }}
        >
          {player.rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3
              className={`font-heading font-bold text-cream ${
                podium ? "text-xl sm:text-2xl" : "text-base"
              }`}
            >
              {player.tag}
            </h3>
            <Movement m={player.movement} />
          </div>
          {player.characters && (
            <p className="mt-0.5 text-sm text-cream/55">{player.characters}</p>
          )}
        </div>
      </div>
      {player.blurb && (
        <p className="mt-3 border-l-2 pl-4 text-[15px] leading-relaxed text-cream/75" style={{ borderColor: color }}>
          {player.blurb}
        </p>
      )}
    </motion.li>
  );
}

export function PowerRankingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const edition = slug ? getPrEdition(slug) : undefined;

  if (!edition) return <Placeholder />;

  const color = PR_GAME_COLORS[edition.game];

  return (
    <div className="min-h-screen bg-coal pb-20 text-cream">
      <div className="container-site px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          to="/pr"
          className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold uppercase tracking-wide text-brick-soft hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick-soft"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Alle power rankings
        </Link>
      </div>

      <header className="container-site px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-coal"
            style={{ backgroundColor: color }}
          >
            {PR_GAME_LABELS[edition.game]}
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-cream/40">
            {edition.code}
          </span>
        </div>
        <h1 className="mt-4 font-display text-4xl uppercase text-cream sm:text-5xl md:text-6xl">
          {edition.quarter}
        </h1>
        <p className="mt-2 text-sm text-cream/55">
          Vurderingsperiode: {edition.period} · Offentliggjort{" "}
          {new Date(edition.published).toLocaleDateString("da-DK", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="mt-5 max-w-2xl text-[16px] leading-[1.7] text-cream/80">
          {edition.intro}
        </p>
      </header>

      <div className="container-site px-4 sm:px-6 lg:px-8">
        <ol className="space-y-4">
          {edition.players.map((p, i) => (
            <PlayerRow key={p.tag} player={p} color={color} index={i} />
          ))}
        </ol>

        {edition.honorableMentions && edition.honorableMentions.length > 0 && (
          <div className="mt-10 rounded-xl border-2 border-white/10 bg-ink/50 p-5">
            <h2 className="font-heading text-base font-bold uppercase tracking-wide text-cream/80">
              Honorable mentions
            </h2>
            <ul className="mt-2 space-y-1 text-[15px] text-cream/65">
              {edition.honorableMentions.map((hm) => (
                <li key={hm}>• {hm}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-10 text-sm text-cream/45">
          Udset af: {edition.panel.join(", ")}. Ranglister er subjektive — men aldrig
          personlige. Vi ses på banen. 🎮
        </p>
      </div>
    </div>
  );
}
