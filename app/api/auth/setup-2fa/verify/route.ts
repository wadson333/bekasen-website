import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers } from "@/drizzle/schema";
import {
  COOKIE_NAMES,
  COOKIE_TTL,
  getCookieFlags,
  signAccessToken,
  signRefreshToken,
  verifyTotp,
} from "@/lib/auth";
import {
  checkOrigin,
  getAdminFromAccessCookie,
  getAdminFromTempCookie,
  jsonError,
} from "@/lib/auth-server";

export const runtime = "nodejs";

const Schema = z.object({ code: z.string().regex(/^\d{6}$/) });

/**
 * Verify the TOTP code generated during /api/auth/setup-2fa. On success,
 * flip totp_enabled to true and (if the request used bk_temp) issue a fresh
 * access + refresh pair so the admin can enter the dashboard.
 */
export async function POST(req: NextRequest) {
  if (!checkOrigin(req)) return jsonError("forbidden", 403);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return jsonError("invalid_payload", 400);

  const accessCtx = await getAdminFromAccessCookie(req);
  const tempCtx = accessCtx ? null : await getAdminFromTempCookie(req);
  const ctx = accessCtx ?? tempCtx;
  if (!ctx) return jsonError("unauthorized", 401);

  const { admin } = ctx;
  if (!admin.totpSecret) return jsonError("totp_not_initialized", 400);

  const ok = verifyTotp(admin.totpSecret, parsed.data.code);
  if (!ok) return jsonError("invalid_code", 401);

  await db
    .update(adminUsers)
    .set({ totpEnabled: true, updatedAt: new Date() })
    .where(eq(adminUsers.id, admin.id));

  const res = NextResponse.json({ next: "dashboard" });

  // If the user came in via bk_temp (still in the post-change bootstrap),
  // exchange that for a real access + refresh pair now.
  if (!accessCtx) {
    const accessToken = await signAccessToken({ sub: admin.id, email: admin.email });
    const { token: refreshToken } = await signRefreshToken({ sub: admin.id });
    res.cookies.set(COOKIE_NAMES.access, accessToken, getCookieFlags(COOKIE_TTL.access));
    res.cookies.set(COOKIE_NAMES.refresh, refreshToken, getCookieFlags(COOKIE_TTL.refresh));
    res.cookies.set(COOKIE_NAMES.temp, "", { ...getCookieFlags(0), maxAge: 0 });
  }

  return res;
}
