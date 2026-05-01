import { NextRequest, NextResponse } from "next/server";
import { CONSENT_VERSION } from "@/lib/consent";
import { getRequestChatSessionId, loadChatMessages, replaceChatHistory, requestAllowsChatPersistence } from "@/lib/server/chat-history";

interface HistoryPayloadMessage {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp?: number;
}

export async function GET(request: NextRequest) {
  if (!requestAllowsChatPersistence(request)) {
    return NextResponse.json({ messages: [] });
  }

  const sessionId = getRequestChatSessionId(request);

  if (!sessionId) {
    return NextResponse.json({ messages: [] });
  }

  const messages = await loadChatMessages(sessionId);

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  if (!requestAllowsChatPersistence(request)) {
    return NextResponse.json({ error: "Chat persistence consent is required" }, { status: 403 });
  }

  const sessionId = getRequestChatSessionId(request);

  if (!sessionId) {
    return NextResponse.json({ error: "Chat session is required" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as { locale?: unknown; messages?: unknown };
  const locale = typeof body.locale === "string" ? body.locale : "fr";
  const messages = Array.isArray(body.messages) ? body.messages.filter(isHistoryPayloadMessage) : [];

  await replaceChatHistory({
    sessionId,
    locale,
    consentVersion: CONSENT_VERSION,
    messages: messages.map((message) => ({
      role: message.sender === "bot" ? "assistant" : "user",
      content: message.text,
      source: message.sender === "bot" ? "sync" : "user",
      createdAt: typeof message.timestamp === "number" ? new Date(message.timestamp).toISOString() : null,
    })),
  });

  return NextResponse.json({ ok: true, count: messages.length });
}

function isHistoryPayloadMessage(value: unknown): value is HistoryPayloadMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<HistoryPayloadMessage>;

  return (
    typeof message.id === "number" &&
    typeof message.text === "string" &&
    (message.sender === "bot" || message.sender === "user") &&
    (typeof message.timestamp === "number" || typeof message.timestamp === "undefined")
  );
}
