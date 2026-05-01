export interface StoredChatMessage {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp?: number;
}

interface StoredChatHistory {
  sessionId: string;
  savedAt: string;
  messages: StoredChatMessage[];
}

const maxStoredMessages = 50;
const storageKey = "bekasen_chat_history";

export function loadLocalChatHistory(sessionId: string): StoredChatMessage[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredChatHistory>;

    if (parsed.sessionId !== sessionId || !Array.isArray(parsed.messages)) {
      return [];
    }

    return parsed.messages.filter(isStoredChatMessage).slice(-maxStoredMessages);
  } catch {
    return [];
  }
}

export function saveLocalChatHistory(sessionId: string, messages: StoredChatMessage[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredChatHistory = {
    sessionId,
    savedAt: new Date().toISOString(),
    messages: messages.filter(isStoredChatMessage).slice(-maxStoredMessages),
  };

  window.localStorage.setItem(storageKey, JSON.stringify(payload));
}

export function clearLocalChatHistory() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey);
}

function isStoredChatMessage(value: unknown): value is StoredChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<StoredChatMessage>;

  return (
    typeof message.id === "number" &&
    typeof message.text === "string" &&
    (message.sender === "bot" || message.sender === "user") &&
    (typeof message.timestamp === "number" || typeof message.timestamp === "undefined")
  );
}
