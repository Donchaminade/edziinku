import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Illustrations originales Edzii-Nku, dessinées sur mesure.
 * Uniquement des aplats (variables de la charte), pour suivre le thème nuit et le thème clair.
 * unDraw et Storyset n’ont pas été repris : leurs fichiers imposent souvent une couleur fixe ou un dégradé.
 */
const ease = [0.16, 1, 0.3, 1] as const;

function Spot({
  label,
  children,
  immediate = false,
  className = '',
}: {
  label: string;
  children: ReactNode;
  immediate?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`spot ${className}`}
      role="img"
      aria-label={label}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={immediate ? { opacity: 1, y: 0 } : undefined}
      whileInView={immediate ? undefined : { opacity: 1, y: 0 }}
      viewport={immediate ? undefined : { once: true, amount: 0.4 }}
      transition={{ duration: reduce ? 0.01 : 0.55, ease }}
    >
      <svg viewBox="0 0 200 140" aria-hidden>
        {children}
      </svg>
    </motion.div>
  );
}

function Ground() {
  return <path d="M16 112h168" stroke="var(--line)" strokeWidth="3" strokeLinecap="round" />;
}

export function IlluEye({ immediate = false }: { immediate?: boolean }) {
  return (
    <Spot label="Œil de la pluie" immediate={immediate}>
      <ellipse cx="100" cy="62" rx="62" ry="36" fill="none" stroke="var(--cyan)" strokeWidth="6" />
      <circle cx="100" cy="62" r="16" fill="var(--water)" />
      <circle cx="100" cy="62" r="7" fill="var(--ink)" />
      <path d="M78 28c2 8 2 8 0 16M100 20c2 8 2 8 0 16M122 28c2 8 2 8 0 16" stroke="var(--cyan)" strokeWidth="4" strokeLinecap="round" />
    </Spot>
  );
}

export function IlluFlood() {
  return (
    <Spot label="Rue inondée à Lomé">
      <rect x="58" y="36" width="70" height="48" rx="6" fill="var(--card-2)" stroke="var(--line)" />
      <path d="M52 40 L93 18 L134 40" fill="var(--water)" />
      <rect x="84" y="58" width="16" height="26" rx="2" fill="var(--bg)" />
      <path d="M18 96c18-10 28 8 46 0s28 8 46 0 28 8 46 0 24 6 28-2v28H18Z" fill="var(--water)" />
      <path d="M30 108c10-4 16 3 26 0" stroke="var(--cyan)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </Spot>
  );
}

export function IlluQuarter() {
  return (
    <Spot label="Quartier de Lomé">
      <rect x="28" y="58" width="48" height="40" rx="4" fill="var(--card-2)" stroke="var(--line)" />
      <path d="M24 60 L52 40 L80 60" fill="var(--cyan)" />
      <rect x="108" y="48" width="52" height="50" rx="4" fill="var(--card-2)" stroke="var(--line)" />
      <path d="M104 50 L134 28 L164 50" fill="var(--water)" />
      <circle cx="40" cy="28" r="8" fill="var(--amber)" />
      <Ground />
    </Spot>
  );
}

export function IlluAlert() {
  return (
    <Spot label="Alerte pluie">
      <rect x="36" y="34" width="78" height="28" rx="14" fill="var(--card-2)" stroke="var(--line)" />
      <circle cx="54" cy="48" r="8" fill="var(--cyan)" />
      <path d="M48 78c4 10 4 10 0 18M64 72c4 10 4 10 0 18M80 78c4 10 4 10 0 18" stroke="var(--water)" strokeWidth="4" strokeLinecap="round" />
      <rect x="112" y="46" width="52" height="70" rx="8" fill="var(--bg-elevated)" stroke="var(--line)" />
      <rect x="120" y="56" width="36" height="18" rx="4" fill="var(--alert)" />
      <circle cx="138" cy="96" r="4" fill="var(--cyan)" />
    </Spot>
  );
}

export function IlluCamera() {
  return (
    <Spot label="Signalement photo">
      <rect x="46" y="28" width="108" height="72" rx="12" fill="var(--bg-elevated)" stroke="var(--line)" />
      <circle cx="100" cy="62" r="18" fill="none" stroke="var(--cyan)" strokeWidth="4" />
      <circle cx="100" cy="62" r="8" fill="var(--water)" />
      <rect x="78" y="18" width="28" height="12" rx="3" fill="var(--cyan)" />
      <path d="M36 112c16-8 24 6 40 0s24 6 40 0 24 6 40 0" stroke="var(--water)" strokeWidth="4" fill="none" strokeLinecap="round" />
    </Spot>
  );
}

