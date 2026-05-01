import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/drizzle/schema";
import { ContactSubmissionSchema } from "@/lib/validation/clients";
import { sanitizePlainText } from "@/lib/sanitize";

export const runtime = "nodejs";

/**
 * POST /api/contact
 *
 * Public endpoint — visitor submits the contact form. Sanitized + persisted
 * to contact_submissions. Rate limited at the Nginx layer per the spec
 * (the website-side form has no other gate).
 *
 * Origin check is INTENTIONALLY skipped here because we want the form to
 * also accept submissions from /contact even when posted via JS fetch from
 * the same domain (Origin header may be missing in some browsers / extensions).
 * The form is rate-limited and validated; CSRF risk is null since this
 * endpoint has no side effect on a logged-in user's session.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = ContactSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const data = parsed.data;
  const cleanedMessage = sanitizePlainText(data.message);
  if (!cleanedMessage) {
    return NextResponse.json({ error: "empty_message" }, { status: 400 });
  }

  const [row] = await db
    .insert(contactSubmissions)
    .values({
      name: sanitizePlainText(data.name, 255),
      email: data.email.toLowerCase().trim(),
      projectType: data.projectType ? sanitizePlainText(data.projectType, 100) : null,
      message: cleanedMessage,
      source: "website",
    })
    .returning({ id: contactSubmissions.id });

  return NextResponse.json({ ok: true, id: row?.id }, { status: 201 });
}
