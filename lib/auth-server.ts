/**
 * Server-only auth helpers (DB-aware). Do NOT import from middleware/Edge code.
 * Edge code should use only `lib/auth.ts` (jose-based, no DB).
 */
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers, type AdminUser } from "@/drizzle/schema";
import {
  COOKIE_NAMES,
  type AccessTokenPayload,
  type TempTokenPayload,
  verifyAccessToken,
  verifyTempToken,
} from "@/lib/auth";

export async function getAdminByEmail(
  email: string,
): Promise<AdminUser | null> {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1);
  return admin ?? null;
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  return admin ?? null;
}

/**
 * Resolve current admin from the bk_access cookie. Returns null if missing or
 * invalid. The DB user is also re-fetched (so toggling totp_enabled / force
 * password change takes effect on the next request).
 */
export async function getAdminFromAccessCookie(
  req: NextRequest,
): Promise<{ admin: AdminUser; payload: AccessTokenPayload } | null> {
  const token = req.cookies.get(COOKIE_NAMES.access)?.value;
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  if (!payload?.sub) return null;
  const admin = await getAdminById(payload.sub);
  if (!admin) return null;
  return { admin, payload };
}

/**
 * Same as getAdminFromAccessCookie but reads bk_temp (used during the 2FA /
 * change-password bridges).
 */
export async function getAdminFromTempCookie(
  req: NextRequest,
): Promise<{ admin: AdminUser; payload: TempTokenPayload } | null> {
  const token = req.cookies.get(COOKIE_NAMES.temp)?.value;
  if (!token) return null;
  const payload = await verifyTempToken(token);
  if (!payload?.sub) return null;
  const admin = await getAdminById(payload.sub);
  if (!admin) return null;
  return { admin, payload };
}

export type ApiAuthError = "invalid_credentials" | "unauthorized" | "rate_limited";

export function jsonError(
  code: ApiAuthError | string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error: code, ...extra }, { status });
}

/**
 * Verify Origin header matches the request host. Acts as a defense-in-depth
 * CSRF check on top of SameSite=Strict cookies.
 */
export function checkOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // some Next.js fetches omit it; SameSite covers us
  try {
    const originHost = new URL(origin).host;
    const requestHost = req.headers.get("host");
    return originHost === requestHost;
  } catch {
    return false;
  }
}
