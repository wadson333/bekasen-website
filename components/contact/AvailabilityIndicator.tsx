'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';

export default function AvailabilityIndicator() {
  const t = useTranslations('contact');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        {/* Availability Badge */}
        <div>
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest text-purple-400 bg-purple-500/20 border border-purple-500/40 rounded-full">
            {t('availabilityBadge')}
          </span>
          <h3 className="text-lg font-bold font-[family-name:var(--font-syne)] text-text-primary mt-3">
            {t('listeningTitle')}
          </h3>
          <p className="text-text-secondary text-sm mt-1">
            {t('listeningSubtitle')}
          </p>
        </div>

        {/* Info Grid */}
        <div className="flex flex-col gap-3 sm:text-right">
          <div>
            <p className="flex items-center gap-2 sm:justify-end text-xs text-text-secondary uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4 text-purple-400" />
              {t('responseTime')}
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {t('responseTimeValue')}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-2 sm:justify-end text-xs text-text-secondary uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4 text-purple-400" />
              {t('basedIn')}
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {t('basedInValue')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
