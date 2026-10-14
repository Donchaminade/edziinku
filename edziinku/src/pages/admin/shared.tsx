import { motion, useReducedMotion } from 'motion/react';
import { Bell, CloudRain, Database, MapPin, Radio, ShieldAlert, Users, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { CountUp, StaggerItem } from '../../components/ui/motion';
import { demoReports } from '../../data/demo';
import { clock, teamStatus } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import type { Page, ReportItem, Team, TimelineItem } from '../../types';

/** Tous les signalements, y compris ceux à vérifier (l’endpoint public ne renvoie que les validés). */
export function useAdminReports() {
  return useApi<Page<ReportItem>>('/api/admin/reports?size=200', () => ({ items: demoReports, page: 0, size: 200, total: demoReports.length }));
}

export function SourceBadge({ source }: { source: 'api' | 'demo' | null }) {
  if (!source) return null;
  return (
    <span className="badge badge-dot" data-tone={source === 'api' ? 'ok' : 'warn'} title={source === 'api' ? 'Données de la base' : 'Données de démonstration, l’API ne répond pas'}>
      <Database size={12} aria-hidden /> {source === 'api' ? 'Base' : 'Démo'}
    </span>
  );
}

export function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  accent,
  suffix,
}: {
  label: string;
  value: number;
  hint: ReactNode;
  icon: LucideIcon;
  tone?: 'alert' | 'warn' | 'ok' | 'water';
  accent?: boolean;
  suffix?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <StaggerItem>
      <motion.div
        className="card card-hover relative h-full overflow-hidden p-4 sm:p-5"
        style={accent ? { background: 'var(--primary)', color: 'var(--on-primary)', borderColor: 'transparent' } : undefined}
        whileHover={reduce ? undefined : { y: -4 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <div className="flex items-start justify-between gap-3">
          <span className={`min-w-0 text-[13px] leading-snug font-semibold [overflow-wrap:normal] ${accent ? '' : 'text-text2'}`}>{label}</span>
          <span
            className="icon-tile icon-tile-sm shrink-0 max-sm:hidden"
            data-tone={accent ? undefined : tone}
            style={accent ? { background: 'color-mix(in srgb, var(--on-primary) 14%, transparent)', color: 'var(--on-primary)' } : undefined}
          >
            <Icon size={17} />
          </span>
        </div>
        <p className="t-num mt-3 font-display text-[30px] leading-none font-semibold sm:text-[36px]">
          <CountUp value={value} suffix={suffix} />
        </p>
        <p className={`mt-2 truncate text-[13px] ${accent ? 'opacity-80' : 'text-muted'}`}>{hint}</p>
      </motion.div>
    </StaggerItem>
  );
}

const kindIcons: Record<string, { icon: LucideIcon; tone?: 'alert' | 'warn' | 'ok' | 'water' }> = {
  REPORT: { icon: MapPin, tone: 'warn' },
  ALERT: { icon: Bell, tone: 'alert' },
  TEAM: { icon: Users, tone: 'ok' },
  BASIN: { icon: ShieldAlert, tone: 'water' },
  WEATHER: { icon: CloudRain },
};

export function kindLabel(kind: string) {
  return ({ REPORT: 'Signalement', ALERT: 'Alerte', TEAM: 'Équipe', BASIN: 'Bassin', WEATHER: 'Météo' } as Record<string, string>)[kind] ?? kind;
}

export function TimelineList({ items, compact }: { items: TimelineItem[]; compact?: boolean }) {
  return (
    <ol className="timeline flex flex-col gap-4">
      {items.map((item, index) => {
        const meta = kindIcons[item.kind] ?? { icon: Radio };
        return (
          <motion.li
            key={item.id}
            className="relative flex gap-3"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
          >
            <span className="icon-tile icon-tile-sm relative z-[1]" data-tone={meta.tone}><meta.icon size={16} /></span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="font-semibold">{item.title}</p>
                <span className="t-num text-xs text-muted">{clock(item.occurredAt)}</span>
              </div>
              {item.detail && <p className={`text-sm text-muted ${compact ? 'truncate' : ''}`}>{item.detail}</p>}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

export function TeamRow({ team }: { team: Team }) {
  const status = teamStatus(team.status);
  return (
    <div className="flex items-center gap-3">
      <span className="icon-tile icon-tile-sm" data-tone={status.tone === 'info' ? undefined : status.tone}><Users size={16} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-semibold">{team.name}</p>
          <span className="badge badge-dot" data-tone={status.tone === 'info' ? undefined : status.tone}>{status.label}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">{team.zone ?? 'Sans zone'}{team.assignment ? ` · ${team.assignment}` : ''}</p>
      </div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`card flex flex-col overflow-hidden p-0 ${className ?? ''}`}>
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-line px-4 sm:px-5">
        <h2 className="t-h3 text-base">{title}</h2>
        {action}
      </header>
      <div className={bodyClassName ?? 'p-4 sm:p-5'}>{children}</div>
    </section>
  );
}
