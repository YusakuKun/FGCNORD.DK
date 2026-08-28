import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Construction,
  HeartHandshake,
  Home,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";

import { Sparkle } from "@/components/Sparkle";
import { Button } from "@/components/ui/button";

interface PageMeta {
  title: string;
  description: string;
  emoji: string;
  suggestions: { label: string; to: string; icon: ReactNode }[];
}

const pageMeta: Record<string, PageMeta> = {
  "/turneringer": {
    title: "Kalender / Turneringer",
    description:
      "Vi er ved at sætte scenen op, finde controllerne frem og skrive kampplanen. Snart kan du se alle kommende events og turneringer fra FGC Nord.",
    emoji: "🏆",
    suggestions: [
      { label: "Gå til forsiden", to: "/", icon: <Home className="h-4 w-4" /> },
      { label: "Læs om foreningen", to: "/om", icon: <Users className="h-4 w-4" /> },
    ],
  },
  "/om": {
    title: "Om foreningen",
    description:
      "Mens vi pudser historiebøgerne og finder det flotte bestyrelsesfoto frem, kan du kigge forbi vores andre sider.",
    emoji: "🛠️",
    suggestions: [
      { label: "Gå til forsiden", to: "/", icon: <Home className="h-4 w-4" /> },
      { label: "Bliv medlem", to: "/bliv-medlem", icon: <HeartHandshake className="h-4 w-4" /> },
    ],
  },
  "/bliv-medlem": {
    title: "Bliv medlem",
    description:
      "Medlemsformularen er ved at blive tunet til perfektion. Indtil da kan du læse mere om FGC Nord eller tjekke kommende turneringer.",
    emoji: "✨",
    suggestions: [
      { label: "Gå til forsiden", to: "/", icon: <Home className="h-4 w-4" /> },
      { label: "Se turneringer", to: "/turneringer", icon: <CalendarDays className="h-4 w-4" /> },
    ],
  },
};

const notFoundMeta: PageMeta = {
  title: "404 — Siden findes ikke",
  description:
    "Ups! Det ser ud til, at du er landet på en side, der ikke findes. Måske er den flyttet, måske er den stadig under opbygning, eller måske tastede du forkert i kampens hede.",
  emoji: "🕹️",
  suggestions: [
    { label: "Gå til forsiden", to: "/", icon: <Home className="h-4 w-4" /> },
    { label: "Se turneringer", to: "/turneringer", icon: <CalendarDays className="h-4 w-4" /> },
    { label: "Bliv medlem", to: "/bliv-medlem", icon: <HeartHandshake className="h-4 w-4" /> },
  ],
};

const quickLinks = [
  { label: "Forsiden", to: "/" },
  { label: "Turneringer", to: "/turneringer" },
  { label: "Om os", to: "/om" },
  { label: "Bliv medlem", to: "/bliv-medlem" },
];

export function Placeholder() {
  const { pathname } = useLocation();
  const is404 = !pageMeta[pathname];
  const meta = pageMeta[pathname] || notFoundMeta;

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-cream px-4 py-24 text-center sm:px-6 lg:px-8">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -left-16 top-24 h-64 w-64 rounded-full bg-brick"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute -right-20 bottom-32 h-80 w-80 rounded-full bg-olive"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl"
      >
        {/* Illustration card */}
        <div className="mb-10 flex justify-center">
          <motion.div
            initial={{ rotate: -2 }}
            animate={{ rotate: 2 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 3,
              ease: "easeInOut",
            }}
            className="relative inline-block rounded-3xl border-2 border-ink bg-cream-dim p-8 shadow-poster-lg"
          >
            {is404 ? (
              <div className="relative">
                <Search className="h-20 w-20 text-ink" strokeWidth={1.5} />
                <Sparkle
                  size={28}
                  color="#A84434"
                  className="absolute -right-4 -top-3 animate-spin-slow"
                />
              </div>
            ) : (
              <div className="relative">
                <Construction
                  className="h-20 w-20 text-brick"
                  strokeWidth={1.5}
                />
                <Sparkle
                  size={28}
                  color="#51512A"
                  className="absolute -right-4 -top-3 animate-spin-slow"
                />
                <ShieldAlert
                  className="absolute -bottom-2 -left-3 h-8 w-8 text-olive"
                  strokeWidth={2}
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-1.5 font-heading text-sm font-semibold text-ink shadow-poster-sm"
        >
          <span className="text-base">{meta.emoji}</span>
          {is404 ? "Siden findes ikke" : "Under opbygning"}
        </motion.div>

        {/* Typography */}
        <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          {meta.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink/75 sm:text-xl">
          {meta.description}
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {meta.suggestions.map((suggestion, index) => (
            <Button
              key={suggestion.to}
              asChild
              size="lg"
              variant={index === 0 ? "default" : "outline"}
              className={
                index === 0
                  ? "bg-brick text-cream hover:bg-brick-soft"
                  : "border-2 border-ink hover:bg-ink hover:text-cream"
              }
            >
              <Link to={suggestion.to}>
                {suggestion.icon}
                {suggestion.label}
              </Link>
            </Button>
          ))}
          {is404 && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-ink hover:bg-ink hover:text-cream"
              onClick={() => window.history.back()}
            >
              <span className="cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Gå tilbage
              </span>
            </Button>
          )}
        </div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-14 rounded-2xl border-2 border-ink bg-cream p-6 shadow-poster sm:p-8"
        >
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-ink/60">
            Eller prøv en af disse sider
          </p>
          <nav className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-md border-2 border-ink/10 bg-cream-dim px-4 py-2 font-heading text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </motion.div>
      </motion.div>
    </section>
  );
}
