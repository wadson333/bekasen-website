import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_NAMES,
  blacklistJti,
  getCookieFlags,
  verifyRefreshToken,
} from "@/lib/auth";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!checkOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const refresh = req.cookies.get(COOKIE_NAMES.refresh)?.value;
  if (refresh) {
    const payload = await verifyRefreshToken(refresh);
    if (payload?.jti) blacklistJti(payload.jti);
  }

  const res = NextResponse.json({ ok: true });
  const expired = { ...getCookieFlags(0), maxAge: 0 };
  res.cookies.set(COOKIE_NAMES.access, "", expired);
  res.cookies.set(COOKIE_NAMES.refresh, "", expired);
  res.cookies.set(COOKIE_NAMES.temp, "", expired);
  return res;
}
