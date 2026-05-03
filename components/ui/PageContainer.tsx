import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Size = "narrow" | "default" | "wide";

const SIZE_CLASS: Record<Size, string> = {
  narrow: "max-w-3xl",   // legal, articles
  default: "max-w-4xl",  // about, portfolio detail
  wide: "max-w-6xl",     // listing pages (portfolio, blog, pricing, services, contact)
};

type Props = {
  children: ReactNode;
  size?: Size;
  className?: string;
  /** Tighten or loosen the vertical rhythm. Defaults to standard `py-16 lg:py-24`. */
  spacing?: "default" | "tight" | "hero";
};

const SPACING_CLASS: Record<NonNullable<Props["spacing"]>, string> = {
  default: "px-6 py-16 lg:py-24",
  tight: "px-6 py-12 lg:py-16",
  hero: "px-6 pt-32 pb-16",
};

/**
 * Shared page container — enforces one consistent rhythm across all public
 * pages. Three width variants (narrow / default / wide) and three spacing
 * presets (default / tight / hero).
 *
 * Use:
 *   <PageContainer size="wide">
 *     <PageHeader title="..." />
 *     ...
 *   </PageContainer>
 */
export default function PageContainer({
  children,
  size = "wide",
  className,
  spacing = "default",
}: Props) {
  return (
    <main className={cn("flex-1", SPACING_CLASS[spacing])}>
      <div className={cn("mx-auto", SIZE_CLASS[size], className)}>{children}</div>
    </main>
  );
}
