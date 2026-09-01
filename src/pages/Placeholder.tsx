import { motion } from "framer-motion";
import { Home, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Sparkle } from "@/components/Sparkle";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/turneringer": {
    title: "Kalender / Turneringer",
    description: "Se kommende events og turneringer fra FGC Nord.",
  },
  "/om": {
    title: "Om fællesskabet",
    description: "Læs mere om FGC Nords historie, crew og værdier.",
  },
  "/bliv-medlem": {
    title: "Bliv medlem",
    description: "Tilmeld dig FGC Nord og bliv en del af communityet.",
  },
};

export function Placeholder() {
  const { pathname } = useLocation();
  const meta = pageMeta[pathname] || {
    title: "404 — Du blev staget ud",
    description:
      "Den her side er rykket ud af rotationen. Tjek URL'en — eller hop tilbage til main stage og find kampene der.",
  };

  return (
    <section className="halftone-dark flex min-h-[70vh] flex-col items-center justify-center bg-coal px-4 py-24 text-center sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <div className="relative mb-8 flex justify-center">
          <Sparkle size={64} color="#00AEEF" className="animate-spin-slow" />
          <Sparkle size={22} color="#4FC3F7" className="absolute -left-8 top-2 animate-float" />
          <Sparkle size={16} color="#F4F8FB" className="absolute -right-6 bottom-0 animate-float" />
        </div>

        <p className="font-heading text-sm font-bold uppercase tracking-[0.24em] text-brick-soft">
          Ingen stock her
        </p>
        <h1 className="mt-3 font-display text-4xl uppercase leading-tight text-cream sm:text-5xl lg:text-6xl">
          {meta.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-cream/80 sm:text-xl">
          {meta.description}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-brick px-8 py-3.5 text-[15px] font-semibold uppercase tracking-[0.02em] text-ink shadow-poster-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brick-soft"
          >
            <Home size={18} aria-hidden="true" />
            Tilbage til main stage
          </Link>
          <Link
            to="/turneringer"
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-cream/60 bg-transparent px-8 py-3.5 text-[15px] font-semibold uppercase tracking-[0.02em] text-cream transition-all duration-200 hover:-translate-y-0.5 hover:border-brick-soft hover:text-brick-soft"
          >
            <Trophy size={18} aria-hidden="true" />
            Se turneringer
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
