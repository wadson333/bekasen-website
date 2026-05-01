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
  signTempToken,
  verifyPassword,
} from "@/lib/auth";
import { checkOrigin, jsonError } from "@/lib/auth-server";

export const runtime = "nodejs";

const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(255),
});

export async function POST(req: NextRequest) {
  if (!checkOrigin(req)) return jsonError("forbidden", 403);

  const body = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) return jsonError("invalid_payload", 400);

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, normalizedEmail))
    .limit(1);

  // Same generic error for "no user" and "wrong password" (no enumeration)
  const ok = admin ? await verifyPassword(password, admin.passwordHash) : false;
  if (!admin || !ok) return jsonError("invalid_credentials", 401);

  await db
    .update(adminUsers)
    .set({ lastLogin: new Date() })
    .where(eq(adminUsers.id, admin.id));

  // Decision tree per the spec section 6.1
  if (admin.mustChangePassword) {
    // Issue temp token only — user MUST change password before getting access
    const tempToken = await signTempToken({ sub: admin.id, email: admin.email });
    const res = NextResponse.json({ next: "change_password" });
    res.cookies.set(COOKIE_NAMES.temp, tempToken, getCookieFlags(COOKIE_TTL.temp));
    return res;
  }

  if (admin.totpEnabled) {
    const tempToken = await signTempToken({ sub: admin.id, email: admin.email });
    const res = NextResponse.json({ next: "2fa" });
    res.cookies.set(COOKIE_NAMES.temp, tempToken, getCookieFlags(COOKIE_TTL.temp));
    return res;
  }

  // 2FA not enabled yet — issue access + refresh, frontend should redirect
  // to setup-2fa per the spec.
  const accessToken = await signAccessToken({ sub: admin.id, email: admin.email });
  const { token: refreshToken } = await signRefreshToken({ sub: admin.id });

  const res = NextResponse.json({ next: "setup_2fa" });
  res.cookies.set(COOKIE_NAMES.access, accessToken, getCookieFlags(COOKIE_TTL.access));
  res.cookies.set(COOKIE_NAMES.refresh, refreshToken, getCookieFlags(COOKIE_TTL.refresh));
  return res;
}
