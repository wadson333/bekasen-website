'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, ArrowUpRight } from 'lucide-react';
import CalBookingButton from '@/components/CalBookingButton';
import {
  ensureChatSessionId,
  readConsentPreferences,
  type ConsentPreferences,
} from '@/lib/consent';
import { loadLocalChatHistory, saveLocalChatHistory, type StoredChatMessage } from '@/lib/chat-history';

// Cap conversation length per the lead-qualification spec — when reached, the
// input is replaced by a Cal.com booking CTA so the visitor doesn't loop in
// the bot forever. Mirrors the server-side cap in /api/chat.
const MAX_USER_MESSAGES = 10;

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp?: number;
}

interface ChatResponse {
  response: string;
  source?: string;
  question?: string;
  category?: string;
  suggestions?: string[];
  suggestedQuestions?: string[];
}

interface PersistedChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

function isSameConsent(
  a: ConsentPreferences | null,
  b: ConsentPreferences | null,
): boolean {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return (
    a.version === b.version &&
    a.preferences === b.preferences &&
    a.aiChat === b.aiChat &&
    a.updatedAt === b.updatedAt
  );
}

const FAQ_KEYS = [
  'services',
  'pricing',
  'timeline',
  'techStack',
  'contact',
  'portfolio',
  'process',
  'location',
] as const;

