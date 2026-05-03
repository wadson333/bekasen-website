import type { ReactNode } from "react";

/**
 * Wraps a substring of `text` in a purple → pink gradient span and returns
 * a React node ready for inline use in titles. If `highlight` is falsy or
 * not present in `text`, returns the plain string unchanged.
 *
 * Multiple occurrences: only the FIRST match gets the gradient (so a
 * sentence like "code source à vous, vous êtes propriétaire" with
 * highlight "vous" doesn't paint every "vous").
 *
 * Usage:
 *   <h2 className="text-4xl">{highlightText("Pas de bullshit. Just results", "results")}</h2>
 *
 * Helper module is .tsx (not .ts) because it returns JSX.
 */
export function highlightText(text: string, highlight: string | undefined | null): ReactNode {
  if (!highlight || !text.includes(highlight)) return text;
  const idx = text.indexOf(highlight);
  const before = text.slice(0, idx);
  const after = text.slice(idx + highlight.length);
  return (
    <>
      {before}
      <span className="bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
        {highlight}
      </span>
      {after}
    </>
  );
}

/**
 * Pick a locale-specific highlight word from a map. Convenience wrapper for
 * the common pattern where each title has a different "punch word" per
 * locale (English "Haitian", French "haïtiennes", etc).
 */
export function highlightLocalized(
  text: string,
  highlightByLocale: Record<string, string>,
  locale: string,
): ReactNode {
  return highlightText(text, highlightByLocale[locale]);
}
