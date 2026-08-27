import { memo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkle } from "@/components/Sparkle";

/** Parallax-dekorationer i hero (3 lag, hastighed 0.3 / 0.6 / 1.0). Framer Motion motionvalues — ingen re-render. */
function HeroDecor() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 800 * 0.3 * -0.4]);
  const y2 = useTransform(scrollY, [0, 800], [0, 800 * 0.6 * -0.4]);
  const y3 = useTransform(scrollY, [0, 800], [0, 800 * 1.0 * -0.4]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div style={{ y: y1 }} className="absolute left-[6%] top-[18%] opacity-40">
        <Sparkle size={34} color="#51512A" />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute right-[8%] top-[12%] opacity-50">
        <Sparkle size={44} color="#A84434" rotation={15} />
      </motion.div>
      <motion.div style={{ y: y3 }} className="absolute bottom-[14%] left-[42%] opacity-30">
        <Sparkle size={26} color="#A84434" rotation={30} />
      </motion.div>
      <motion.svg
        style={{ y: y1 }}
        className="absolute -left-10 bottom-[8%] h-[120px] w-[300px] opacity-25"
        viewBox="0 0 300 100"
        fill="none"
      >
        <path d="M0,50 C50,80 100,20 150,45 C200,70 250,30 300,50" stroke="#51512A" strokeWidth="6" strokeLinecap="round" />
      </motion.svg>
      <motion.svg
        style={{ y: y2 }}
        className="absolute right-[4%] bottom-[30%] h-[80px] w-[80px] opacity-20"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="42" stroke="#A84434" strokeWidth="5" />
        <circle cx="62" cy="40" r="9" fill="#A84434" />
      </motion.svg>
    </div>
  );
}

export default memo(HeroDecor);
export { HeroDecor };