export default function ChatBot() {
  const t = useTranslations('chatbot');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [consent, setConsent] = useState<ConsentPreferences | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const syncTimeoutRef = useRef<number | null>(null);
  const lastSyncedMessageCountRef = useRef(0);

  const checkApiConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/chat');
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    }
  }, []);

  const toStoredMessage = useCallback((message: Message): StoredChatMessage => ({
    id: message.id,
    text: message.text,
    sender: message.sender,
    timestamp: message.timestamp,
  }), []);

  const fromStoredMessage = useCallback((message: StoredChatMessage): Message => ({
    id: message.id,
    text: message.text,
    sender: message.sender,
    timestamp: message.timestamp,
  }), []);

  const fromPersistedMessage = useCallback((message: PersistedChatMessage, index: number): Message => ({
    id: Number(message.id) || Date.parse(message.createdAt) || index + 1,
    text: message.content,
    sender: message.role === 'assistant' ? 'bot' : 'user',
    timestamp: Date.parse(message.createdAt) || Date.now(),
  }), []);

  const ensureChatSession = useCallback(async (nextConsent: ConsentPreferences | null = null) => {
    const localSessionId = ensureChatSessionId();
    setChatSessionId(localSessionId);

    if (!nextConsent?.aiChat) {
      return localSessionId;
    }

    const response = await fetch('/api/chat/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    });

    if (!response.ok) {
      return localSessionId;
    }

    const body = await response.json() as { sessionId?: unknown };

    if (typeof body.sessionId !== 'string') {
      return localSessionId;
    }

    setChatSessionId(body.sessionId);

    return body.sessionId;
  }, [locale]);

  const flushChatHistory = useCallback(async (nextMessages: Message[]) => {
    if (!consent?.aiChat || !chatSessionId || nextMessages.length === 0) {
      return;
    }

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }

    const response = await fetch('/api/chat/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locale,
        messages: nextMessages.map(toStoredMessage),
      }),
    });

    if (!response.ok) {
      return;
    }

    lastSyncedMessageCountRef.current = nextMessages.length;
  }, [chatSessionId, consent?.aiChat, locale, toStoredMessage]);

  const initializeChatHistory = useCallback(async (nextConsent: ConsentPreferences | null) => {
    const sessionId = ensureChatSessionId();
    setChatSessionId(sessionId);

    const cachedMessages = loadLocalChatHistory(sessionId).map(fromStoredMessage);

    if (cachedMessages.length > 0) {
      setMessages(cachedMessages);
      setHasGreeted(true);
    }

    if (!nextConsent?.aiChat) {
      return;
    }

    await ensureChatSession(nextConsent);

    const response = await fetch('/api/chat/history');

    if (!response.ok) {
      return;
    }

    const body = await response.json() as { messages?: PersistedChatMessage[] };
    const persistedMessages = Array.isArray(body.messages) ? body.messages.map(fromPersistedMessage) : [];

    if (cachedMessages.length === 0 && persistedMessages.length > 0) {
      lastSyncedMessageCountRef.current = persistedMessages.length;
      setMessages(persistedMessages);
      setHasGreeted(true);
    }
  }, [ensureChatSession, fromPersistedMessage, fromStoredMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Test API connection when chatbot opens
    if (isOpen && connectionStatus === 'idle') {
      checkApiConnection();
    }
  }, [isOpen, connectionStatus, checkApiConnection]);

  useEffect(() => {
    const currentConsent = readConsentPreferences();
    setConsent((previousConsent) =>
      isSameConsent(previousConsent, currentConsent) ? previousConsent : currentConsent,
    );

    void initializeChatHistory(currentConsent);
  }, [locale, initializeChatHistory]);

  useEffect(() => {
    const handleConsentChange = (event: Event) => {
      const nextConsent = (event as CustomEvent<ConsentPreferences | null>).detail;
      setConsent(nextConsent);

      void initializeChatHistory(nextConsent);
    };

    window.addEventListener('bekasen-consent-change', handleConsentChange);
    return () => window.removeEventListener('bekasen-consent-change', handleConsentChange);
  }, [initializeChatHistory]);

  useEffect(() => {
    if (!chatSessionId) {
      return;
    }

    saveLocalChatHistory(chatSessionId, messages.map(toStoredMessage));
  }, [chatSessionId, messages, toStoredMessage]);

  useEffect(() => {
    if (!chatSessionId || !consent?.aiChat || messages.length === 0) {
      return;
    }

    const unsyncedMessages = messages.length - lastSyncedMessageCountRef.current;

    if (unsyncedMessages >= 10) {
      void flushChatHistory(messages);
      return;
    }

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      void flushChatHistory(messages);
    }, 30_000);

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
  }, [chatSessionId, consent?.aiChat, messages, flushChatHistory]);

  const handleOpen = () => {
    if (!hasGreeted) {
      setMessages([{ 
        id: 1, 
        text: t('greeting'), 
        sender: 'bot',
        timestamp: Date.now()
      }]);
      setHasGreeted(true);
    }
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleFaqClick = (key: (typeof FAQ_KEYS)[number]) => {
    const question = t(`faq.${key}.question`);
    void sendMessage(question);
  };

  const sendToChatAPI = async (userMessage: string): Promise<ChatResponse> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          locale: locale
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  };

  const sendMessage = async (trimmed: string) => {
    if (!trimmed || isLoading) return;

    // Cap reached → silently ignore (UI replaces input with Cal CTA, but a
    // race condition could still trigger this from a stale state).
    const userTurnCount = messages.filter((m) => m.sender === 'user').length;
    if (userTurnCount >= MAX_USER_MESSAGES) return;

    // Add user message
    const userMessageId = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, text: trimmed, sender: 'user', timestamp: userMessageId },
    ]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send to API
      const apiResponse = await sendToChatAPI(trimmed);
      
      // Add bot response
      const botMessageId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { 
          id: botMessageId, 
          text: apiResponse.response, 
          sender: 'bot',
          timestamp: botMessageId 
        },
      ]);
      
      setConnectionStatus('connected');
    } catch (error) {
      // Fallback to static response if API fails
      const botMessageId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { 
          id: botMessageId, 
          text: t('autoReply'), 
          sender: 'bot',
          timestamp: botMessageId 
        },
      ]);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(locale, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const EnhancedFAQKeys = [...FAQ_KEYS] as const;

  // Count how many user messages have been sent. When this hits
  // MAX_USER_MESSAGES the input is hidden and replaced by a Cal CTA.
  const userMessageCount = useMemo(
    () => messages.filter((m) => m.sender === 'user').length,
    [messages],
  );
  const capReached = userMessageCount >= MAX_USER_MESSAGES;

  return (
    <>
      {/* Floating trigger button — premium pill with avatar + pulse */}
      <motion.button
        onClick={handleOpen}
        className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-2 pl-2 pr-5 text-white shadow-[0_8px_32px_rgba(124,58,237,0.40)] transition-shadow hover:shadow-[0_12px_40px_rgba(124,58,237,0.55)] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 cursor-pointer"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-label={t('openLabel')}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        {/* Avatar with pulse */}
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
          <Sparkles className="h-5 w-5" strokeWidth={2.2} />
          {connectionStatus === 'connected' && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-purple-600" />
            </span>
          )}
        </span>
        <span className="font-(family-name:--font-syne) text-sm font-semibold">
          {t('bubbleLabel')}
        </span>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
            className="fixed bottom-6 right-6 z-50 flex h-[640px] w-[420px] flex-col overflow-hidden rounded-3xl border border-border bg-bg-card shadow-[0_30px_80px_rgba(15,23,42,0.18)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.5)] max-sm:inset-x-4 max-sm:bottom-4 max-sm:h-[calc(100dvh-2rem)] max-sm:w-auto"
          >
            {/* Header — gradient with avatar + status + close */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-4 text-white">
              {/* Decorative blob */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/25 backdrop-blur-sm">
                    <Sparkles className="h-5 w-5" strokeWidth={2.2} />
                    {connectionStatus === 'connected' && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-purple-600" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-(family-name:--font-syne) text-sm font-bold leading-tight">
                      {t('title')}
                    </p>
                    <p className="text-[11px] text-white/80">
                      {connectionStatus === 'connected'
                        ? t('statusOnline')
                        : connectionStatus === 'error'
                          ? t('statusLimited')
                          : '...'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                  aria-label={t('closeLabel')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <p className="max-w-[85%] text-sm text-text-secondary">{t('emptyState')}</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const prev = messages[idx - 1];
                  const isFirstOfGroup = !prev || prev.sender !== msg.sender;
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isFirstOfGroup ? 'mt-3' : 'mt-1'}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed shadow-[0_2px_8px_rgba(15,23,42,0.04)] ${
                          isUser
                            ? `rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white ${isFirstOfGroup ? 'rounded-tr-md' : 'rounded-tr-2xl'} rounded-br-md`
                            : `rounded-2xl border border-border bg-bg-secondary text-text-primary ${isFirstOfGroup ? 'rounded-tl-md' : 'rounded-tl-2xl'} rounded-bl-md`
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              {isLoading && (
                <div className="flex justify-start mt-3">
                  <div className="rounded-2xl rounded-tl-md rounded-bl-md border border-border bg-bg-secondary px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies — only show when no chat in progress (or first 2 messages) */}
            {messages.length <= 1 && !capReached ? (
              <div className="border-t border-border bg-bg-card px-5 py-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  {t('quickRepliesLabel')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {EnhancedFAQKeys.slice(0, 5).map((key) => {
                    const label = t(`faq.${key}.label`);
                    const question = t(`faq.${key}.question`);
                    return label && question ? (
                      <button
                        key={key}
                        onClick={() => handleFaqClick(key)}
                        className="rounded-full border border-border bg-bg-secondary px-3 py-1 text-[11px] text-text-primary transition-colors hover:border-purple-400 hover:text-purple-500 cursor-pointer"
                      >
                        {label}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            ) : null}

            {/* Cap reached → input replaced by Cal CTA card */}
            {capReached ? (
              <div className="border-t border-border bg-gradient-to-br from-purple-500/[0.08] via-bg-card to-bg-card px-5 py-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-(family-name:--font-syne) text-sm font-bold text-text-primary">
                      {locale === 'fr'
                        ? "Continuons en direct"
                        : locale === 'ht'
                          ? 'Ann kontinye an dirèk'
                          : locale === 'es'
                            ? 'Sigamos en directo'
                            : "Let's continue live"}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                      {locale === 'fr'
                        ? "Vous avez utilisé toutes vos questions du chat. Réservons 15 min et on creuse votre projet ensemble."
                        : locale === 'ht'
                          ? "Ou itilize tout kesyon chat la. Ann rezève 15 min epi nou diskite pwojè w."
                          : locale === 'es'
                            ? "Has usado todas tus preguntas del chat. Reservemos 15 min y revisamos tu proyecto juntos."
                            : "You've used all your chat questions. Let's book 15 min and dig into your project together."}
                    </p>
                  </div>
                </div>
                <CalBookingButton
                  type="discovery15"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.30)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(124,58,237,0.45)] cursor-pointer"
                >
                  {locale === 'fr'
                    ? 'Réserver 15 min gratuites'
                    : locale === 'ht'
                      ? 'Rezève 15 min gratis'
                      : locale === 'es'
                        ? 'Reservar 15 min gratis'
                        : 'Book 15 min — free'}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </CalBookingButton>
              </div>
            ) : (
              <div className="border-t border-border bg-bg-card px-5 py-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('inputPlaceholder')}
                    disabled={isLoading}
                    className="flex-1 rounded-full border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary transition-colors placeholder:text-text-secondary/70 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-[0_4px_16px_rgba(124,58,237,0.30)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)] focus:outline-none focus:ring-2 focus:ring-purple-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 cursor-pointer"
                    aria-label={t('sendLabel')}
                  >
                    <Send className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-text-secondary">
                  <span className="opacity-70">Powered by Bekasen</span>
                  <span className="font-medium tabular-nums">
                    {userMessageCount} / {MAX_USER_MESSAGES}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
