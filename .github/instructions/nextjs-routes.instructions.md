---
name: nextjs-app-router-rules
description: Conventions for Next.js App Router pages and layouts in the Bekasen project
applyTo: "app/**/*.tsx"
---

# Next.js App Router Rules

## Route Structure

- All pages are nested under `app/[locale]/` for i18n support
- The `[locale]` segment is handled by next-intl middleware
- Use `layout.tsx` for shared UI (Navbar, Footer, providers)
- Use `page.tsx` for page-specific content

## Server vs Client Components

- **Default to Server Components** — no directive needed
- Add `'use client'` only when using: React hooks, event handlers, browser APIs, Framer Motion, `useTranslations`
- Keep data fetching in Server Components when possible

## Metadata

- Export metadata from `layout.tsx` or `page.tsx` using the `Metadata` type:
  ```tsx
  import type { Metadata } from "next";
  export const metadata: Metadata = { title: "...", description: "..." };
  ```
- Include Open Graph metadata for social sharing

## Layout Pattern

- Root layout (`app/[locale]/layout.tsx`) wraps:
  1. `NextIntlClientProvider` with messages
  2. `ThemeProvider` from next-themes (dark mode default)
  3. `Navbar` and `Footer` components
- Font variables (`--font-inter`, `--font-syne`) are applied on the `<html>` element

## Locale Handling

- Available locales: `["fr", "en", "ht", "es"]` — defined in `i18n/routing.ts`
- Default locale: `"fr"`
- Use `notFound()` for invalid locale segments
- Get messages with `getMessages()` from `next-intl/server` in Server Components

## Imports

- Use `@/` alias for all imports: `@/components/Navbar`, `@/i18n/routing`
- Import types with `import type` when only types are needed
