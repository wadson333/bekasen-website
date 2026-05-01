export const CONSENT_VERSION = 1;
export const CONSENT_COOKIE_NAME = "bekasen_consent";
export const CHAT_SESSION_COOKIE_NAME = "bekasen_chat_session";
export const LOCALE_COOKIE_NAME = "bekasen_locale";
export const THEME_STORAGE_KEY = "bekasen_theme";

export interface ConsentPreferences {
  version: number;
  preferences: boolean;
  aiChat: boolean;
  updatedAt: string;
}

export const defaultConsentPreferences: ConsentPreferences = {
  version: CONSENT_VERSION,
  preferences: false,
  aiChat: false,
  updatedAt: "",
};

const cookieMaxAge = 60 * 60 * 24 * 180;
let cachedConsentRaw: string | null = null;
let cachedConsentValue: ConsentPreferences | null = null;

export function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : null;
}

export function setCookieValue(name: string, value: string, maxAge = cookieMaxAge) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export function deleteCookieValue(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function readConsentPreferences(): ConsentPreferences | null {
  const raw = getCookieValue(CONSENT_COOKIE_NAME);

  if (!raw) {
    cachedConsentRaw = null;
    cachedConsentValue = null;
    return null;
  }

  if (raw === cachedConsentRaw) {
    return cachedConsentValue;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;

    if (parsed.version !== CONSENT_VERSION) {
      cachedConsentRaw = raw;
      cachedConsentValue = null;
      return null;
    }

    cachedConsentRaw = raw;
    cachedConsentValue = {
      version: CONSENT_VERSION,
      preferences: parsed.preferences === true,
      aiChat: parsed.aiChat === true,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };

    return cachedConsentValue;
  } catch {
    cachedConsentRaw = raw;
    cachedConsentValue = null;
    return null;
  }
}

export function saveConsentPreferences(preferences: Omit<ConsentPreferences, "version" | "updatedAt">) {
  const nextConsent: ConsentPreferences = {
    version: CONSENT_VERSION,
    preferences: preferences.preferences,
    aiChat: preferences.aiChat,
    updatedAt: new Date().toISOString(),
  };

  setCookieValue(CONSENT_COOKIE_NAME, JSON.stringify(nextConsent));
  window.dispatchEvent(new CustomEvent("bekasen-consent-change", { detail: nextConsent }));

  return nextConsent;
}

export function clearConsentPreferences() {
  deleteCookieValue(CONSENT_COOKIE_NAME);
  deleteCookieValue(CHAT_SESSION_COOKIE_NAME);
  window.dispatchEvent(new CustomEvent("bekasen-consent-change", { detail: null }));
}

export function subscribeToConsent(callback: () => void) {
  window.addEventListener("bekasen-consent-change", callback);
  return () => window.removeEventListener("bekasen-consent-change", callback);
}

export function readChatSessionId(): string | null {
  return getCookieValue(CHAT_SESSION_COOKIE_NAME);
}

export function saveChatSessionId(sessionId: string) {
  setCookieValue(CHAT_SESSION_COOKIE_NAME, sessionId);
}

export function ensureChatSessionId() {
  const existingSessionId = readChatSessionId();

  if (existingSessionId) {
    return existingSessionId;
  }

  const nextSessionId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  saveChatSessionId(nextSessionId);

  return nextSessionId;
}

export function clearChatSessionId() {
  deleteCookieValue(CHAT_SESSION_COOKIE_NAME);
}

export function saveSelectedLocale(locale: string) {
  if (typeof document === "undefined") {
    return;
  }

  setCookieValue(LOCALE_COOKIE_NAME, locale, 60 * 60 * 24 * 180);
}

export function clearSelectedLocale() {
  if (typeof document === "undefined") {
    return;
  }

  deleteCookieValue(LOCALE_COOKIE_NAME);
}
