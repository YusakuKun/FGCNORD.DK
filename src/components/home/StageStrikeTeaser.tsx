import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Ban, Check, Swords } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { Sparkle } from "@/components/Sparkle";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Vælg spil", desc: "Ultimate eller Melee" },
  { label: "Strike 1-2-1", desc: "Fjern stages efter tur" },
  { label: "Rapporter vinder", desc: "Værktøjet holder score" },
  { label: "Counter-pick", desc: "DSR bygget ind" },
];

const MOCK_STAGES = [
  { name: "Battlefield", state: "idle" },
  { name: "Final Destination", state: "striked" },
  { name: "Smashville", state: "picked" },
  { name: "Town & City", state: "idle" },
];

function StageStrikeTeaser() {
  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: content */}
          <div>
            <SectionHeader eyebrow="Værktøj" title="Strike som en pro" />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-2 max-w-md text-[17px] leading-[1.7] text-olive"
            >
              Brug vores interaktive stage strike-værktøj til Ultimate og Melee — med reglerne
              bygget ind. Perfekt til weeklies og træning.
            </motion.p>

            <div className="mt-8 space-y-3">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-4 rounded-xl border-2 border-ink bg-cream p-3 shadow-poster-sm transition-all hover:-translate-x-1 hover:bg-cream-dim"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brick font-display text-sm text-cream">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-heading font-bold text-ink">{step.label}</p>
                    <p className="text-sm text-olive">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              <Link
                to="/stage-strike"
                className="group inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-brick px-8 py-3.5 text-[15px] font-semibold uppercase tracking-[0.02em] text-cream shadow-poster transition-all duration-200 hover:-translate-y-0.5 hover:bg-brick-soft hover:shadow-poster-lg"
              >
                <Swords className="h-4 w-4" />
                Prøv værktøjet
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Right: mock UI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -right-4 -top-4 -z-10 h-full w-full rounded-2xl border-[3px] border-ink bg-olive shadow-poster" />
            <div className="overflow-hidden rounded-2xl border-[3px] border-ink bg-cream-dim p-5 shadow-poster-lg">
              {/* Mock toolbar */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="rounded-full bg-brick px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cream">
                    Ultimate
                  </span>
                  <span className="rounded-full border-2 border-ink bg-cream px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
                    Melee
                  </span>
                </div>
                <Sparkle size={20} />
              </div>

              {/* Mock status */}
              <div className="mb-4 rounded-xl border-2 border-ink bg-cream p-3 shadow-poster-sm">
                <p className="text-sm font-bold text-ink">Spiller 1 fjerner 1 stage</p>
                <p className="text-xs text-olive">Game 1 · Vælg en stage at fjerne</p>
              </div>

              {/* Mock stage grid */}
              <div className="grid grid-cols-2 gap-3">
                {MOCK_STAGES.map((stage, i) => (
                  <motion.div
                    key={stage.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className={cn(
                      "relative flex min-h-[80px] flex-col items-center justify-center rounded-xl border-2 p-2 text-center",
                      stage.state === "idle" && "border-ink bg-cream",
                      stage.state === "striked" && "border-ink/30 bg-cream-dim text-ink/35 line-through",
                      stage.state === "picked" && "border-brick bg-brick text-cream shadow-poster-sm"
                    )}
                  >
                    <span className="text-[13px] font-bold leading-tight">{stage.name}</span>
                    {stage.state === "striked" && <Ban className="absolute right-2 top-2 h-3.5 w-3.5 text-brick" />}
                    {stage.state === "picked" && <Check className="absolute right-2 top-2 h-3.5 w-3.5" />}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { StageStrikeTeaser };
export default StageStrikeTeaser;
