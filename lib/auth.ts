/**
 * Bekasen — Authentication primitives
 *
 * Uses `jose` for JWTs (Edge-compatible — required for proxy.ts middleware),
 * `bcryptjs` for password hashing, `otplib` + `qrcode` for TOTP setup.
 *
 * Token strategy (per spec section 6.2):
 *   - Access JWT  : 15 min, payload { sub, email, type: 'access' }
 *   - Refresh JWT : 7 days, payload { sub, type: 'refresh', jti }
 *   - Temp 2FA JWT: 5 min,  payload { sub, email, type: 'temp' }
 *
 * Cookies:
 *   - bk_access  : access JWT, httpOnly, Secure (in prod), SameSite=Strict
 *   - bk_refresh : refresh JWT, httpOnly, Secure (in prod), SameSite=Strict
 *   - bk_temp    : temp 2FA JWT, httpOnly, Secure (in prod), SameSite=Strict
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import { nanoid } from "nanoid";

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";
const TEMP_TTL = "5m";

const ACCESS_COOKIE = "bk_access";
const REFRESH_COOKIE = "bk_refresh";
const TEMP_COOKIE = "bk_temp";

export const COOKIE_NAMES = {
  access: ACCESS_COOKIE,
  refresh: REFRESH_COOKIE,
  temp: TEMP_COOKIE,
} as const;

const FALLBACK_SECRET =
  "DEV_ONLY_DO_NOT_USE_IN_PRODUCTION_change_me_with_openssl_rand_base64_32_chars";

function getAccessSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET || FALLBACK_SECRET;
  return new TextEncoder().encode(raw);
}

function getRefreshSecret(): Uint8Array {
  const raw = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || FALLBACK_SECRET;
  return new TextEncoder().encode(raw);
}

// ──────────────────────────────────────────────────────────────────────────────
// Password hashing
// ──────────────────────────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ──────────────────────────────────────────────────────────────────────────────
// JWT signing & verification (jose, Edge-compatible)
// ──────────────────────────────────────────────────────────────────────────────
export type AccessTokenPayload = JWTPayload & {
  sub: string;
  email: string;
  type: "access";
};

export type RefreshTokenPayload = JWTPayload & {
  sub: string;
  type: "refresh";
  jti: string;
};

export type TempTokenPayload = JWTPayload & {
  sub: string;
  email: string;
  type: "temp";
};

export async function signAccessToken(
  payload: Omit<AccessTokenPayload, "type" | "iat" | "exp">,
): Promise<string> {
  return new SignJWT({ ...payload, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(getAccessSecret());
}

export async function signRefreshToken(
  payload: Omit<RefreshTokenPayload, "type" | "iat" | "exp" | "jti">,
): Promise<{ token: string; jti: string }> {
  const jti = nanoid(24);
  const token = await new SignJWT({ ...payload, type: "refresh", jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(getRefreshSecret());
  return { token, jti };
}

export async function signTempToken(
  payload: Omit<TempTokenPayload, "type" | "iat" | "exp">,
): Promise<string> {
  return new SignJWT({ ...payload, type: "temp" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TEMP_TTL)
    .sign(getAccessSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify<AccessTokenPayload>(
      token,
      getAccessSecret(),
    );
    if (payload.type !== "access") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify<RefreshTokenPayload>(
      token,
      getRefreshSecret(),
    );
    if (payload.type !== "refresh") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyTempToken(
  token: string,
): Promise<TempTokenPayload | null> {
  try {
    const { payload } = await jwtVerify<TempTokenPayload>(
      token,
      getAccessSecret(),
    );
    if (payload.type !== "temp") return null;
    return payload;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// In-memory refresh-token blacklist (single-user, resets on restart — OK)
// ──────────────────────────────────────────────────────────────────────────────
const blacklistedJtis = new Set<string>();

export function blacklistJti(jti: string) {
  blacklistedJtis.add(jti);
}

export function isJtiBlacklisted(jti: string): boolean {
  return blacklistedJtis.has(jti);
}

// ──────────────────────────────────────────────────────────────────────────────
// TOTP (RFC 6238) — otplib v13 functional API
// ──────────────────────────────────────────────────────────────────────────────
export function generateTotpSecret(): string {
  // 20 bytes = 160 bits of entropy, base32-encoded by otplib
  return generateSecret({ length: 20 });
}

export function buildTotpOtpAuthUrl(
  secret: string,
  email: string,
  issuer = "Bekasen",
): string {
  return generateURI({ strategy: "totp", issuer, label: email, secret });
}

export async function buildTotpQrDataUrl(otpAuthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUrl, { errorCorrectionLevel: "M", width: 240 });
}

export function verifyTotp(secret: string, token: string): boolean {
  // Strip whitespace and accept 6-digit only
  const cleaned = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  try {
    // 30s tolerance accepts the previous and next step for clock skew
    const result = verifySync({ secret, token: cleaned, epochTolerance: 30 });
    return result.valid;
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Cookie helpers (used by API routes that issue/clear cookies)
// ──────────────────────────────────────────────────────────────────────────────
export function getCookieFlags(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export const COOKIE_TTL = {
  access: 15 * 60, // 15 minutes
  refresh: 7 * 24 * 60 * 60, // 7 days
  temp: 5 * 60, // 5 minutes
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Constant-time string compare (for UID validation in middleware)
// ──────────────────────────────────────────────────────────────────────────────
export function safeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
