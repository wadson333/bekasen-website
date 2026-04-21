'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
}

const FAQ_KEYS = [
  'services',
  'pricing',
  'timeline',
  'techStack',
  'contact',
] as const;

export default function ChatBot() {
  const t = useTranslations('chatbot');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = () => {
    if (!hasGreeted) {
      setMessages([{ id: 1, text: t('greeting'), sender: 'bot' }]);
      setHasGreeted(true);
    }
    setIsOpen(true);
  };

  const handleFaqClick = (key: (typeof FAQ_KEYS)[number]) => {
    const question = t(`faq.${key}.question`);
    const answer = t(`faq.${key}.answer`);

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: question, sender: 'user' },
      { id: Date.now() + 1, text: answer, sender: 'bot' },
    ]);
  };

  const handleSendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, sender: 'user' },
      { id: Date.now() + 1, text: t('autoReply'), sender: 'bot' },
    ]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-purple-700 px-4 py-3 text-white shadow-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={t('openLabel')}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium font-[family-name:var(--font-inter)]">
          {t('bubbleLabel')}
        </span>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-purple-700 px-4 py-3 text-white">
              <span className="text-sm font-semibold font-[family-name:var(--font-syne)]">
                {t('title')}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={t('closeLabel')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-purple-700 text-white'
                        : 'bg-[var(--bg-primary)] text-[var(--text-primary)]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick reply buttons */}
            <div className="border-t border-[var(--border)] px-4 py-3">
              <p className="mb-2 text-xs text-[var(--text-secondary)]">
                {t('quickRepliesLabel')}
              </p>
              <div className="flex flex-wrap gap-2">
                {FAQ_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleFaqClick(key)}
                    className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-400 transition-colors hover:bg-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {t(`faq.${key}.label`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom message input */}
            <div className="border-t border-[var(--border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('inputPlaceholder')}
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-700 text-white transition-colors hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-400"
                  aria-label={t('sendLabel')}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
