/**
 * Bekasen — Proxy middleware (Next.js 16 unified middleware).
 *
 * Responsibilities:
 *   1. Validate /panel/{uid}/* against process.env.ADMIN_PANEL_UID
 *      (returns 404 in constant time if mismatch — no info leak).
 *   2. Auth-gate /panel/{uid}/* routes (except /login, /setup-2fa,
 *      /change-password) by verifying the bk_access cookie (jose / Edge-safe).
 *   3. Skip next-intl entirely for /panel/* and /client/* paths.
 *   4. Strip any locale prefix that next-intl adds to /panel/* (redirect
 *      /{locale}/panel/{uid}/... → /panel/{uid}/...).
 *   5. Delegate everything else to next-intl middleware for locale routing.
 */
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { COOKIE_NAMES, safeStringEqual, verifyAccessToken } from "@/lib/auth";

const intlMiddleware = createIntlMiddleware(routing);

// Matches the 4 supported locales as a leading prefix segment.
const LOCALE_PREFIX_RE = /^\/(?:fr|en|ht|es)(?=\/|$)/;

const PUBLIC_PANEL_SUBPATHS = new Set([
  "login",
  "setup-2fa",
  "change-password",
]);

function notFound(req: NextRequest) {
  // Rewrite to a 404 page instead of throwing 401 so the panel URL gives
  // no signal that it's a real route. Constant-ish timing.
  return NextResponse.rewrite(new URL("/404", req.url), { status: 404 });
}

export default async function proxy(req: NextRequest): Promise<Response | undefined> {
  const { pathname } = req.nextUrl;

  // ── /{locale}/panel/* — strip the locale prefix and redirect ──────────────
  // next-intl will inject a locale prefix when the visitor's session is on a
  // localized page (e.g. /fr/...) and they paste a panel URL afterwards.
  // The admin panel is locale-agnostic, so we always strip it.
  if (LOCALE_PREFIX_RE.test(pathname) && pathname.includes("/panel/")) {
    const stripped = pathname.replace(LOCALE_PREFIX_RE, "");
    if (stripped.startsWith("/panel/")) {
      const url = req.nextUrl.clone();
      url.pathname = stripped;
      return NextResponse.redirect(url, 308); // permanent — preserves method
    }
  }

  // Same defensive strip for /client/{token} (also locale-agnostic).
  if (LOCALE_PREFIX_RE.test(pathname) && pathname.includes("/client/")) {
    const stripped = pathname.replace(LOCALE_PREFIX_RE, "");
    if (stripped.startsWith("/client/")) {
      const url = req.nextUrl.clone();
      url.pathname = stripped;
      return NextResponse.redirect(url, 308);
    }
  }

  // ── /panel/{uid}/* — admin CMS ────────────────────────────────────────────
  const panelMatch = pathname.match(/^\/panel\/([^/]+)(?:\/(.*))?$/);
  if (panelMatch) {
    const expectedUid = process.env.ADMIN_PANEL_UID?.trim();
    const providedUid = panelMatch[1];
    const subpath = (panelMatch[2] ?? "").split("/")[0]; // first segment after uid

    // No env UID set OR wrong UID → 404 (no info leak)
    if (!expectedUid || !safeStringEqual(providedUid, expectedUid)) {
      return notFound(req);
    }

    // Public sub-paths (login, setup-2fa, change-password) skip auth
    if (PUBLIC_PANEL_SUBPATHS.has(subpath)) {
      return; // pass through, no i18n rewrite
    }

    // Empty path under valid panel UID (/panel/{uid}/) → redirect to login
    if (!subpath) {
      const url = req.nextUrl.clone();
      url.pathname = `/panel/${expectedUid}/login`;
      return NextResponse.redirect(url);
    }

    // Auth-gated: verify access cookie
    const accessToken = req.cookies.get(COOKIE_NAMES.access)?.value;
    if (!accessToken) {
      const url = req.nextUrl.clone();
      url.pathname = `/panel/${expectedUid}/login`;
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      const url = req.nextUrl.clone();
      url.pathname = `/panel/${expectedUid}/login`;
      url.searchParams.set("from", pathname);
      url.searchParams.set("expired", "1");
      return NextResponse.redirect(url);
    }

    // Authenticated: pass through, no i18n rewrite
    return;
  }

  // ── /client/{token} — public client dashboard ─────────────────────────────
  if (pathname.startsWith("/client/")) {
    return; // skip i18n, route handles token validation server-side
  }

  // ── Everything else — public site, delegate to next-intl ──────────────────
  return intlMiddleware(req) as unknown as Response;
}

// Match all paths except static assets, _next internals, api routes,
// favicon and og image. Auth gating is done explicitly above.
export const config = {
  matcher: [
    "/((?!_next|api|favicon\\.ico|robots\\.txt|sitemap\\.xml|images|logo|.*\\..*).*)",
  ],
};
