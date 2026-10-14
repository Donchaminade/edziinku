import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { Suspense, useEffect, type MouseEvent } from 'react';
import { Link, useLocation, useOutlet } from 'react-router';
import { useTheme } from '../../theme/ThemeProvider';
import { Skeleton, ease } from '../ui/motion';

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden className="shrink-0 text-cyan">
      <g fill="none" stroke="currentColor" strokeLinejoin="round">
        <path d="M8,60 C30,24 90,24 112,60 C90,96 30,96 8,60Z" strokeWidth="7" />
        <circle cx="60" cy="60" r="24" strokeWidth="5" />
        <circle cx="60" cy="60" r="33" strokeOpacity=".3" strokeWidth="2" strokeDasharray="3 5" />
      </g>
      <path d="M60,44 C66,53 70,58 70,64 A10,10 0 0 1 50,64 C50,58 54,53 60,44Z" fill="currentColor" />
    </svg>
  );
}

export function Brand({ to = '/', compact }: { to?: string; compact?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <Link to={to} className="group flex min-h-11 min-w-0 items-center gap-2.5" aria-label="Edzii-Nku, accueil">
      <motion.span whileHover={reduce ? undefined : { rotate: -8, scale: 1.06 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
        <LogoMark size={compact ? 30 : 34} />
      </motion.span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate font-display text-[17px] font-extrabold tracking-tight">Edzii-Nku</span>
        {!compact && <span className="brand-sub mt-1 hidden text-[10.5px] font-medium tracking-wide text-muted sm:block">L’œil de la pluie · Lomé</span>}
      </span>
    </Link>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const reduce = useReducedMotion();
  const label = theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème nuit';
  function onClick(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }
  return (
    <motion.button
      type="button"
      className={`btn btn-ghost btn-icon ${className ?? ''}`}
      aria-label={label}
      title={label}
      onClick={onClick}
      whileTap={reduce ? undefined : { scale: 0.88 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="grid place-items-center"
          initial={reduce ? false : { rotate: -90, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={reduce ? undefined : { rotate: 90, scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.28, ease }}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/**
 * Transition entre les pages (fondu + léger glissement). Le retour en haut se
 * fait pendant que l’ancienne page est déjà effacée, sans défilement visible :
 * la nouvelle page apparaît directement en place.
 */
export function AnimatedOutlet({ scope }: { scope: string }) {
  const location = useLocation();
  const outlet = useOutlet();
  const reduce = useReducedMotion();
  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => {
        if (location.hash) return;
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }}
    >
      <motion.div
        key={`${scope}${location.pathname}`}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: reduce ? 0.12 : 0.35, ease }}
      >
        <Suspense fallback={<PageFallback />}>{outlet}</Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function PageFallback() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-3 pt-4 lg:px-0" aria-busy="true">
      <Skeleton className="h-56 rounded-[28px]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-28" />)}</div>
    </div>
  );
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Edzii-Nku` : 'Edzii-Nku — L’œil de la pluie';
  }, [title]);
}
