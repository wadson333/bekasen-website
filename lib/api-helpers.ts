import { NextResponse, type NextRequest } from "next/server";
import { getAdminFromAccessCookie } from "@/lib/auth-server";
import type { AdminUser } from "@/drizzle/schema";

export class UnauthorizedError extends Error {
  constructor() {
    super("unauthorized");
  }
}

export async function requireAdmin(req: NextRequest): Promise<AdminUser> {
  const ctx = await getAdminFromAccessCookie(req);
  if (!ctx) throw new UnauthorizedError();
  return ctx.admin;
}

export function apiError(code: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: code, ...extra }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof UnauthorizedError) return apiError("unauthorized", 401);
  console.error("[api]", err);
  return apiError("internal_error", 500);
}