export function IlluTeam() {
  return (
    <Spot label="Équipe sur le terrain">
      <circle cx="62" cy="48" r="12" fill="var(--cyan)" />
      <rect x="46" y="64" width="32" height="36" rx="10" fill="var(--water)" />
      <circle cx="108" cy="52" r="12" fill="var(--amber)" />
      <rect x="92" y="68" width="32" height="32" rx="10" fill="var(--cyan)" />
      <rect x="136" y="70" width="40" height="28" rx="6" fill="var(--card-2)" stroke="var(--line)" />
      <path d="M140 98h32" stroke="var(--water)" strokeWidth="6" strokeLinecap="round" />
      <Ground />
    </Spot>
  );
}

export function IlluLanguages() {
  return (
    <Spot label="Message en français et en éwé">
      <rect x="24" y="28" width="88" height="48" rx="16" fill="var(--cyan)" />
      <rect x="88" y="64" width="88" height="48" rx="16" fill="var(--water)" />
      <path d="M40 48h52M40 60h36" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      <path d="M104 84h52M104 96h32" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
    </Spot>
  );
}

export function IlluMap() {
  return (
    <Spot label="Carte de Lomé">
      <rect x="28" y="18" width="144" height="104" rx="16" fill="var(--map-bg)" />
      <path d="M48 96c16-28 20-40 36-36 18 4 14 28 34 24 16-4 22-20 34-8" fill="none" stroke="var(--water)" strokeWidth="8" strokeLinecap="round" />
      <circle cx="78" cy="62" r="7" fill="var(--alert)" />
      <circle cx="118" cy="78" r="7" fill="var(--amber)" />
      <circle cx="142" cy="54" r="7" fill="var(--cyan)" />
    </Spot>
  );
}

export function IlluWhatsapp() {
  return (
    <Spot label="Bot WhatsApp">
      <rect x="62" y="16" width="76" height="108" rx="12" fill="var(--bg-elevated)" stroke="var(--line)" />
      <rect x="74" y="36" width="52" height="22" rx="8" fill="var(--whatsapp)" />
      <rect x="74" y="64" width="40" height="16" rx="8" fill="var(--card-2)" />
      <circle cx="100" cy="104" r="6" fill="var(--cyan)" />
    </Spot>
  );
}

export function IlluPartners() {
  return (
    <Spot label="Habitants, mairie et protection civile">
      <rect x="22" y="48" width="44" height="52" rx="6" fill="var(--card-2)" stroke="var(--line)" />
      <path d="M18 50h52L44 30Z" fill="var(--cyan)" />
      <rect x="78" y="36" width="44" height="64" rx="6" fill="var(--water)" />
      <rect x="134" y="58" width="44" height="42" rx="6" fill="var(--amber)" />
      <Ground />
    </Spot>
  );
}

export function IlluEmpty() {
  return (
    <Spot label="Rien à afficher pour le moment">
      <circle cx="100" cy="46" r="16" fill="var(--card-2)" stroke="var(--line)" />
      <path d="M40 96c14-12 22 6 36 0s22 6 36 0 22 6 36 0 16 4 12-6" fill="none" stroke="var(--cyan)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="70" cy="88" r="3" fill="var(--water)" />
      <circle cx="130" cy="92" r="3" fill="var(--water)" />
    </Spot>
  );
}

export function IlluCommunity() {
  return (
    <Spot label="Voisins à l’abri">
      <path d="M36 58h128l-16-22H52Z" fill="var(--card-2)" stroke="var(--line)" />
      <circle cx="70" cy="78" r="10" fill="var(--cyan)" />
      <rect x="58" y="90" width="24" height="22" rx="8" fill="var(--water)" />
      <circle cx="108" cy="80" r="10" fill="var(--amber)" />
      <rect x="96" y="92" width="24" height="20" rx="8" fill="var(--cyan)" />
      <circle cx="140" cy="82" r="8" fill="var(--water)" />
      <path d="M28 40c3 8 3 8 0 14M48 32c3 8 3 8 0 14" stroke="var(--cyan)" strokeWidth="3" strokeLinecap="round" />
    </Spot>
  );
}

export function IlluBasin() {
  return (
    <Spot label="Bassin à curer">
      <ellipse cx="100" cy="78" rx="62" ry="28" fill="var(--water)" />
      <ellipse cx="100" cy="74" rx="40" ry="16" fill="var(--cyan)" />
      <rect x="70" y="28" width="18" height="36" rx="4" fill="var(--amber)" />
      <rect x="112" y="36" width="14" height="28" rx="4" fill="var(--alert)" />
    </Spot>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-start gap-2 py-2">
      <IlluEmpty />
      <p className="font-display text-lg">{title}</p>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}
