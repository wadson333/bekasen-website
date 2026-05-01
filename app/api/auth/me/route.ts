import { NextResponse, type NextRequest } from "next/server";
import { getAdminFromAccessCookie, jsonError } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const ctx = await getAdminFromAccessCookie(req);
  if (!ctx) return jsonError("unauthorized", 401);

  const { admin } = ctx;
  return NextResponse.json({
    id: admin.id,
    email: admin.email,
    totpEnabled: admin.totpEnabled,
    mustChangePassword: admin.mustChangePassword,
    lastLogin: admin.lastLogin,
  });
}
