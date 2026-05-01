import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";
import { CHAT_SESSION_COOKIE_NAME, CONSENT_COOKIE_NAME, CONSENT_VERSION, type ConsentPreferences } from "@/lib/consent";
import { getPostgresPool, isPostgresConfigured, queryPostgres } from "@/lib/server/postgres";

export type ChatMessageRole = "user" | "assistant";

export interface PersistedChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  source: string | null;
  model: string | null;
  createdAt: string;
}

export interface ChatHistorySnapshotEntry {
  role: ChatMessageRole;
  content: string;
  source?: string | null;
  model?: string | null;
  createdAt?: string | null;
}

interface ChatMessageRow {
  id: string;
  role: ChatMessageRole;
  content: string;
  source: string | null;
  model: string | null;
  created_at: Date;
}

export function createChatSessionId() {
  return randomUUID();
}

export function getRequestChatSessionId(request: NextRequest) {
  return request.cookies.get(CHAT_SESSION_COOKIE_NAME)?.value ?? null;
}

export function requestAllowsChatPersistence(request: NextRequest) {
  const rawConsent = request.cookies.get(CONSENT_COOKIE_NAME)?.value;

  if (!rawConsent) {
    return false;
  }

  try {
    const parsed = JSON.parse(rawConsent) as Partial<ConsentPreferences>;
    return parsed.version === CONSENT_VERSION && parsed.aiChat === true;
  } catch {
    return false;
  }
}

export async function ensureChatSession(sessionId: string, locale: string, consentVersion = CONSENT_VERSION) {
  if (!isPostgresConfigured()) {
    return;
  }

  await queryPostgres(
    `INSERT INTO chat_sessions (id, locale_initial, consent_version, created_at, updated_at, last_seen_at)
     VALUES ($1, $2, $3, now(), now(), now())
     ON CONFLICT (id) DO UPDATE SET updated_at = now(), last_seen_at = now()`,
    [sessionId, locale, consentVersion],
  );
}

export async function persistChatMessage(params: {
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  source?: string | null;
  model?: string | null;
}) {
  if (!isPostgresConfigured()) {
    return;
  }

  await queryPostgres(
    `INSERT INTO chat_messages (session_id, role, content, source, model, created_at)
     VALUES ($1, $2, $3, $4, $5, now())`,
    [params.sessionId, params.role, params.content, params.source ?? null, params.model ?? null],
  );
}

export async function loadChatMessages(sessionId: string, limit = 100): Promise<PersistedChatMessage[]> {
  if (!isPostgresConfigured()) {
    return [];
  }

  const result = await queryPostgres<ChatMessageRow>(
    `SELECT id, role, content, source, model, created_at
     FROM chat_messages
     WHERE session_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [sessionId, limit],
  );

  return result.rows.map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    source: row.source,
    model: row.model,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function deleteChatSession(sessionId: string) {
  if (!isPostgresConfigured()) {
    return;
  }

  await queryPostgres("DELETE FROM chat_sessions WHERE id = $1", [sessionId]);
}

export async function replaceChatHistory(params: {
  sessionId: string;
  locale: string;
  consentVersion?: number;
  messages: ChatHistorySnapshotEntry[];
}) {
  if (!isPostgresConfigured()) {
    return;
  }

  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO chat_sessions (id, locale_initial, consent_version, created_at, updated_at, last_seen_at)
       VALUES ($1, $2, $3, now(), now(), now())
       ON CONFLICT (id) DO UPDATE SET locale_initial = $2, consent_version = $3, updated_at = now(), last_seen_at = now()`,
      [params.sessionId, params.locale, params.consentVersion ?? CONSENT_VERSION],
    );
    await client.query("DELETE FROM chat_messages WHERE session_id = $1", [params.sessionId]);

    for (const message of params.messages) {
      await client.query(
        `INSERT INTO chat_messages (session_id, role, content, source, model, created_at)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, now()))`,
        [
          params.sessionId,
          message.role,
          message.content,
          message.source ?? null,
          message.model ?? null,
          message.createdAt ?? null,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
