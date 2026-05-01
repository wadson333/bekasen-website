import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers } from "@/drizzle/schema";
import {
  COOKIE_NAMES,
  COOKIE_TTL,
  getCookieFlags,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
} from "@/lib/auth";
import {
  checkOrigin,
  getAdminFromAccessCookie,
  getAdminFromTempCookie,
  jsonError,
} from "@/lib/auth-server";

export const runtime = "nodejs";

const Schema = z.object({
  currentPassword: z.string().min(1).max(255).optional(),
  newPassword: z
    .string()
    .min(12, "min_12_chars")
    .max(255)
    .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v), {
      message: "needs_lower_upper_digit",
    }),
});

/**
 * Change password.
 *
 * Two contexts:
 *   - Forced first-login change: request carries bk_temp (issued by /login).
 *     `currentPassword` is optional (the temp cookie already proves the user
 *     re-entered the temp password).
 *   - Normal change: request carries bk_access. `currentPassword` is REQUIRED.
 *
 * On success: must_change_password = false, totp_secret cleared (so user must
 * re-setup 2FA fresh), access + refresh cookies issued, bk_temp cleared.
 */
export async function POST(req: NextRequest) {
  if (!checkOrigin(req)) return jsonError("forbidden", 403);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return jsonError("invalid_payload", 400, { issues: parsed.error.flatten() });
  }

  const accessCtx = await getAdminFromAccessCookie(req);
  const tempCtx = accessCtx ? null : await getAdminFromTempCookie(req);
  const ctx = accessCtx ?? tempCtx;
  if (!ctx) return jsonError("unauthorized", 401);

  const { admin } = ctx;

  // For non-temp flow, require + verify current password
  if (accessCtx) {
    if (!parsed.data.currentPassword) return jsonError("current_password_required", 400);
    const ok = await verifyPassword(parsed.data.currentPassword, admin.passwordHash);
    if (!ok) return jsonError("invalid_credentials", 401);
  }

  const newHash = await hashPassword(parsed.data.newPassword);

  await db
    .update(adminUsers)
    .set({
      passwordHash: newHash,
      mustChangePassword: false,
      // Reset 2FA on password change so the admin re-confirms enrollment
      totpSecret: null,
      totpEnabled: false,
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.id, admin.id));

  // Issue fresh access + refresh, clear temp
  const accessToken = await signAccessToken({ sub: admin.id, email: admin.email });
  const { token: refreshToken } = await signRefreshToken({ sub: admin.id });

  const res = NextResponse.json({ next: "setup_2fa" });
  res.cookies.set(COOKIE_NAMES.access, accessToken, getCookieFlags(COOKIE_TTL.access));
  res.cookies.set(COOKIE_NAMES.refresh, refreshToken, getCookieFlags(COOKIE_TTL.refresh));
  res.cookies.set(COOKIE_NAMES.temp, "", { ...getCookieFlags(0), maxAge: 0 });
  return res;
}
