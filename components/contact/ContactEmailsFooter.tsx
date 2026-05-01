'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

export default function ContactEmailsFooter() {
  const t = useTranslations('contact');

  const emailCategories = [
    {
      label: t('contactEmails.generalLabel'),
      email: t('contactEmails.generalEmail'),
      icon: '📧',
    },
    {
      label: t('contactEmails.careersLabel'),
      email: t('contactEmails.careersEmail'),
      icon: '💼',
    },
    {
      label: t('contactEmails.partnershipLabel'),
      email: t('contactEmails.partnershipEmail'),
      icon: '🤝',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-12 pt-12 border-t border-border"
    >
      <h3 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-text-primary mb-8">
        {t('infoTitle')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {emailCategories.map((category, index) => (
          <motion.a
            key={category.email}
            href={`mailto:${category.email}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            className="group p-6 rounded-2xl bg-bg-secondary border border-border hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{category.icon}</span>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
                {category.label}
              </p>
            </div>
            <p className="text-text-primary font-semibold group-hover:text-purple-400 transition-colors break-all">
              {category.email}
            </p>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
