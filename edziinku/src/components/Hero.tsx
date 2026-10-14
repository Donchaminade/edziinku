import type { ReactNode } from 'react';
import type { StockPhoto } from '../data/photos';

export function Copy({ short, long, className = '' }: { short: string; long: string; className?: string }) {
  const extra = className ? ` ${className}` : '';
  return (
    <>
      <p className={`copy-short${extra}`}>{short}</p>
      <p className={`copy-long${extra}`}>{long}</p>
    </>
  );
}

export function PhotoCredit({ photo }: { photo: StockPhoto }) {
  return (
    <a className="photo-credit" href={photo.href} target="_blank" rel="noreferrer">
      {photo.place} · {photo.author} · {photo.source}
    </a>
  );
}

export function PageHero({
  photo,
  kicker,
  title,
  accent,
  short,
  long,
  children,
  tone = 'band',
  heading = 'h1',
}: {
  photo: StockPhoto;
  kicker?: string;
  title: string;
  accent?: string;
  short: string;
  long: string;
  children?: ReactNode;
  tone?: 'band' | 'compact';
  heading?: 'h1' | 'h2';
}) {
  const Title = heading;
  return (
    <section className={`photo-hero photo-hero-${tone}`}>
      <img src={photo.src} alt={photo.alt} className="hero-photo" />
      <div className="soft-shape hero-blob" aria-hidden />
      <div className="hero-veil">
        {kicker ? <p className="step-no">{kicker}</p> : null}
        <Title className={tone === 'compact' ? 'display-sm' : 'display'}>
          {title}
          {accent ? <> <span className="text-grad">{accent}</span></> : null}
        </Title>
        <Copy short={short} long={long} className="hero-lead" />
        {children}
        <PhotoCredit photo={photo} />
      </div>
    </section>
  );
}

export function QuietNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="quiet-note">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
