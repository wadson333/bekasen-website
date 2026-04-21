'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Test API connection when chatbot opens
    if (isOpen && connectionStatus === 'idle') {
      checkApiConnection();
    }
  }, [isOpen]);

  const checkApiConnection = async () => {
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
  };

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
    const answer = t(`faq.${key}.answer`);

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: question, sender: 'user', timestamp: Date.now() },
      { id: Date.now() + 1, text: answer, sender: 'bot', timestamp: Date.now() + 1 },
    ]);
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

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
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
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 px-4 py-3 text-white shadow-xl hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={t('openLabel')}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium font-[family-name:var(--font-inter)]">
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
            className="fixed bottom-6 right-6 z-50 flex h-[32rem] w-[24rem] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-700 to-indigo-700 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="text-sm font-semibold font-[family-name:var(--font-syne)]">
                  {t('title')}
                </span>
                {connectionStatus === 'connected' && (
                  <span className="text-xs text-green-300">• Online</span>
                )}
                {connectionStatus === 'error' && (
                  <span className="text-xs text-amber-300">• Limited</span>
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
                    <p className="text-sm text-[var(--text-secondary)]">
                      Hi! I'm your Bekasen assistant. Ask me about services, pricing, or anything else!
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
                        <span className="text-xs text-[var(--text-secondary)]">
                          {msg.sender === 'bot' ? 'Bekasen Assistant' : 'You'}
                        </span>
                        {msg.timestamp && (
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {formatTime(msg.timestamp)}
                          </span>
                        )}
                      </div>
                      <div
                        className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white'
                            : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border)]'
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
                      <span className="text-xs text-[var(--text-secondary)]">
                        Bekasen Assistant
                      </span>
                    </div>
                    <div className="rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin text-purple-400" />
                        <span className="text-[var(--text-secondary)]">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick reply buttons */}
            <div className="border-t border-[var(--border)] px-4 py-3">
              <p className="mb-2 text-xs text-[var(--text-secondary)] font-medium">
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
            <div className="border-t border-[var(--border)] px-4 py-3 bg-[var(--bg-primary)]">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('inputPlaceholder')}
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 text-white transition-all hover:from-purple-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-400 active:scale-95"
                  aria-label={t('sendLabel')}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-[var(--text-tertiary)] text-center">
                Ask about services, pricing, timeline, or anything else!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
