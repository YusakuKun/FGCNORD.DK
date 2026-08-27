import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  children,
}: PageHeaderProps) {
  return (
    <section className={cn("section-padding border-b-2 border-ink bg-cream-dim", className)}>
      <div className="container-site px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <span className="mb-3 inline-block font-heading text-sm font-bold uppercase tracking-widest text-brick">
              {eyebrow}
            </span>
          )}
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
            {title}
            <span className="ml-2 inline-block h-2.5 w-14 rounded-full bg-brick sm:h-3 sm:w-16" />
          </h1>
          {description && (
            <p className="mt-5 text-lg leading-relaxed text-ink/70 sm:text-xl">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
