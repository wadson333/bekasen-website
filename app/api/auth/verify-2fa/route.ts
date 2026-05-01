import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  COOKIE_NAMES,
  COOKIE_TTL,
  getCookieFlags,
  signAccessToken,
  signRefreshToken,
  verifyTotp,
} from "@/lib/auth";
import { checkOrigin, getAdminFromTempCookie, jsonError } from "@/lib/auth-server";

export const runtime = "nodejs";

const VerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(req: NextRequest) {
  if (!checkOrigin(req)) return jsonError("forbidden", 403);

  const body = await req.json().catch(() => null);
  const parsed = VerifySchema.safeParse(body);
  if (!parsed.success) return jsonError("invalid_payload", 400);

  const ctx = await getAdminFromTempCookie(req);
  if (!ctx) return jsonError("unauthorized", 401);

  const { admin } = ctx;
  if (!admin.totpEnabled || !admin.totpSecret) {
    return jsonError("totp_not_setup", 400);
  }

  const ok = verifyTotp(admin.totpSecret, parsed.data.code);
  if (!ok) return jsonError("invalid_code", 401);

  const accessToken = await signAccessToken({ sub: admin.id, email: admin.email });
  const { token: refreshToken } = await signRefreshToken({ sub: admin.id });

  const res = NextResponse.json({ next: "dashboard" });
  res.cookies.set(COOKIE_NAMES.access, accessToken, getCookieFlags(COOKIE_TTL.access));
  res.cookies.set(COOKIE_NAMES.refresh, refreshToken, getCookieFlags(COOKIE_TTL.refresh));
  res.cookies.set(COOKIE_NAMES.temp, "", { ...getCookieFlags(0), maxAge: 0 });
  return res;
}
