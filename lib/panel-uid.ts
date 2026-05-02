/**
 * Admin panel route is `/panel/[uid]/*`. The route uses a normal dynamic
 * segment (not a compound `panel-[uid]`) because Next.js 16 + Turbopack has
 * a regression that prevents compound segments from matching in dev.
 *
 * This helper parses the UID from a pathname for both server (via
 * `headers()`) and client (via `usePathname()`) callers.
 */
export const PANEL_PATH_RE = /^\/panel\/([^/?#]+)/;

export function extractPanelUidFromPath(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  const m = pathname.match(PANEL_PATH_RE);
  return m ? m[1] : null;
}

export function buildPanelBase(uid: string | null | undefined): string {
  if (!uid) return "";
  return `/panel/${uid}`;
}
