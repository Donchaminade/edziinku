import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useInView, useReducedMotion, type Variants } from 'motion/react';

export const ease = [0.16, 1, 0.3, 1] as const;

const formatter = new Intl.NumberFormat('fr-FR');

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, delay, ease }}
    >
      {children}
    </Tag>
  );
}

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function Stagger({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'ul' | 'ol' }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      variants={reduce ? undefined : list}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' | 'article' }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag className={className} variants={reduce ? undefined : item}>
      {children}
    </Tag>
  );
}

/** Carte qui se soulève au survol et s’enfonce légèrement au clic. */
export function Lift({
  children,
  className,
  as = 'div',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'li';
  onClick?: () => void;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      onClick={onClick}
      whileHover={reduce ? undefined : { y: -4 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      {children}
    </Tag>
  );
}

/** Compteur qui défile jusqu’à sa valeur quand il entre à l’écran. */
export function CountUp({
  value,
  className,
  suffix = '',
  duration = 1.4,
}: {
  value: number;
  className?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  const reduce = useReducedMotion();
  const from = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce) {
      node.textContent = `${formatter.format(Math.round(value))}${suffix}`;
      return;
    }
    if (!inView) return;
    const controls = animate(from.current, value, {
      duration,
      ease,
      onUpdate: (current) => {
        node.textContent = `${formatter.format(Math.round(current))}${suffix}`;
      },
    });
    from.current = value;
    return () => controls.stop();
  }, [duration, inView, reduce, suffix, value]);

  return (
    <span ref={ref} className={className}>
      {reduce ? `${formatter.format(Math.round(value))}${suffix}` : `0${suffix}`}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={`skeleton ${className ?? ''}`}
      animate={reduce ? { opacity: 0.7 } : { opacity: [0.45, 0.9, 0.45] }}
      transition={reduce ? { duration: 0 } : { repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
    />
  );
}

export function LiveDot({ tone = 'ok' }: { tone?: 'ok' | 'warn' | 'alert' | 'info' }) {
  const reduce = useReducedMotion();
  const color = tone === 'ok' ? 'var(--ok)' : tone === 'warn' ? 'var(--warn)' : tone === 'alert' ? 'var(--alert)' : 'var(--cyan)';
  return (
    <span className="relative inline-flex h-2.5 w-2.5" aria-hidden>
      {!reduce && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: color }}
          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
        />
      )}
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: color }} />
    </span>
  );
}

/** Barre qui se remplit à l’entrée dans l’écran. */
export function Meter({ value, tone, label }: { value: number; tone?: string; label?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label}>
      <motion.i
        data-tone={tone}
        initial={reduce ? false : { width: 0 }}
        whileInView={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease }}
        style={reduce ? { width: `${value}%` } : undefined}
      />
    </div>
  );
}

/** Retourne vrai après le premier rendu côté client (utile pour différer des animations). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
