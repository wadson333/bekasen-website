/**
 * Exchange-rate helper — fetches live USD-base rates from frankfurter.dev
 * (free, no auth, ECB official rates, daily updates).
 *
 * Cache strategy:
 *   - In-memory module cache for the currently loaded set of rates
 *   - sessionStorage backup so the rates persist across SPA navigations
 *     within the same tab without re-fetching
 *
 * HTG (Haitian Gourde) is NOT on ECB. The pricing rows in the DB already
 * carry HTG values for the 4 main plans, so we never call the API for HTG.
 * For other currencies (anything not in DB columns), we convert from USD
 * via Frankfurter rates.
 */

export type ExchangeRates = {
  base: "USD";
  date: string;
  rates: Record<string, number>; // e.g. { EUR: 0.92, GBP: 0.78, JPY: 148.3 }
};

const FRANKFURTER_URL = "https://api.frankfurter.dev/v1/latest";

// Currencies we ask Frankfurter for. HTG is excluded (not supported, comes from DB).
const REQUESTED_CURRENCIES = [
  "EUR", "CAD", "GBP", "JPY", "MXN", "BRL", "CHF",
  "AUD", "INR", "CNY", "ZAR", "DOP",
] as const;

const SESSION_KEY = "bk_fx_rates_v1";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours — Frankfurter updates daily

let inMemoryCache: { rates: ExchangeRates; fetchedAt: number } | null = null;

function readSession(): { rates: ExchangeRates; fetchedAt: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { rates: ExchangeRates; fetchedAt: number };
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(payload: { rates: ExchangeRates; fetchedAt: number }) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage may throw in private mode — silently ignore
  }
}

export async function fetchRates(): Promise<ExchangeRates> {
  if (inMemoryCache && Date.now() - inMemoryCache.fetchedAt < CACHE_TTL_MS) {
    return inMemoryCache.rates;
  }

  const session = readSession();
  if (session) {
    inMemoryCache = session;
    return session.rates;
  }

  const url = `${FRANKFURTER_URL}?base=USD&symbols=${REQUESTED_CURRENCIES.join(",")}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Frankfurter ${res.status}`);

  const data = (await res.json()) as { base: string; date: string; rates: Record<string, number> };
  const rates: ExchangeRates = {
    base: "USD",
    date: data.date,
    rates: data.rates,
  };

  const payload = { rates, fetchedAt: Date.now() };
  inMemoryCache = payload;
  writeSession(payload);
  return rates;
}

/**
 * Convert a USD amount (in cents) to the target currency cents/units.
 * For currencies not in the rates table, returns null.
 */
export function convertFromUsdCents(
  usdCents: number,
  targetCurrency: string,
  rates: ExchangeRates,
): number | null {
  const rate = rates.rates[targetCurrency];
  if (typeof rate !== "number" || !Number.isFinite(rate)) return null;
  return Math.round(usdCents * rate);
}

/**
 * Static fallback list of currencies the UI can offer. Built-in (DB-stored)
 * currencies always come first — they don't need an API call.
 */
export const CURRENCY_OPTIONS = [
  // DB-backed (read directly from the pricing row)
  { code: "USD", flag: "🇺🇸", name: "US Dollar", source: "db" as const },
  { code: "HTG", flag: "🇭🇹", name: "Gourde haïtienne", source: "db" as const },
  { code: "EUR", flag: "🇪🇺", name: "Euro", source: "db" as const },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar", source: "db" as const },
  // API-backed (frankfurter.dev live rates)
  { code: "GBP", flag: "🇬🇧", name: "British Pound", source: "api" as const },
  { code: "MXN", flag: "🇲🇽", name: "Mexican Peso", source: "api" as const },
  { code: "BRL", flag: "🇧🇷", name: "Brazilian Real", source: "api" as const },
  { code: "DOP", flag: "🇩🇴", name: "Dominican Peso", source: "api" as const },
  { code: "JPY", flag: "🇯🇵", name: "Japanese Yen", source: "api" as const },
  { code: "CHF", flag: "🇨🇭", name: "Swiss Franc", source: "api" as const },
  { code: "AUD", flag: "🇦🇺", name: "Australian Dollar", source: "api" as const },
  { code: "INR", flag: "🇮🇳", name: "Indian Rupee", source: "api" as const },
  { code: "CNY", flag: "🇨🇳", name: "Chinese Yuan", source: "api" as const },
  { code: "ZAR", flag: "🇿🇦", name: "South African Rand", source: "api" as const },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]["code"];

export function formatCurrency(cents: number, code: string, locale: string = "en"): string {
  const intlLocale = locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : locale === "ht" ? "fr-HT" : "en-US";
  try {
    return (cents / 100).toLocaleString(intlLocale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: code === "JPY" || code === "HTG" ? 0 : 0,
    });
  } catch {
    // Some locale/currency combos throw — fallback to "USD" formatting + suffix
    return `${(cents / 100).toLocaleString(intlLocale, { maximumFractionDigits: 0 })} ${code}`;
  }
}
