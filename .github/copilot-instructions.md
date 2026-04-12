# Bekasen — Copilot Instructions

## Project Overview

Bekasen is a premium digital agency serving Haitian businesses and the diaspora. This workspace is a multilingual portfolio site built with modern web technologies.

## Tech Stack

- **Framework**: Next.js 16 (App Router only — no Pages Router)
- **UI**: React 19 with functional components and hooks
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 (CSS-first config via PostCSS — no `tailwind.config.js`)
- **Animations**: Framer Motion 11
- **i18n**: next-intl v3 with 4 locales: `fr` (default), `en`, `ht` (Haitian Creole), `es`
- **Icons**: Lucide React
- **Fonts**: Syne (headings, weights 700–800), Inter (body text)
- **Dark mode**: next-themes (dark mode default)

## Coding Standards

- All new code must be fully typed in TypeScript — no `any`, no `@ts-ignore`, no `@ts-expect-error`
- Functional components only — no class components
- Use `'use client'` directive only when the component uses React hooks, event handlers, or browser APIs
- Server Components by default in `app/` directory
- All user-facing strings must go through `next-intl` (`useTranslations` hook) — never hardcode text
- When adding or updating UI text, update **all 4 locale files** in `messages/`: `fr.json`, `en.json`, `ht.json`, `es.json`
- Components live in `components/` — one component per file, default export
- Use Tailwind CSS utility classes for styling — no CSS modules, no inline styles
- Use Framer Motion `motion` components for all animations and transitions
- Use Lucide React for all icons

## Brand Design

- **Primary colors**: Purple/Violet `#6B21A8` and `#A855F7`
- **Secondary color**: Indigo `#4338CA`
- **Backgrounds**: Use CSS custom properties `var(--bg-primary)`, `var(--bg-secondary)`
- **Text**: Use `var(--text-primary)`, `var(--text-secondary)`
- **Headings**: `font-[family-name:var(--font-syne)]`
- **Body text**: `font-[family-name:var(--font-inter)]`
- **Mobile-first**: Always start with mobile layout, add breakpoints for larger screens (`sm:`, `md:`, `lg:`)

## Project Structure

```
app/[locale]/       — Pages and layouts (App Router with locale segment)
components/         — Reusable React components
messages/           — Translation JSON files (fr.json, en.json, ht.json, es.json)
i18n/               — next-intl routing and request configuration
public/             — Static assets
```

## Conventions

- Import paths use `@/` alias (e.g., `@/components/Navbar`)
- Locale config is in `i18n/routing.ts` — 4 locales: `["fr", "en", "ht", "es"]`, default: `"fr"`
- Metadata is exported from layout/page files using the Next.js `Metadata` type
- Animation variants use Framer Motion `motion.div` with `initial`, `animate`, `transition` props
- Use `max-w-6xl mx-auto px-6` for consistent content width and padding
