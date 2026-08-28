import { memo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface WaveDividerProps {
  /** Farven på bølgen (fyld) */
  fill?: string;
  /** Ekstra klasser på containeren */
  className?: string;
  /** Vend bølgen på hovedet */
  flip?: boolean;
  /** Tegn bølgen med stroke-animation ved scroll */
  animate?: boolean;
}

/** Organisk SVG-bølge mellem sektioner */
function WaveDivider({ fill = "#51512A", className, flip = false, animate = true }: WaveDividerProps) {
  const ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!animate) return;
    const path = ref.current;
    if (!path) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            path.style.transition = "stroke-dashoffset 1.4s ease-out";
            path.style.strokeDashoffset = "0";
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(path);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <div
      className={cn(className)}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="block h-[70px] w-full md:h-[110px]">
        <path
          d="M0,64 C180,110 360,20 540,44 C720,68 900,118 1080,88 C1260,58 1360,84 1440,64 L1440,120 L0,120 Z"
          fill={fill}
        />
        <path
          ref={ref}
          d="M0,64 C180,110 360,20 540,44 C720,68 900,118 1080,88 C1260,58 1360,84 1440,64"
          fill="none"
          stroke={fill}
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default memo(WaveDivider);
export { WaveDivider };
