/**
 * Resend wrapper. Send a plain-text or HTML email. No-op (logs only) when
 * RESEND_API_KEY is missing or set to PLACEHOLDER — keeps dev safe.
 */
import { Resend } from "resend";

type SendOpts = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key || key === "PLACEHOLDER") return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

export async function sendEmail(
  opts: SendOpts,
): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
  const client = getClient();
  if (!client) {
    console.log(`[email skipped — no RESEND_API_KEY] to=${opts.to} subject=${opts.subject}`);
    return { ok: false, reason: "no_key" };
  }

  const from = process.env.EMAIL_FROM?.trim() || "Bekasen <noreply@bekasen.com>";

  try {
    const { data, error } = await client.emails.send({
      from,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    if (error) {
      console.error("[email error]", error);
      return { ok: false, reason: error.message ?? "resend_error" };
    }
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    console.error("[email exception]", err);
    return { ok: false, reason: err instanceof Error ? err.message : "unknown" };
  }
}

/**
 * Convenience: notify the founder of a new lead (contact form or chatbot).
 * Pulls EMAIL_NOTIFY_TO from env.
 */
export async function notifyNewLead(opts: {
  name: string;
  email: string;
  projectType?: string | null;
  message: string;
  source: "website" | "chatbot" | "referral";
  isQualified?: boolean;
}) {
  const to = process.env.EMAIL_NOTIFY_TO?.trim();
  if (!to) return { ok: false, reason: "no_recipient" };

  const subjectPrefix = opts.isQualified ? "[QUALIFIED]" : "[NEW LEAD]";
  const subject = `${subjectPrefix} ${opts.name} — ${opts.projectType ?? "general inquiry"}`;

  const text = [
    `Source: ${opts.source}${opts.isQualified ? " (qualified by chatbot)" : ""}`,
    `Name:   ${opts.name}`,
    `Email:  ${opts.email}`,
    opts.projectType ? `Type:   ${opts.projectType}` : null,
    "",
    "Message:",
    opts.message,
    "",
    "—",
    "Sent automatically by Bekasen.",
  ].filter(Boolean).join("\n");

  return sendEmail({ to, subject, text, replyTo: opts.email });
}

/**
 * Convenience: notify a client that their project dashboard was updated.
 * Skipped when client_email is missing or notify_on_update is false.
 */
export async function notifyClientUpdate(opts: {
  clientEmail: string | null;
  clientName: string;
  projectTitle: string;
  dashboardUrl: string;
  notifyOnUpdate: boolean;
}) {
  if (!opts.notifyOnUpdate || !opts.clientEmail) {
    return { ok: false, reason: "skipped" };
  }

  const subject = `Update on your project — ${opts.projectTitle}`;
  const text = [
    `Hi ${opts.clientName},`,
    "",
    `Your project "${opts.projectTitle}" has been updated.`,
    "",
    `View the latest progress here: ${opts.dashboardUrl}`,
    "",
    "Thanks,",
    "Bekasen",
  ].join("\n");

  return sendEmail({ to: opts.clientEmail, subject, text });
}
