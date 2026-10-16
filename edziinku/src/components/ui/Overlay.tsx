import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'motion/react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { ease } from './motion';

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);
}

/** Vrai quand la requête média correspond ; suit les changements d’orientation et de taille. */
export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatch(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return match;
}

function useIsDesktop(query = '(min-width: 768px)') {
  return useMediaQuery(query);
}

function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <motion.button
      type="button"
      aria-label="Fermer"
      tabIndex={-1}
      className="fixed inset-0 z-[70] cursor-default"
      style={{ background: 'var(--veil)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    />
  );
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  useEscape(open, onClose);
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <Backdrop key="backdrop" onClose={onClose} />
          <div key="modal" className="pointer-events-none fixed inset-0 z-[71] grid place-items-center p-4 max-md:items-end max-md:pb-[calc(16px+var(--safe-bottom))]">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className="card-solid pointer-events-auto w-full max-w-md p-6"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: reduce ? 0.01 : 0.35, ease }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="t-h3 text-lg">{title}</h2>
                  {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
                </div>
                <button type="button" className="btn btn-ghost btn-icon -mt-2 -mr-2" aria-label="Fermer" onClick={onClose}>
                  <X size={18} />
                </button>
              </div>
              <div className="mt-5">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Tiroir latéral sur grand écran, feuille glissante depuis le bas sur mobile. */
export function Sheet({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = 460,
  solid = false,
  id,
}: {
  open: boolean;
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  /** Aplat opaque (thème) plutôt que verre — pour les panneaux de contenu. */
  solid?: boolean;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const desktop = useIsDesktop();
  const drag = useDragControls();
  useEscape(open, onClose);
  const hidden = reduce ? { opacity: 0 } : desktop ? { x: '100%' } : { y: '100%' };
  const shown = reduce ? { opacity: 1 } : desktop ? { x: 0 } : { y: 0 };
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <Backdrop key="backdrop" onClose={onClose} />
          <motion.aside
            key="sheet"
            id={id}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
            className={`${solid ? 'card-solid' : 'glass-strong'} fixed z-[71] flex flex-col overflow-hidden md:top-3 md:right-3 md:bottom-3 md:rounded-[28px] max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[88svh] max-md:rounded-t-[28px]`}
            style={desktop ? { width: `min(${width}px, calc(100vw - 24px))` } : undefined}
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 340, damping: 36 }}
            drag={desktop || reduce ? false : 'y'}
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => { if (info.offset.y > 120) onClose(); }}
          >
            <header
              className="flex touch-none items-start justify-between gap-3 px-5 pt-4 pb-3 md:touch-auto md:px-6 md:pt-6"
              onPointerDown={(event) => { if (!desktop) drag.start(event); }}
            >
              <span className="absolute top-2 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full md:hidden" style={{ background: 'var(--line-strong)' }} />
              <div className="min-w-0">
                <h2 className="t-h3 text-lg">{title}</h2>
                {subtitle ? <div className="mt-1 text-sm text-muted">{subtitle}</div> : null}
              </div>
              <button type="button" className="btn btn-ghost btn-icon -mr-2" aria-label="Fermer" onClick={onClose}>
                <X size={18} />
              </button>
            </header>
            <div className="sheet-body scroll-thin flex-1 overflow-y-auto px-5 pb-5 md:px-6">{children}</div>
            {footer ? <footer className="sheet-footer border-t border-line px-5 py-4 md:px-6">{footer}</footer> : null}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

type ToastTone = 'ok' | 'alert' | 'info';
interface ToastItem { id: number; message: string; tone: ToastTone }

const ToastContext = createContext<((message: string, tone?: ToastTone) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const reduce = useReducedMotion();

  const push = useCallback((message: string, tone: ToastTone = 'ok') => {
    const id = ++seq.current;
    setItems((list) => [...list.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setItems((list) => list.filter((entry) => entry.id !== id)), 3800);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-3 bottom-[calc(96px+var(--safe-bottom))] z-[90] flex flex-col items-center gap-2 lg:bottom-6" aria-live="polite">
          <AnimatePresence initial={false}>
            {items.map((toast) => {
              const Icon = toast.tone === 'ok' ? CheckCircle2 : toast.tone === 'alert' ? TriangleAlert : Info;
              return (
                <motion.div
                  key={toast.id}
                  layout={!reduce}
                  role="status"
                  className="glass-strong pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-[var(--shadow-lg)]"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <span className="icon-tile icon-tile-sm" data-tone={toast.tone === 'info' ? undefined : toast.tone}>
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 font-medium">{toast.message}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('Toast hors fournisseur');
  return ctx;
}
