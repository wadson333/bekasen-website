"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  children: ReactNode;
  /** Stagger delay relative to siblings (ms → s) */
  delay?: number;
  /** Direction the element enters from. Default: "up" */
  from?: "up" | "down" | "left" | "right" | "fade";
  /** Trigger margin — how far from the viewport edge before firing. Default: -60px */
  rootMargin?: string;
  className?: string;
  /** Wrapping element. Default: div */
  as?: "div" | "section" | "article" | "header" | "li" | "ul" | "ol";
};

const FROM_VARIANTS = {
  up: { x: 0, y: 24 },
  down: { x: 0, y: -24 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
  fade: { x: 0, y: 0 },
};

/**
 * Reveal — drop-in scroll-triggered entrance wrapper.
 *
 * Usage:
 *   <Reveal delay={0.1}><Card /></Reveal>
 *   <Reveal from="left" delay={0.2}><Card /></Reveal>
 *
 * - Entrance fires once when the element scrolls into view.
 * - Honors prefers-reduced-motion (skips the animation, renders the
 *   final state directly).
 * - Lightweight wrapper around motion.div + whileInView.
 */
export default function Reveal({
  children,
  delay = 0,
  from = "up",
  rootMargin = "-60px",
  className,
  as = "div",
}: Props) {
  const reduced = useReducedMotion();

  // Pick the underlying motion component based on `as`. Cast satisfies TS
  // — `motion[…]` indexing is dynamic but valid for these tags.
  const Component = (motion as unknown as Record<string, typeof motion.div>)[as] ?? motion.div;
  const offset = FROM_VARIANTS[from];

  if (reduced) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: rootMargin }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
}
