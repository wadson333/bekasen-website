'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import {
  ensureChatSessionId,
  readConsentPreferences,
  type ConsentPreferences,
} from '@/lib/consent';
import { loadLocalChatHistory, saveLocalChatHistory, type StoredChatMessage } from '@/lib/chat-history';

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

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-linear-to-r from-purple-700 to-indigo-700 px-4 py-3 text-white shadow-xl hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={t('openLabel')}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-(family-name:--font-inter) text-sm font-medium">
          {t('bubbleLabel')}
        </span>
        {connectionStatus === 'connected' && (
          <span className="ml-1 h-2 w-2 rounded-full bg-green-400"></span>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex h-128 w-96 flex-col overflow-hidden rounded-2xl border border-border bg-bg-secondary shadow-2xl max-sm:inset-x-4 max-sm:bottom-4 max-sm:h-[calc(100dvh-2rem)] max-sm:w-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-linear-to-r from-purple-700 to-indigo-700 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="font-(family-name:--font-syne) text-sm font-semibold">
                  {t('title')}
                </span>
                {connectionStatus === 'connected' && (
                  <span className="text-xs text-green-300">• {t('statusOnline')}</span>
                )}
                {connectionStatus === 'error' && (
                  <span className="text-xs text-amber-300">• {t('statusLimited')}</span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={t('closeLabel')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="max-w-[80%] space-y-2">
                    <Bot className="mx-auto h-8 w-8 text-purple-400" />
                    <p className="text-sm text-text-secondary">
                      {t('emptyState')}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex max-w-[85%] flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        {msg.sender === 'bot' ? (
                          <Bot className="h-3 w-3 text-purple-400" />
                        ) : (
                          <User className="h-3 w-3 text-purple-300" />
                        )}
                        <span className="text-xs text-text-secondary">
                          {msg.sender === 'bot' ? t('botLabel') : t('userLabel')}
                        </span>
                        {msg.timestamp && (
                          <span className="text-xs text-text-tertiary">
                            {formatTime(msg.timestamp)}
                          </span>
                        )}
                      </div>
                      <div
                        className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-linear-to-r from-purple-700 to-indigo-700 text-white'
                            : 'border border-border bg-bg-primary text-text-primary'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="h-3 w-3 text-purple-400" />
                      <span className="text-xs text-text-secondary">
                        {t('botLabel')}
                      </span>
                    </div>
                    <div className="rounded-xl border border-border bg-bg-primary px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin text-purple-400" />
                        <span className="text-text-secondary">{t('thinking')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick reply buttons */}
            <div className="border-t border-border px-4 py-3">
              <p className="mb-2 text-xs font-medium text-text-secondary">
                {t('quickRepliesLabel')}
              </p>
              <div className="flex flex-wrap gap-2">
                {EnhancedFAQKeys.map((key) => {
                  const label = t(`faq.${key}.label`);
                  const question = t(`faq.${key}.question`);
                  
                  return label && question ? (
                    <button
                      key={key}
                      onClick={() => handleFaqClick(key)}
                      className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-400 transition-all hover:bg-purple-500/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 active:scale-95"
                    >
                      {label}
                    </button>
                  ) : null;
                })}
              </div>
            </div>

            {/* Custom message input */}
            <div className="border-t border-border bg-bg-primary px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('inputPlaceholder')}
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary transition-colors placeholder:text-text-secondary focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-r from-purple-700 to-indigo-700 text-white transition-all hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={t('sendLabel')}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-text-tertiary">
                {t('emptyState')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
