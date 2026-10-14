import { motion } from 'motion/react';
import { Building2, MapPinned, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHero } from '../../components/Hero';
import { useDocumentTitle } from '../../components/layout/common';
import { PublicPage } from '../../components/layout/PublicLayout';
import { MapView, type MapPin } from '../../components/MapView';
import { EmptyState, SectionHeader } from '../../components/ui/Decor';
import { Segmented, TextInput } from '../../components/ui/Form';
import { CountUp, Lift, Reveal, Skeleton, Stagger, StaggerItem } from '../../components/ui/motion';
import { photos } from '../../data/photos';
import { riskTone } from '../../lib/format';
import { useLive } from '../../lib/useCatalog';

type Risk = 'ALL' | 'ELEVE' | 'A_SURVEILLER' | 'MODERE';

export function CommunesPage() {
  useDocumentTitle('Communes suivies');
  const { neighborhoods, loading, reports } = useLive();
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState<Risk>('ALL');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => neighborhoods.filter((item) => {
    if (risk !== 'ALL' && item.riskLevel !== risk) return false;
    return `${item.name} ${item.commune}`.toLowerCase().includes(query.toLowerCase());
  }), [neighborhoods, query, risk]);

  const communes = useMemo(() => [...new Set(filtered.map((item) => item.commune))].sort(), [filtered]);
  const pins = useMemo<MapPin[]>(() => filtered.map((item) => ({
    id: item.id, lat: item.latitude, lng: item.longitude, label: `${item.name} · ${item.riskLabel}`, tone: riskTone(item.riskLevel),
  })), [filtered]);
  const count = (level: string) => neighborhoods.filter((item) => item.riskLevel === level).length;
  const reportsIn = (id: string) => reports.filter((report) => report.neighborhoodId === id).length;

  return (
    <PublicPage>
      <PageHero
        photo={photos.vue}
        eyebrow="Territoire"
        title="Communes et quartiers suivis"
        short="Le Grand Lomé, quartier par quartier."
        long="Les zones suivies dans le Grand Lomé, avec leur commune et le niveau de risque affiché. Certaines limites restent approximatives."
      />

      <Stagger className="grid grid-cols-3 gap-2.5 md:gap-4">
        {[
          ['Risque élevé', count('ELEVE'), 'alert'],
          ['À surveiller', count('A_SURVEILLER'), 'warn'],
          ['Modéré', count('MODERE'), 'ok'],
        ].map(([label, value, tone]) => (
          <StaggerItem key={label as string}>
            <div className="card p-4 md:p-5">
              <span className="badge badge-dot" data-tone={tone as string}><span className="max-sm:hidden">{label as string}</span><span className="sm:hidden">{(label as string).split(' ')[0]}</span></span>
              <p className="t-num mt-2 text-2xl font-semibold md:text-3xl">{loading ? '—' : <CountUp value={value as number} />}</p>
              <p className="text-xs text-muted">quartiers</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <section className="flex flex-col gap-6">
        <SectionHeader eyebrow="Explorer" title="Trouver son quartier" />
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <TextInput icon={<Search size={17} />} placeholder="Quartier ou commune…" value={query} onChange={(event) => setQuery(event.target.value)} className="md:max-w-sm" aria-label="Rechercher un quartier" />
          <Segmented
            label="Filtrer par risque"
            value={risk}
            onChange={setRisk}
            options={[
              { value: 'ALL', label: 'Tous' },
              { value: 'ELEVE', label: 'Élevé' },
              { value: 'A_SURVEILLER', label: 'À surveiller' },
              { value: 'MODERE', label: 'Modéré' },
            ]}
          />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
          <div className="flex flex-col gap-4">
            {loading && <Skeleton className="h-48" />}
            {!loading && communes.length === 0 && <EmptyState title="Aucun quartier" text="Aucun quartier ne correspond à cette recherche." icon={<MapPinned size={22} />} />}
            {communes.map((commune) => (
              <Reveal key={commune} className="card p-4 md:p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="icon-tile icon-tile-sm"><Building2 size={17} /></span>
                  <h2 className="t-h3 text-lg">{commune}</h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {filtered.filter((item) => item.commune === commune).map((item) => (
                    <Lift key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(item.id)}
                        className="card-hover flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 text-left"
                        style={{ borderColor: selected === item.id ? 'var(--cyan)' : 'var(--line)' }}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{item.name}</span>
                          <span className="block truncate text-xs text-muted">
                            {reportsIn(item.id)} signalement{reportsIn(item.id) > 1 ? 's' : ''}{item.approximate ? ' · limites approx.' : ''}
                          </span>
                        </span>
                        <span className="badge shrink-0" data-tone={riskTone(item.riskLevel)}>{item.riskLabel}</span>
                      </button>
                    </Lift>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
          <motion.div className="card sticky top-[calc(var(--header-h)+24px)] h-fit overflow-hidden p-0" layout>
            <MapView pins={pins} selectedId={selected} onSelect={setSelected} className="h-80 lg:h-[520px]" />
          </motion.div>
        </div>
      </section>
    </PublicPage>
  );
}
