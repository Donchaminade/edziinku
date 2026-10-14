import { History } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHero } from '../../components/Hero';
import { AdminPage } from '../../components/layout/AdminLayout';
import { useDocumentTitle } from '../../components/layout/common';
import { EmptyState } from '../../components/ui/Decor';
import { Segmented } from '../../components/ui/Form';
import { Reveal, Skeleton } from '../../components/ui/motion';
import { demoTimeline } from '../../data/demo';
import { photos } from '../../data/photos';
import { longDate } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import type { TimelineItem } from '../../types';
import { kindLabel, SourceBadge, TimelineList } from './shared';

export function HistoryPage() {
  useDocumentTitle('Historique');
  const timeline = useApi<TimelineItem[]>('/api/admin/timeline', demoTimeline);
  const [kind, setKind] = useState('ALL');
  const items = timeline.data;

  const kinds = useMemo(() => Array.from(new Set((items ?? []).map((item) => item.kind))), [items]);
  const groups = useMemo(() => {
    const filtered = (items ?? []).filter((item) => kind === 'ALL' || item.kind === kind);
    const byDay = new Map<string, TimelineItem[]>();
    filtered.forEach((item) => {
      const day = longDate(item.occurredAt);
      byDay.set(day, [...(byDay.get(day) ?? []), item]);
    });
    return Array.from(byDay.entries());
  }, [items, kind]);

  return (
    <AdminPage>
      <PageHero
        photo={photos.vue}
        size="sm"
        eyebrow={<span className="inline-flex items-center gap-2">Journal <SourceBadge source={timeline.source} /></span>}
        title="Historique"
        short="Tout ce qui s’est passé, dans l’ordre."
        long="Alertes, signalements, équipes et bassins, du plus récent au plus ancien. Utile pour le bilan d’une saison."
      />
      {kinds.length > 1 && (
        <div className="scroll-x -mx-1 px-1">
          <Segmented
            label="Filtrer par type"
            value={kind}
            onChange={setKind}
            className="min-w-max"
            options={[{ value: 'ALL', label: 'Tout', count: items?.length ?? 0 }, ...kinds.map((value) => ({ value, label: kindLabel(value), count: items?.filter((item) => item.kind === value).length ?? 0 }))]}
          />
        </div>
      )}
      {!items ? <Skeleton className="h-64" /> : groups.length === 0 ? (
        <EmptyState icon={<History size={20} />} title="Aucun événement" text="La chronologie se remplira avec les alertes et les signalements." />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(([day, list]) => (
            <Reveal key={day} className="card p-4 sm:p-6">
              <h2 className="t-eyebrow mb-4 text-muted first-letter:uppercase">{day}</h2>
              <TimelineList items={list} />
            </Reveal>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
