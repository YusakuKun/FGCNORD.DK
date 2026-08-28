import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border-2 border-ink bg-cream-dim shadow-poster">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left font-heading font-bold text-ink"
      >
        {title}
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-ink/60 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-all",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0">
          <div className="px-5 pb-4 text-ink/70">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Accordion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
