import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, CloudRain, Languages, MessageCircle, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { photos, type StockPhoto } from '../data/photos';
import { alertTone } from '../lib/format';
import { useLive } from '../lib/useCatalog';
import { Photo, SMALL_PHOTO_MAX } from './Hero';
import { ease } from './ui/motion';

const slides: StockPhoto[] = [photos.apresPluie, photos.grandMarche, photos.bassin, photos.routePlage, photos.hedzranawoe];
export const HERO_AUTOPLAY_MS = 5500;

export function HeroCarousel({ children }: { children: (slide: StockPhoto) => ReactNode }) {
  const reduce = useReducedMotion();
  const live = useLive();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState(1);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const hoveredRef = useRef(false);
  const slide = slides[index];
  const running = !paused && !hovered && !reduce;
  const lead = live.alerts[0];

  indexRef.current = index;
  pausedRef.current = paused;
  hoveredRef.current = hovered;

  const go = useCallback((next: number, dir?: number) => {
    const current = indexRef.current;
    const target = ((next % slides.length) + slides.length) % slides.length;
    const inferred = target === (current + 1) % slides.length ? 1 : -1;
    setDirection(dir ?? inferred);
    indexRef.current = target;
    setIndex(target);
  }, []);

  useEffect(() => {
    if (reduce) return undefined;
    // Intervalle autonome : démarre sans clic, survit au remount StrictMode
    // (cleanup + recréation) et ne dépend pas de l’index pour rester vivant.
    const timer = window.setInterval(() => {
      if (pausedRef.current || hoveredRef.current) return;
      go(indexRef.current + 1, 1);
    }, HERO_AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [go, reduce]);

  useEffect(() => {
    // Préchargement des autres photos, dans la version que <Photo> servira réellement.
    const small = window.innerWidth <= SMALL_PHOTO_MAX;
    slides.slice(1).forEach((item) => { const img = new Image(); img.src = small ? item.srcSm : item.src; });
  }, []);

  return (
    <section
      className="hero-home"
      aria-roledescription="carrousel"
      aria-label="Lomé, saison des pluies"
      data-autoplay={running ? 'on' : 'off'}
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          custom={direction}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: reduce ? 0.2 : 1.1, ease }, scale: { duration: HERO_AUTOPLAY_MS / 1000 + 1.2, ease: 'linear' } }}
          drag={reduce ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(index + 1, 1);
            if (info.offset.x > 60) go(index - 1, -1);
          }}
        >
          <Photo photo={slide} className="hero-photo" priority={index === 0} sizes="100vw" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 z-[1]" style={{ background: 'var(--photo-shade)' }} aria-hidden />

      <motion.div
        className="hero-veil"
        initial={reduce ? false : { opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease }}
        aria-hidden
      />

      <svg className="hero-curve bottom-0 left-0 hidden h-full w-[64%] md:block" viewBox="0 0 640 900" preserveAspectRatio="none" fill="none" aria-hidden>
        <motion.path
          d="M560 -20 C 700 260, 700 640, 520 920"
          stroke="currentColor"
          strokeOpacity=".45"
          strokeWidth="1.5"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, delay: 0.4, ease }}
        />
        <motion.path
          d="M600 -20 C 740 280, 740 620, 560 920"
          stroke="currentColor"
          strokeOpacity=".2"
          strokeWidth="1.2"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.4, delay: 0.6, ease }}
        />
      </svg>

      <div className="hero-content">{children(slide)}</div>

      {lead && (
        <motion.aside
          className="glass-strong absolute right-6 bottom-[156px] z-[4] hidden w-[340px] rounded-[22px] p-4 lg:block xl:right-[max(24px,calc((100vw-1200px)/2+24px))]"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease }}
          aria-label="Alerte en cours"
        >
          <div className="flex items-start gap-3">
            <span className="icon-tile" data-tone={alertTone(lead.level)}><CloudRain size={20} /></span>
            <div className="min-w-0">
              <p className="t-h3 text-[15px]">{lead.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted">{lead.body}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="badge badge-dot" data-tone={alertTone(lead.level)}>{lead.neighborhoodName ?? 'Grand Lomé'}</span>
                <span className="badge" data-tone="neutral"><Languages size={12} /> FR · Éwé</span>
                <span className="badge" data-tone="neutral"><MessageCircle size={12} /> WhatsApp</span>
              </div>
            </div>
          </div>
        </motion.aside>
      )}

      <div className="absolute inset-x-0 top-[calc(var(--header-h)+20px)] z-[4] flex justify-center md:top-auto md:right-6 md:bottom-[92px] md:left-auto md:justify-end xl:right-[max(24px,calc((100vw-1200px)/2+24px))]">
        <div className="flex items-center gap-1">
          <button type="button" className="btn glass btn-icon hidden rounded-full md:inline-flex" onClick={() => go(index - 1, -1)} aria-label="Photo précédente">
            <ChevronLeft size={20} />
          </button>
          <div className="glass flex items-center rounded-full px-1">
            {slides.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                className="grid h-11 w-11 place-items-center"
                aria-label={`Photo ${itemIndex + 1} : ${item.place}`}
                aria-current={itemIndex === index}
                onClick={() => go(itemIndex)}
              >
                <span className="relative block h-1 w-5 overflow-hidden rounded-full md:w-6" style={{ background: 'var(--line-strong)' }}>
                  {itemIndex === index && (
                    <motion.span
                      key={`${item.id}-${running}`}
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ background: 'var(--cyan)' }}
                      initial={{ width: running ? '0%' : '100%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: running ? HERO_AUTOPLAY_MS / 1000 : 0, ease: 'linear' }}
                    />
                  )}
                  {itemIndex < index && <span className="absolute inset-0 rounded-full" style={{ background: 'var(--accent-line)' }} />}
                </span>
              </button>
            ))}
            {!reduce && (
              <button
                type="button"
                className="grid h-11 w-11 place-items-center text-text2"
                onClick={() => setPaused((state) => !state)}
                aria-label={paused ? 'Reprendre le défilement' : 'Mettre en pause'}
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
            )}
          </div>
          <button type="button" className="btn glass btn-icon hidden rounded-full md:inline-flex" onClick={() => go(index + 1, 1)} aria-label="Photo suivante">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{slide.alt}</p>
    </section>
  );
}
