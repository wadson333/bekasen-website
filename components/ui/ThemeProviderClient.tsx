'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { THEME_STORAGE_KEY } from '@/lib/consent';

// Suppress the React 19 warning about script tags on the client
// This is a known issue with next-themes and React 19.
// Tracked in: https://github.com/pacocoursey/next-themes/pull/386
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Encountered a script tag while rendering React component')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export default function ThemeProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem storageKey={THEME_STORAGE_KEY}>
      {children}
    </NextThemesProvider>
  );
}