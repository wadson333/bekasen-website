---
name: component-development-rules
description: Standards for building React components in the Bekasen project
applyTo: "components/**/*.tsx"
---

# Component Development Rules

## File Structure

- One component per file, default export
- File name matches component name: `Hero.tsx` exports `Hero`
- Add `'use client'` directive at the top only when the component uses React hooks, event handlers, or browser APIs

## Internationalization

- All user-facing strings must use `next-intl`:
  ```tsx
  import { useTranslations } from "next-intl";
  const t = useTranslations("sectionName");
  ```
- Never hardcode visible text — always use `t("keyName")`
- The section name in `useTranslations()` must match the top-level key in `messages/*.json`

## Styling

- Use Tailwind CSS utility classes exclusively — no CSS modules, no inline `style` objects
- Use Bekasen brand colors: `#6B21A8` (purple-800), `#A855F7` (purple-400), `#4338CA` (indigo-700)
- Use CSS custom properties for theme-aware colors: `var(--bg-primary)`, `var(--text-primary)`
- Headings use `font-[family-name:var(--font-syne)]`
- Body text uses `font-[family-name:var(--font-inter)]`
- Mobile-first: start with base styles, add `sm:`, `md:`, `lg:` breakpoints for larger screens
- Consistent layout width: `max-w-6xl mx-auto px-6`

## Animations

- Use Framer Motion `motion` components for all animations
- Standard pattern:
  ```tsx
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
  ```
- Stagger children using `transition={{ delay: index * 0.1 }}`

## Icons

- Use Lucide React for all icons: `import { IconName } from "lucide-react"`
- Standard icon size: `className="w-5 h-5"` (adjust as needed)

## TypeScript

- All props must be typed — no `any`
- Define prop interfaces when the component accepts props
- Use `React.FC` sparingly — prefer function declarations with typed props
