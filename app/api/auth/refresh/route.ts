import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_NAMES,
  COOKIE_TTL,
  getCookieFlags,
  isJtiBlacklisted,
  signAccessToken,
  verifyRefreshToken,
} from "@/lib/auth";
import { checkOrigin, getAdminById, jsonError } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!checkOrigin(req)) return jsonError("forbidden", 403);

  const refreshCookie = req.cookies.get(COOKIE_NAMES.refresh)?.value;
  if (!refreshCookie) return jsonError("unauthorized", 401);

  const payload = await verifyRefreshToken(refreshCookie);
  if (!payload?.sub || !payload.jti || isJtiBlacklisted(payload.jti)) {
    return jsonError("unauthorized", 401);
  }

  const admin = await getAdminById(payload.sub);
  if (!admin) return jsonError("unauthorized", 401);

  const accessToken = await signAccessToken({ sub: admin.id, email: admin.email });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAMES.access, accessToken, getCookieFlags(COOKIE_TTL.access));
  return res;
}
