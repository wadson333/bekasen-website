import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
  /** Optional render slot to the right of the title (used for action buttons on listing pages) */
  trailing?: ReactNode;
};

/**
 * Shared page header — single source of truth for h1 / eyebrow / subtitle
 * spacing across the public site.
 *
 * Layout: eyebrow pill + h1 + subtitle. `align="center"` is the default for
 * most pages; `align="left"` is used on listing pages that pair the heading
 * with a trailing action button (e.g. "View all →").
 *
 * Anti-patterns avoided: gradient text, oversized hero (sticks to ~text-5xl),
 * mismatched font weights. Cohesion enforced.
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  trailing,
}: Props) {
  if (align === "left" && trailing) {
    return (
      <header
        className={cn(
          "mb-12 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between",
          className,
        )}
      >
        <div className="max-w-2xl">
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="mt-4 font-(family-name:--font-syne) text-3xl font-bold leading-tight text-text-primary md:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-lg text-text-secondary">{subtitle}</p>
          ) : null}
        </div>
        {trailing}
      </header>
    );
  }

  return (
    <header
      className={cn(
        align === "center" ? "mx-auto mb-12 max-w-3xl text-center" : "mb-12 max-w-3xl",
        className,
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
          {eyebrow}
        </span>
      ) : null}
      <h1
        className={cn(
          "font-(family-name:--font-syne) text-4xl font-bold leading-tight text-text-primary md:text-5xl",
          eyebrow ? "mt-6" : undefined,
        )}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-4 text-lg text-text-secondary">{subtitle}</p>
      ) : null}
    </header>
  );
}
