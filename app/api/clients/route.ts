import { NextResponse, type NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clientProjects } from "@/drizzle/schema";
import { generateClientAccessToken } from "@/lib/tokens";
import { CreateClientProjectSchema } from "@/lib/validation/clients";
import { apiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const rows = await db
      .select()
      .from(clientProjects)
      .where(eq(clientProjects.isActive, true))
      .orderBy(desc(clientProjects.updatedAt));
    return NextResponse.json({ clients: rows });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);

    const body = await req.json().catch(() => null);
    const parsed = CreateClientProjectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }
    const data = parsed.data;

    const [inserted] = await db
      .insert(clientProjects)
      .values({
        accessToken: generateClientAccessToken(),
        clientName: data.clientName,
        clientEmail: data.clientEmail || null,
        projectTitle: data.projectTitle,
        locale: data.locale,
        status: data.status,
        progressPct: data.progressPct,
        startDate: data.startDate || null,
        estimatedEndDate: data.estimatedEndDate || null,
        totalPriceCents: data.totalPriceCents ?? null,
        currency: data.currency,
        notesForClient: data.notesForClient ?? null,
        internalNotes: data.internalNotes ?? null,
        notifyOnUpdate: data.notifyOnUpdate,
      })
      .returning();

    return NextResponse.json({ client: inserted }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
