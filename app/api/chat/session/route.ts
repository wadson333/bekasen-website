import { NextRequest, NextResponse } from "next/server";
import { CHAT_SESSION_COOKIE_NAME, CONSENT_VERSION } from "@/lib/consent";
import { createChatSessionId, deleteChatSession, ensureChatSession, getRequestChatSessionId, requestAllowsChatPersistence } from "@/lib/server/chat-history";

const sessionCookieMaxAge = 60 * 60 * 24 * 180;

export async function POST(request: NextRequest) {
  if (!requestAllowsChatPersistence(request)) {
    return NextResponse.json({ error: "Chat persistence consent is required" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({})) as { locale?: unknown };
  const locale = typeof body.locale === "string" ? body.locale : "fr";
  const sessionId = getRequestChatSessionId(request) ?? createChatSessionId();

  await ensureChatSession(sessionId, locale, CONSENT_VERSION);

  const response = NextResponse.json({ sessionId });
  response.cookies.set(CHAT_SESSION_COOKIE_NAME, sessionId, {
    maxAge: sessionCookieMaxAge,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}

export async function DELETE(request: NextRequest) {
  const sessionId = getRequestChatSessionId(request);

  if (sessionId) {
    await deleteChatSession(sessionId);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(CHAT_SESSION_COOKIE_NAME, "", {
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
