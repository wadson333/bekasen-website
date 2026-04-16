"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";

/* ── Avatar SVG components ────────────────────────────────────── */
function AvatarMariClaire() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#E9D5FF" />
      <circle cx="24" cy="19" r="8" fill="#7C3AED" />
      <ellipse cx="24" cy="38" rx="13" ry="10" fill="#7C3AED" />
      <circle cx="24" cy="19" r="6" fill="#DDD6FE" />
      <path d="M18 15c0-4 3-7 6-7s6 3 6 7" stroke="#5B21B6" strokeWidth="1.5" fill="none" />
      <circle cx="22" cy="18" r="1" fill="#5B21B6" />
      <circle cx="26" cy="18" r="1" fill="#5B21B6" />
      <path d="M22 21c1 1.5 3 1.5 4 0" stroke="#5B21B6" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function AvatarJeanBaptiste() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#C4B5FD" />
      <circle cx="24" cy="19" r="8" fill="#4C1D95" />
      <ellipse cx="24" cy="38" rx="13" ry="10" fill="#4C1D95" />
      <circle cx="24" cy="19" r="6" fill="#EDE9FE" />
      <rect x="17" y="12" width="14" height="5" rx="2" fill="#4C1D95" />
      <circle cx="22" cy="18" r="1" fill="#4C1D95" />
      <circle cx="26" cy="18" r="1" fill="#4C1D95" />
      <path d="M22 21c1 1.2 3 1.2 4 0" stroke="#4C1D95" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <rect x="20" y="23" width="8" height="2" rx="1" fill="#EDE9FE" opacity="0.5" />
    </svg>
  );
}

function AvatarSophieLaurent() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#F3E8FF" />
      <circle cx="24" cy="19" r="8" fill="#9333EA" />
      <ellipse cx="24" cy="38" rx="13" ry="10" fill="#9333EA" />
      <circle cx="24" cy="19" r="6" fill="#F5F3FF" />
      <path d="M16 16c0-5 4-9 8-9s8 4 8 9c0 1-1 2-2 2h-12c-1 0-2-1-2-2z" fill="#9333EA" opacity="0.7" />
      <circle cx="22" cy="18" r="1" fill="#581C87" />
      <circle cx="26" cy="18" r="1" fill="#581C87" />
      <path d="M22 21c1 1.5 3 1.5 4 0" stroke="#581C87" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const avatars = [AvatarMariClaire, AvatarJeanBaptiste, AvatarSophieLaurent];

/* ── Testimonial data keys ────────────────────────────────────── */
const testimonialKeys = ["testimonial1", "testimonial2", "testimonial3"] as const;

/* ── Stats per testimonial ────────────────────────────────────── */
const testimonialStats = [
  { stat1Value: "300%", stat1Key: "stat1Label", stat2Value: "3", stat2Key: "stat2Label" },
  { stat1Value: "10x", stat1Key: "stat3Label", stat2Value: "95%", stat2Key: "stat4Label" },
  { stat1Value: "200%", stat1Key: "stat5Label", stat2Value: "50+", stat2Key: "stat6Label" },
];

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > active ? 1 : -1);
      setActive(index);
    },
    [active]
  );

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActive((prev) => (prev === 0 ? testimonialKeys.length - 1 : prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setActive((prev) => (prev === testimonialKeys.length - 1 ? 0 : prev + 1));
  }, []);

  /* Auto-rotate every 6s */
  useEffect(() => {
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [goNext]);

  const getIndex = (offset: number) =>
    (active + offset + testimonialKeys.length) % testimonialKeys.length;

  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest text-purple-400 bg-purple-400/10 rounded-full mb-4">
            {t("badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-syne)] text-text-primary">
            {t("title")}
          </h2>
          <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Desktop 3-card view */}
          <div className="hidden md:flex items-center justify-center gap-6">
            {[-1, 0, 1].map((offset) => {
              const idx = getIndex(offset);
              const key = testimonialKeys[idx];
              const Avatar = avatars[idx];
              const isCenter = offset === 0;

              return (
                <motion.div
                  key={`${key}-${offset}`}
                  className={`relative bg-bg-card border border-border p-8 flex flex-col cursor-pointer transition-all duration-500 w-[360px] ${
                    isCenter ? "z-10 shadow-xl shadow-purple-500/10" : "z-0"
                  }`}
                  style={{ clipPath: "polygon(2% 0%, 98% 0%, 100% 3%, 100% 97%, 98% 100%, 2% 100%, 0% 97%, 0% 3%)" }}
                  animate={{
                    opacity: isCenter ? 1 : 0.3,
                    scale: isCenter ? 1 : 0.92,
                    filter: isCenter ? "blur(0px)" : "blur(1px)",
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  onClick={() => !isCenter && goTo(idx)}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-5 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-purple-400 text-purple-400"
                      />
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-text-secondary text-sm md:text-base leading-relaxed text-center flex-1">
                    &ldquo;{t(`${key}Text`)}&rdquo;
                  </p>

                  {/* Author with Avatar */}
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Avatar />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary font-[family-name:var(--font-syne)] text-sm">
                        {t(`${key}Name`)}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t(`${key}Role`)}
                      </p>
                    </div>
                  </div>


                </motion.div>
              );
            })}
          </div>

          {/* Mobile single-card view */}
          <div className="md:hidden relative min-h-[380px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={active}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-bg-card border border-border p-6 flex flex-col shadow-xl shadow-purple-500/10"
                style={{ clipPath: "polygon(2% 0%, 98% 0%, 100% 3%, 100% 97%, 98% 100%, 2% 100%, 0% 97%, 0% 3%)" }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4 justify-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-purple-400 text-purple-400"
                    />
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-text-secondary text-sm leading-relaxed text-center flex-1">
                  &ldquo;{t(`${testimonialKeys[active]}Text`)}&rdquo;
                </p>

                {/* Author with Avatar */}
                <div className="mt-5 flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {(() => {
                      const Avatar = avatars[active];
                      return <Avatar />;
                    })()}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary font-[family-name:var(--font-syne)] text-sm">
                      {t(`${testimonialKeys[active]}Name`)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {t(`${testimonialKeys[active]}Role`)}
                    </p>
                  </div>
                </div>


              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={goPrev}
              className="p-2 rounded-full border border-border bg-bg-card hover:bg-purple-400/10 hover:border-purple-400/30 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-text-secondary" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonialKeys.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === active
                      ? "bg-purple-400 w-6"
                      : "bg-text-secondary/30 hover:bg-text-secondary/50"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="p-2 rounded-full border border-border bg-bg-card hover:bg-purple-400/10 hover:border-purple-400/30 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
