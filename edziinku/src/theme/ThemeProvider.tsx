import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ThemeName } from '../types';
import { api, sessionToken } from '../lib/api';

const KEY = 'edzii-theme';

interface ThemeContextValue {
  theme: ThemeName;
  toggle: () => void;
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(readTheme);
  const [veil, setVeil] = useState(0);
  const first = useRef(true);
  const reduce = useReducedMotion();
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;

  useEffect(() => {
    paint(theme);
    localStorage.setItem(KEY, theme);
    if (first.current) {
      first.current = false;
      return;
    }
    if (!reduceRef.current) setVeil((value) => value + 1);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme: setThemeState,
    toggle: () => {
      setThemeState((current) => {
        const next = current === 'dark' ? 'light' : 'dark';
        if (sessionToken()) {
          void api('/api/me/theme', { method: 'PUT', body: JSON.stringify({ theme: next }) }).catch(() => undefined);
        }
        return next;
      });
    },
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {veil > 0 && (
          <motion.div
            key={veil}
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[80]"
            style={{ background: 'var(--bg)' }}
            initial={{ opacity: 0.42 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => setVeil(0)}
          />
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('Thème hors fournisseur');
  return ctx;
}
