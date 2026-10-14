import { Droplets, ShieldAlert, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHero } from '../../components/Hero';
import { AdminPage } from '../../components/layout/AdminLayout';
import { useDocumentTitle } from '../../components/layout/common';
import { MapView, type MapPin } from '../../components/MapView';
import { EmptyState } from '../../components/ui/Decor';
import { ScrollRow, Segmented } from '../../components/ui/Form';
import { CountUp, Meter, Reveal, Skeleton, Stagger } from '../../components/ui/motion';
import { photos } from '../../data/photos';
import { basinTone } from '../../lib/format';
import { useLive } from '../../lib/useCatalog';
import { Kpi, Panel, SourceBadge } from './shared';

type Filter = 'ALL' | 'CRITIQUE' | 'ELEVE' | 'OTHER';

export function BasinsPage() {
  useDocumentTitle('Points noirs');
  const { basins, loading, source } = useLive();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [selected, setSelected] = useState<string | null>(null);

  const sorted = useMemo(() => basins.slice().sort((a, b) => b.obstructionPct - a.obstructionPct), [basins]);
  const visible = sorted.filter((basin) => {
    if (filter === 'ALL') return true;
    if (filter === 'OTHER') return basin.status !== 'CRITIQUE' && basin.status !== 'ELEVE';
    return basin.status === filter;
  });
  const critical = basins.filter((basin) => basin.status === 'CRITIQUE').length;
  const average = basins.length ? Math.round(basins.reduce((sum, basin) => sum + basin.obstructionPct, 0) / basins.length) : 0;
  const pins = useMemo<MapPin[]>(() => visible.map((basin) => ({
    id: basin.id, lat: basin.latitude, lng: basin.longitude, label: `${basin.name} · ${basin.obstructionPct} %`, tone: basinTone(basin.status), kind: 'basin',
  })), [visible]);

  return (
    <AdminPage>
      <PageHero
        photo={photos.bassin}
        size="sm"
        eyebrow={<span className="inline-flex items-center gap-2">Bassins <SourceBadge source={source} /></span>}
        title="Points noirs"
        short="Obstruction des bassins suivis."
        long="Bassins de rétention et caniveaux suivis, avec le taux d’obstruction remonté par les équipes terrain."
      />

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-3 [&>:nth-child(3)]:col-span-2 lg:[&>:nth-child(3)]:col-span-1">
        <Kpi accent label="Bassins suivis" value={basins.length} hint="Grand Lomé" icon={Droplets} />
        <Kpi label="Critiques" value={critical} hint="à curer en priorité" icon={ShieldAlert} tone="alert" />
        <Kpi label="Obstruction moyenne" value={average} suffix=" %" hint="tous bassins" icon={Wrench} tone="water" />
      </Stagger>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-3">
          <ScrollRow>
            <Segmented
              label="Filtrer les bassins"
              value={filter}
              onChange={setFilter}
              className="min-w-max"
              options={[
                { value: 'ALL', label: 'Tous', count: basins.length },
                { value: 'CRITIQUE', label: 'Critiques', count: critical },
                { value: 'ELEVE', label: 'Élevés', count: basins.filter((basin) => basin.status === 'ELEVE').length },
                { value: 'OTHER', label: 'Sous contrôle', count: basins.filter((basin) => basin.status !== 'CRITIQUE' && basin.status !== 'ELEVE').length },
              ]}
            />
          </ScrollRow>
          {loading ? <Skeleton className="h-64" /> : visible.length === 0 ? (
            <EmptyState icon={<Droplets size={20} />} title="Aucun bassin" text="Aucun bassin dans cette catégorie." />
          ) : (
            <Stagger className="grid gap-3 sm:grid-cols-2">
              {visible.map((basin) => (
                <Reveal key={basin.id} y={12}>
                  <button
                    type="button"
                    onClick={() => setSelected(basin.id)}
                    aria-pressed={selected === basin.id}
                    className="card card-hover block h-full w-full p-4 text-left"
                    style={selected === basin.id ? { borderColor: 'var(--cyan)' } : undefined}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold leading-snug">{basin.name}</p>
                        <p className="truncate text-xs text-muted">{basin.commune}</p>
                      </div>
                      <span className="badge badge-dot shrink-0" data-tone={basinTone(basin.status)}>{basin.statusLabel}</span>
                    </div>
                    <p className="t-num mt-4 font-display text-[28px] leading-none font-semibold"><CountUp value={basin.obstructionPct} suffix=" %" /></p>
                    <p className="mb-2 text-xs text-muted">obstrué</p>
                    <Meter value={basin.obstructionPct} tone={basinTone(basin.status)} label={`${basin.name} : obstruction`} />
                  </button>
                </Reveal>
              ))}
            </Stagger>
          )}
        </div>
        <Reveal className="xl:sticky xl:top-24 xl:self-start">
          <Panel title="Carte des bassins" bodyClassName="">
            <MapView pins={pins} selectedId={selected} onSelect={setSelected} className="h-[360px] xl:h-[560px]" />
          </Panel>
        </Reveal>
      </div>
    </AdminPage>
  );
}
