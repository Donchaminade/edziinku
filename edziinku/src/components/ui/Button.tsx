import { motion, useReducedMotion } from 'motion/react';
import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router';

const MotionLink = motion.create(Link);

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ok' | 'whatsapp';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: boolean;
  block?: boolean;
  className?: string;
  title?: string;
  'aria-label'?: string;
}

type ButtonProps = BaseProps & {
  to?: undefined;
  href?: undefined;
  type?: 'button' | 'submit';
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
};

type LinkProps = BaseProps & { to: string; href?: undefined; onClick?: () => void };
type AnchorProps = BaseProps & { href: string; to?: undefined };

function classes({ variant = 'secondary', size = 'md', icon, block, className }: BaseProps) {
  return [
    'btn',
    variant === 'secondary' ? '' : `btn-${variant}`,
    size === 'md' ? '' : `btn-${size}`,
    icon ? 'btn-icon' : '',
    block ? 'btn-block' : '',
    className ?? '',
  ].filter(Boolean).join(' ');
}

const spring = { type: 'spring', stiffness: 500, damping: 30 } as const;

export function Button(props: ButtonProps | LinkProps | AnchorProps) {
  const reduce = useReducedMotion();
  const hover = reduce ? undefined : { y: -2 };
  const tap = reduce ? undefined : { scale: 0.96 };
  const className = classes(props);

  if ('to' in props && props.to !== undefined) {
    return (
      <MotionLink
        to={props.to}
        className={className}
        title={props.title}
        aria-label={props['aria-label']}
        onClick={props.onClick}
        whileHover={hover}
        whileTap={tap}
        transition={spring}
      >
        {props.children}
      </MotionLink>
    );
  }

  if ('href' in props && props.href !== undefined) {
    return (
      <motion.a
        href={props.href}
        target="_blank"
        rel="noreferrer"
        className={className}
        title={props.title}
        aria-label={props['aria-label']}
        whileHover={hover}
        whileTap={tap}
        transition={spring}
      >
        {props.children}
      </motion.a>
    );
  }

  const { type = 'button', onClick, disabled, loading } = props as ButtonProps;
  const inactive = disabled || loading;
  return (
    <motion.button
      type={type}
      className={className}
      title={props.title}
      aria-label={props['aria-label']}
      aria-busy={loading || undefined}
      onClick={onClick}
      disabled={inactive}
      whileHover={inactive ? undefined : hover}
      whileTap={inactive ? undefined : tap}
      transition={spring}
    >
      {loading ? <Spinner /> : null}
      {props.children}
    </motion.button>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      animate={reduce ? undefined : { rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  );
}
