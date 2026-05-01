'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ServiceCheckboxesProps {
  selectedServices: string[];
  onChange: (services: string[]) => void;
}

export default function ServiceCheckboxes({
  selectedServices,
  onChange,
}: ServiceCheckboxesProps) {
  const t = useTranslations('contact');

  const services = [
    { id: 'brand', label: t('serviceBrandDevelopment') },
    { id: 'website', label: t('serviceWebsiteDesign') },
    { id: 'marketing', label: t('serviceDigitalMarketing') },
    { id: 'research', label: t('serviceMarketResearch') },
    { id: 'analytics', label: t('serviceDataAnalytics') },
    { id: 'seo', label: t('serviceAIPoweredSEO') },
  ];

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      onChange(selectedServices.filter((id) => id !== serviceId));
    } else {
      onChange([...selectedServices, serviceId]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-4">
        {t('labelServices')}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((service, index) => (
          <motion.button
            key={service.id}
            type="button"
            onClick={() => toggleService(service.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
              selectedServices.includes(service.id)
                ? 'bg-purple-500/10 border-purple-500 shadow-md shadow-purple-500/20'
                : 'bg-bg-primary border-border hover:border-purple-500/30'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                selectedServices.includes(service.id)
                  ? 'bg-purple-500 border-purple-500'
                  : 'border-border'
              }`}
            >
              {selectedServices.includes(service.id) && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </div>
            <span className="text-sm font-medium text-text-primary">
              {service.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
