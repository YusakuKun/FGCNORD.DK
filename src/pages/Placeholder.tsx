import { motion } from "framer-motion";
import { ArrowLeft, Construction, Home } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

import { Sparkle } from "@/components/Sparkle";
import { Button } from "@/components/ui/button";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/turneringer": {
    title: "Kalender / Turneringer",
    description: "Se kommende events og turneringer fra FGC Nord.",
  },
  "/om": {
    title: "Om foreningen",
    description: "Læs mere om FGC Nords historie, bestyrelse og værdier.",
  },
  "/bliv-medlem": {
    title: "Bliv medlem",
    description: "Tilmeld dig FGC Nord og bliv en del af communityet.",
  },
};

export function Placeholder() {
  const { pathname } = useLocation();
  const is404 = !pageMeta[pathname];
  const meta = pageMeta[pathname] || {
    title: "404 — Siden findes ikke",
    description:
      "Den side du leder efter, findes ikke. Tjek URL'en eller gå tilbage til forsiden.",
  };

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-4 py-20 text-center sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Construction className="h-16 w-16 text-brick" />
            <Sparkle
              size={24}
              className="absolute -right-2 -top-2 animate-spin-slow"
            />
          </div>
        </div>

        <h1 className="font-display text-4xl text-ink sm:text-5xl lg:text-6xl">
          {meta.title}
        </h1>
        <p className="mt-4 text-lg text-ink/70 sm:text-xl">
          {meta.description}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-brick text-cream hover:bg-brick-soft"
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Til forsiden
            </Link>
          </Button>
          {is404 && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-ink"
            >
              <Link to="/turneringer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Gå tilbage
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
    </section>
  );
}
