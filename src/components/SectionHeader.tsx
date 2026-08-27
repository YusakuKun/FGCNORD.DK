import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** @deprecated Brug `centered` i stedet */
  align?: "left" | "center";
  centered?: boolean;
  light?: boolean;
  className?: string;
  underline?: boolean;
  size?: "default" | "large";
}

/** Eyebrow-label (brick) + H2 + kort underlinje */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align,
  centered = false,
  light = false,
  className,
  underline = true,
  size = "default",
}: SectionHeaderProps) {
  const isCentered = centered || align === "center";

  return (
    <div
      className={cn(
        "mb-10 max-w-2xl sm:mb-12 lg:mb-16",
        isCentered && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "mb-3 inline-block text-[13px] font-bold uppercase tracking-[0.18em]",
            light ? "text-brick-soft" : "text-brick"
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-display uppercase leading-[1.05] tracking-[-0.01em]",
          size === "large"
            ? "text-[34px] md:text-[56px]"
            : "text-[30px] md:text-[48px]",
          light ? "text-cream" : "text-ink"
        )}
      >
        {title}
        {underline && (
          <span
            className={cn(
              "ml-2 inline-block h-[5px] w-16 rounded-full bg-brick",
              isCentered && "mx-auto block"
            )}
            aria-hidden="true"
          />
        )}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-[16px] leading-[1.7] md:text-[17px]",
            light ? "text-cream/85" : "text-olive"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
