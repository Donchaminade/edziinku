import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Camera } from 'lucide-react';
import { useRef, type ReactNode } from 'react';
import type { StockPhoto } from '../data/photos';
import { Copy } from './ui/Decor';
import { ease } from './ui/motion';

export function Photo({
  photo,
  className,
  priority,
  sizes = '(min-width: 768px) 100vw, 100vw',
}: {
  photo: StockPhoto;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <img
      src={photo.src}
      srcSet={`${photo.srcSm} 800w, ${photo.src} 1600w`}
      sizes={sizes}
      alt={photo.alt}
      className={className}
      style={{ objectPosition: photo.focus ?? '50% 50%' }}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
    />
  );
}

export function PhotoCredit({ photo, className }: { photo: StockPhoto; className?: string }) {
  return (
    <a
      className={`photo-credit ${className ?? ''}`}
      href={photo.href}
      target="_blank"
      rel="noreferrer"
      title={`${photo.alt} — ${photo.author}, ${photo.license}`}
    >
      <Camera size={12} aria-hidden />
      <span className="truncate">{photo.place} · {photo.author} · {photo.license}</span>
    </a>
  );
}

/**
 * Hero de page : photo nette, voile flou (aplat translucide) à bord courbe qui
 * porte le texte. Sur mobile le voile occupe le bas, sur grand écran la gauche.
 */
export function PageHero({
  photo,
  eyebrow,
  title,
  short,
  long,
  children,
  aside,
  size = 'lg',
  heading = 'h1',
}: {
  photo: StockPhoto;
  eyebrow?: ReactNode;
  title: ReactNode;
  short?: ReactNode;
  long?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  size?: 'lg' | 'sm';
  heading?: 'h1' | 'h2';
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 60]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.04, 1.12]);
  const Title = heading;

  return (
    <section ref={ref} className={`page-hero ${size === 'sm' ? 'page-hero-sm' : ''}`}>
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <Photo photo={photo} className="hero-photo" priority />
      </motion.div>
      <motion.div
        className="hero-veil"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease }}
      />
      <div className="page-hero-content">
        {eyebrow ? (
          <motion.span
            className="t-eyebrow"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            {eyebrow}
          </motion.span>
        ) : null}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease }}
        >
          <Title className={size === 'sm' ? 't-h2' : 't-h1'}>{title}</Title>
        </motion.div>
        {short || long ? (
          <motion.div
            className="max-w-xl"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease }}
          >
            <Copy className="t-lead" short={short ?? long} long={long ?? short} />
          </motion.div>
        ) : null}
        {children ? (
          <motion.div
            className="mt-2 flex flex-wrap items-center gap-2.5"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32, ease }}
          >
            {children}
          </motion.div>
        ) : null}
        <PhotoCredit photo={photo} className="mt-1" />
      </div>
      {aside ? <div className="absolute top-4 right-4 z-[4] hidden md:block">{aside}</div> : null}
    </section>
  );
}
