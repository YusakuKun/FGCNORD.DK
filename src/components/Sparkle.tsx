import { memo } from "react";
import { cn } from "@/lib/utils";

interface SparkleProps {
  color?: string;
  size?: number;
  rotation?: number;
  className?: string;
}

/** 4-takket sparkle-stjerne (fra logoets C) */
function Sparkle({ color = "#A84434", size = 24, rotation = 0, className }: SparkleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={cn(className)}
      style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
      aria-hidden="true"
    >
      <path
        d="M50 0 C55 32 68 45 100 50 C68 55 55 68 50 100 C45 68 32 55 0 50 C32 45 45 32 50 0 Z"
        fill={color}
      />
    </svg>
  );
}

export default memo(Sparkle);
export { Sparkle };
