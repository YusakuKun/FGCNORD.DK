import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { WaveDivider } from "./WaveDivider";
import { Sparkle } from "./Sparkle";
import { DISCORD_URL } from "./Navbar";

interface CTASectionProps {
  title?: string;
  text?: string;
}

/** Coal-blok m. H2 + to knapper — genbruges på forside, turneringer og om */
export function CTASection({
  title = "KLAR TIL AT JOIN'E?",
  text = "Bliv medlem for 150 kr./år (75 kr. for under 18) — eller smid et hej i Discord'en og kom forbi en weekly.",
}: CTASectionProps) {
  return (
    <section className="relative bg-coal text-cream">
      <WaveDivider fill="#F7F1E6" flip className="absolute inset-x-0 top-0 -translate-y-[99%]" animate={false} />
      <div className="halftone-dark mx-auto max-w-[1200px] px-6 py-24 text-center md:px-24">
        <Sparkle size={36} className="mx-auto mb-6 animate-spin-slow" />
        <h2 className="font-display text-[34px] uppercase leading-[1.05] tracking-[-0.01em] md:text-[56px]">
          {title.split(" ").map((ord, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
              >
                {ord}&nbsp;
              </motion.span>
            </span>
          ))}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.7] text-cream/85">{text}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link
              to="/bliv-medlem"
              className="inline-block rounded-full border-[3px] border-ink bg-brick px-8 py-3.5 text-[15px] font-semibold uppercase tracking-[0.02em] text-ink shadow-poster transition-all duration-200 hover:-translate-y-0.5 hover:bg-brick-soft hover:shadow-poster-lg"
            >
              Bliv medlem
            </Link>
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 400, damping: 17, delay: 0.15 }}
          >
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full border-[3px] border-cream bg-transparent px-8 py-3.5 text-[15px] font-semibold uppercase tracking-[0.02em] text-cream transition-all duration-200 hover:-translate-y-0.5 hover:bg-cream hover:text-coal"
            >
              Join Discord
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
