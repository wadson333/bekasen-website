import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers } from "@/drizzle/schema";
import {
  buildTotpOtpAuthUrl,
  buildTotpQrDataUrl,
  generateTotpSecret,
} from "@/lib/auth";
import {
  checkOrigin,
  getAdminFromAccessCookie,
  getAdminFromTempCookie,
  jsonError,
} from "@/lib/auth-server";

export const runtime = "nodejs";

/**
 * Generate a fresh TOTP secret for the current admin, store it on the row
 * (totp_enabled stays false until /verify is called), and return the QR code
 * data URL so the admin can scan it with their authenticator app.
 *
 * Accepts either bk_access (already authenticated) or bk_temp (during the
 * post-password-change setup bridge).
 */
export async function POST(req: NextRequest) {
  if (!checkOrigin(req)) return jsonError("forbidden", 403);

  const ctx =
    (await getAdminFromAccessCookie(req)) ??
    (await getAdminFromTempCookie(req));
  if (!ctx) return jsonError("unauthorized", 401);

  const { admin } = ctx;
  const secret = generateTotpSecret();
  const otpAuthUrl = buildTotpOtpAuthUrl(secret, admin.email);
  const qrDataUrl = await buildTotpQrDataUrl(otpAuthUrl);

  await db
    .update(adminUsers)
    .set({ totpSecret: secret, totpEnabled: false, updatedAt: new Date() })
    .where(eq(adminUsers.id, admin.id));

  return NextResponse.json({ qrDataUrl, otpAuthUrl, secret });
}
