"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type Props = {
  /** Target number to count up to */
  to: number;
  /** Animation duration in ms (default 1500). Honors prefers-reduced-motion. */
  duration?: number;
  /** Optional prefix (e.g. "$") */
  prefix?: string;
  /** Optional suffix (e.g. "+") */
  suffix?: string;
  /** Render fallback as plain text on the server (SEO + no-JS). */
  className?: string;
};

/**
 * Animated number counter — counts from 0 → `to` once the element scrolls
 * into view. Uses requestAnimationFrame for smooth easing.
 *
 * Reduced-motion: skips the animation, renders the final value immediately.
 *
 * SSR-safe: starts at 0 on the server, hydrates to the final value if motion
 * is disabled, or animates after the first IntersectionObserver fire.
 */
export default function NumberCounter({
  to,
  duration = 1500,
  prefix = "",
  suffix = "",
  className,
}: Props) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? to : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || startedRef.current) return;
        startedRef.current = true;

        const startTs = performance.now();
        let frame = 0;

        const tick = (now: number) => {
          const elapsed = now - startTs;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic — fast at first, slows on landing
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(eased * to));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced, duration, to]);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${to}${suffix}`}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
