import { useEffect, useRef, type ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const listItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : list}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={reduce ? undefined : listItem}>
      {children}
    </motion.div>
  );
}

export function HoverCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.article
      className={className}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      {children}
    </motion.article>
  );
}

export function Press({
  children,
  className,
  type = 'button',
  onClick,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

export function Parallax({
  children,
  className,
  offset = 28,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : offset, reduce ? 0 : -offset]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

export function CountUp({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(reduce ? value : 0);
  const spring = useSpring(motionValue, { stiffness: 70, damping: 18, duration: reduce ? 0 : 0.8 });

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useEffect(() => {
    if (reduce && ref.current) {
      ref.current.textContent = new Intl.NumberFormat('fr-FR').format(Math.round(value));
      return;
    }
    return spring.on('change', (current) => {
      if (ref.current) {
        ref.current.textContent = new Intl.NumberFormat('fr-FR').format(Math.round(current));
      }
    });
  }, [reduce, spring, value]);

  return <span ref={ref} className={className}>{reduce ? new Intl.NumberFormat('fr-FR').format(Math.round(value)) : '0'}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={`skeleton ${className ?? ''}`}
      animate={reduce ? { opacity: 0.7 } : { opacity: [0.4, 0.9, 0.4] }}
      transition={reduce ? { duration: 0 } : { repeat: Infinity, duration: 1.35, ease: 'easeInOut' }}
    />
  );
}

export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.button
          key="drawer-veil"
          type="button"
          aria-label="Fermer le tiroir"
          className="fixed inset-0 z-50"
          style={{ background: 'var(--veil)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {open && (
        <motion.aside
          key="drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed top-0 right-0 z-50 flex h-full w-[min(440px,100%)] flex-col gap-4 overflow-auto p-6"
          style={{ background: 'var(--bg-elevated)', borderLeft: '1px solid var(--line)' }}
          initial={reduce ? { opacity: 0 } : { x: '100%' }}
          animate={reduce ? { opacity: 1 } : { x: 0 }}
          exit={reduce ? { opacity: 0 } : { x: '100%' }}
          transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 320, damping: 34 }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            <button type="button" className="btn" onClick={onClose}>Fermer</button>
          </div>
          {children}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="modal" className="fixed inset-0 z-50 grid place-items-center p-4">
          <motion.button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0"
            style={{ background: 'var(--veil)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="surface relative z-10 w-full max-w-md p-6"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: reduce ? 0.01 : 0.35, ease }}
          >
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          role="status"
          className="glass fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 px-4 py-3 text-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LiveDot() {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="inline-block h-2 w-2 rounded-full"
      style={{ background: 'var(--cyan)' }}
      animate={reduce ? undefined : { scale: [1, 1.4, 1], opacity: [1, 0.55, 1] }}
      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
    />
  );
}
