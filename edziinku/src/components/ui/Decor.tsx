import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Reveal } from './motion';

/** Lignes courbes douces, purement décoratives (traits fins, couleur unie). */
export function Curves({
  className,
  style,
  opacity = 0.35,
  variant = 'a',
}: {
  className?: string;
  style?: CSSProperties;
  opacity?: number;
  variant?: 'a' | 'b';
}) {
  const reduce = useReducedMotion();
  const paths = variant === 'a'
    ? [
        'M-20 220 C 120 120, 260 300, 420 180 S 700 80, 860 200',
        'M-20 260 C 140 160, 280 340, 440 220 S 720 120, 860 240',
        'M-20 300 C 160 200, 300 380, 460 260 S 740 160, 860 280',
      ]
    : [
        'M-40 80 C 160 180, 320 0, 520 110 S 760 220, 900 120',
        'M-40 120 C 170 220, 340 40, 540 150 S 780 260, 900 160',
      ];
  return (
    <svg
      aria-hidden
      className={`curve-deco ${className ?? ''}`}
      style={style}
      viewBox="0 0 840 400"
      fill="none"
      preserveAspectRatio="none"
    >
      {paths.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeOpacity={opacity - index * 0.08}
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.2, delay: index * 0.18, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </svg>
  );
}

/** Séparateur de section en vague, rempli avec la couleur de la section suivante. */
export function WaveDivider({ flip, color = 'var(--bg-2)' }: { flip?: boolean; color?: string }) {
  return (
    <svg
      aria-hidden
      className="wave-divider"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      style={{ color, transform: flip ? 'scaleY(-1)' : undefined, marginBottom: -1 }}
    >
      <path d="M0 48 C 240 8, 480 8, 720 40 S 1200 80, 1440 32 L1440 80 L0 80 Z" fill="currentColor" />
    </svg>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = 'left',
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  action?: ReactNode;
}) {
  const centered = align === 'center';
  return (
    <Reveal className={`flex flex-col gap-3 ${centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'}`}>
      <div className={`flex min-w-0 flex-col gap-3 ${centered ? 'items-center' : ''}`}>
        {eyebrow ? <span className="t-eyebrow">{eyebrow}</span> : null}
        <h2 className="t-h2 max-w-2xl">{title}</h2>
        {lead ? <div className={`t-lead max-w-2xl ${centered ? 'mx-auto' : ''}`}>{lead}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </Reveal>
  );
}

export function EmptyState({ title, text, icon, action }: { title: string; text: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[22px] border border-dashed border-line-strong px-6 py-10 text-center">
      <span className="icon-tile icon-tile-lg">{icon ?? <Inbox size={22} />}</span>
      <div>
        <p className="t-h3">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{text}</p>
      </div>
      {action}
    </div>
  );
}

export function Copy({ short, long, className = '', as = 'p' }: { short: ReactNode; long: ReactNode; className?: string; as?: 'p' | 'span' }) {
  const Tag = as;
  return (
    <>
      <Tag className={`copy-short ${className}`}>{short}</Tag>
      <Tag className={`copy-long ${className}`}>{long}</Tag>
    </>
  );
}

export function Container({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' }) {
  const Tag = as;
  return <Tag className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 ${className ?? ''}`}>{children}</Tag>;
}
