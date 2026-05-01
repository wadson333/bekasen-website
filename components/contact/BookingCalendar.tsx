'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingCalendarProps {
  onDateTimeSelect: (dateTime: { date: string; time: string }) => void;
}

export default function BookingCalendar({ onDateTimeSelect }: BookingCalendarProps) {
  const t = useTranslations('contact');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3)); // April 2026

  // Generate calendar days for April 2026
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // Available time slots
  const timeSlots = [
    '11:15 AM',
    '11:45 AM',
    '12:15 PM',
    '12:45 PM',
    '2:00 PM',
    '2:30 PM',
    '3:00 PM',
    '3:30 PM',
  ];

  const formatDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (day: number) => {
    const dateStr = formatDate(day);
    setSelectedDate(dateStr);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      onDateTimeSelect({ date: selectedDate, time });
    }
  };

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 p-6 rounded-2xl bg-bg-secondary border border-border"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold font-[family-name:var(--font-syne)] text-text-primary mb-1">
          {t('bookCallTitle')}
        </h3>
        <p className="text-sm text-text-secondary">{t('bookCallSubtitle')}</p>
      </div>

      {/* Calendar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-bg-primary rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h4 className="font-semibold text-text-primary text-center flex-1">
            {monthName}
          </h4>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-bg-primary rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-xs font-semibold text-text-secondary text-center py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const dateStr = formatDate(day);
            const isSelected = selectedDate === dateStr;
            const isToday =
              new Date().toDateString() ===
              new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

            return (
              <motion.button
                key={day}
                onClick={() => handleDateSelect(day)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`aspect-square rounded-lg font-medium text-sm transition-all border ${
                  isSelected
                    ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/30'
                    : isToday
                      ? 'bg-purple-500/10 text-text-primary border-purple-500/50'
                      : 'bg-bg-primary text-text-primary border-border hover:border-purple-500/30'
                }`}
              >
                {day}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm font-medium text-text-primary mb-3">
            {t('selectTime')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {timeSlots.map((time, index) => (
              <motion.button
                key={time}
                onClick={() => handleTimeSelect(time)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`py-3 px-4 rounded-lg font-medium text-sm transition-all border ${
                  selectedTime === time
                    ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/30'
                    : 'bg-bg-primary text-text-primary border-border hover:border-purple-500/30'
                }`}
              >
                {time}
              </motion.button>
            ))}
          </div>
          {selectedTime && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-3 text-xs text-purple-400 font-medium"
            >
              ✓ {t('availableNow')}
            </motion.p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
