import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { ease } from './motion';

/**
 * Rangée défilante horizontalement (filtres segmentés, puces). Un bouton-indice
 * apparaît du côté où il reste du contenu hors champ et fait défiler d’un écran.
 */
export function ScrollRow({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const reduce = useReducedMotion();

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ left: el.scrollLeft > 6, right: max > 6 && el.scrollLeft < max - 6 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));
    el.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, [measure]);

  function nudge(direction: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' });
  }

  return (
    <div className={`scroll-row ${className ?? ''}`}>
      <div ref={ref} className="scroll-x -mx-1 px-1">{children}</div>
      <AnimatePresence>
        {edges.left && (
          <motion.button
            key="left"
            type="button"
            className="scroll-hint"
            data-side="left"
            aria-label="Voir les filtres précédents"
            onClick={() => nudge(-1)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            whileTap={reduce ? undefined : { scale: 0.9 }}
          >
            <ChevronLeft size={18} />
          </motion.button>
        )}
        {edges.right && (
          <motion.button
            key="right"
            type="button"
            className="scroll-hint"
            data-side="right"
            aria-label="Voir les filtres suivants"
            onClick={() => nudge(1)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            whileTap={reduce ? undefined : { scale: 0.9 }}
          >
            <ChevronRight size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export function TextInput({
  icon,
  trailing,
  invalid,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode; trailing?: ReactNode; invalid?: boolean }) {
  return (
    <span className={`input ${className ?? ''}`} data-invalid={invalid || undefined}>
      {icon}
      <input {...rest} />
      {trailing}
    </span>
  );
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <span className={`input input-area ${className ?? ''}`}>
      <textarea {...rest} />
    </span>
  );
}

export function Switch({
  on,
  onChange,
  label,
  disabled,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      className="relative grid h-11 w-14 shrink-0 place-items-center disabled:opacity-50"
      onClick={() => onChange(!on)}
    >
      <span className="switch" data-on={on}>
        <motion.span
          className="switch-knob"
          animate={{ x: on ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 34 }}
        />
      </span>
    </button>
  );
}

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <div className={`segmented ${className ?? ''}`} role="tablist" aria-label={label}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={on}
            className="segment"
            data-on={on}
            onClick={() => onChange(option.value)}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                className="segment-pill"
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span>
              {option.label}
              {option.count !== undefined && (
                <span className="t-num text-xs opacity-70">{option.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

/** Liste déroulante sur mesure, navigable au clavier. */
export function Select({
  value,
  onChange,
  options,
  label,
  placeholder = 'Choisir',
  icon,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label: string;
  placeholder?: string;
  icon?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  useEffect(() => {
    if (open) setActive(Math.max(0, options.findIndex((option) => option.value === value)));
  }, [open, options, value]);

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') { setOpen(false); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) { setOpen(true); return; }
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActive((index) => (index + delta + options.length) % options.length);
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(active); else setOpen(true);
    }
  }

  return (
    <div ref={root} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        className="input select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen((state) => !state)}
        onKeyDown={onKey}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {icon}
          <span className={`truncate ${current ? '' : 'text-muted'}`}>{current?.label ?? placeholder}</span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="text-muted">
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="select-menu overlay-panel scroll-thin"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease }}
          >
            {options.map((option, index) => (
              <li key={option.value || 'empty'}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  data-active={index === active}
                  className="select-option"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(index)}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.hint ? <span className="block truncate text-xs text-muted">{option.hint}</span> : null}
                  </span>
                  {option.value === value ? <Check size={16} /> : null}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
