import { memo } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Sparkle } from "@/components/Sparkle";

/**
 * Nordlys-dekoration til hero: blå aurora-glows + sparkle-stjerner i 3 parallax-lag.
 * Framer Motion motionvalues — ingen re-render. Respekterer prefers-reduced-motion.
 */
function HeroDecor() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 800 * 0.3 * -0.4]);
  const y2 = useTransform(scrollY, [0, 800], [0, 800 * 0.6 * -0.4]);
  const y3 = useTransform(scrollY, [0, 800], [0, 800 * 1.0 * -0.4]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Nordlys-glows */}
      <div className="absolute -top-32 left-[-10%] h-[480px] w-[720px] rounded-full bg-brick/25 blur-[120px] motion-safe:animate-pulse [animation-duration:7s]" />
      <div className="absolute right-[-15%] top-[20%] h-[420px] w-[620px] rounded-full bg-brick-soft/20 blur-[130px]" />
      <div className="absolute bottom-[-20%] left-[30%] h-[360px] w-[560px] rounded-full bg-[#4FC3F7]/15 blur-[110px]" />

      {/* Aurora-bånd */}
      <motion.svg
        style={reduced ? undefined : { y: y1 }}
        className="absolute -left-10 top-[10%] h-[160px] w-[420px] opacity-30"
        viewBox="0 0 420 140"
        fill="none"
      >
        <path
          d="M0,90 C70,40 140,110 210,70 C280,30 350,95 420,55"
          stroke="#00AEEF"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M0,115 C70,65 140,135 210,95 C280,55 350,120 420,80"
          stroke="#4FC3F7"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />
      </motion.svg>

      {/* Sparkles i 3 parallax-lag */}
      <motion.div style={reduced ? undefined : { y: y1 }} className="absolute left-[6%] top-[22%] opacity-60">
        <Sparkle size={34} color="#4FC3F7" />
      </motion.div>
      <motion.div style={reduced ? undefined : { y: y2 }} className="absolute right-[8%] top-[14%] opacity-70">
        <Sparkle size={44} color="#00AEEF" rotation={15} />
      </motion.div>
      <motion.div style={reduced ? undefined : { y: y3 }} className="absolute bottom-[16%] left-[42%] opacity-40">
        <Sparkle size={26} color="#4FC3F7" rotation={30} />
      </motion.div>
      <motion.div style={reduced ? undefined : { y: y2 }} className="absolute bottom-[28%] right-[16%] opacity-30">
        <Sparkle size={20} color="#F4F8FB" rotation={10} />
      </motion.div>

      {/* Nordlys-cirkel */}
      <motion.svg
        style={reduced ? undefined : { y: y2 }}
        className="absolute bottom-[30%] right-[4%] h-[80px] w-[80px] opacity-25"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="42" stroke="#00AEEF" strokeWidth="5" />
        <circle cx="62" cy="40" r="9" fill="#4FC3F7" />
      </motion.svg>
    </div>
  );
}

export default memo(HeroDecor);
export { HeroDecor };
