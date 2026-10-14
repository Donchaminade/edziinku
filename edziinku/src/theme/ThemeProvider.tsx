import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import type { ThemeName } from '../types';
import { api, sessionToken } from '../lib/api';

const KEY = 'edzii-theme';

interface ThemeContextValue {
  theme: ThemeName;
  toggle: (origin?: { x: number; y: number }) => void;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readTheme(): ThemeName {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function paint(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(readTheme);

  useEffect(() => {
    paint(theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* stockage indisponible (navigation privée) : le thème vaut pour la session */
    }
  }, [theme]);

  const toggle = useCallback((origin?: { x: number; y: number }) => {
    const next: ThemeName = readTheme() === 'dark' ? 'light' : 'dark';
    if (sessionToken()) {
      void api('/api/me/theme', { method: 'PUT', body: JSON.stringify({ theme: next }) }).catch(() => undefined);
    }
    const doc = document as ViewTransitionDocument;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!doc.startViewTransition || reduce) {
      setThemeState(next);
      return;
    }
    const x = origin?.x ?? window.innerWidth - 40;
    const y = origin?.y ?? 40;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = doc.startViewTransition(() => {
      flushSync(() => setThemeState(next));
      paint(next);
    });
    void transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, toggle, setTheme: setThemeState }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('Thème hors fournisseur');
  return ctx;
}
