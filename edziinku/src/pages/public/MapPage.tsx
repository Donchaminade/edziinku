import { AnimatePresence, motion } from 'motion/react';
import { Camera, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { PageHero } from '../../components/Hero';
import { useDocumentTitle } from '../../components/layout/common';
import { PublicPage } from '../../components/layout/PublicLayout';
import { MapLegend, MapView, type MapPin } from '../../components/MapView';
import { ReportSummary } from '../../components/ReportDetail';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Decor';
import { ScrollRow, Segmented, TextInput } from '../../components/ui/Form';
import { Reveal, Skeleton, ease } from '../../components/ui/motion';
import { Sheet, useMediaQuery } from '../../components/ui/Overlay';
import { photos } from '../../data/photos';
import { ago, waterTone } from '../../lib/format';
import { useLive } from '../../lib/useCatalog';
import type { WaterLevel } from '../../types';

type Filter = 'ALL' | WaterLevel;

function parseFocus(params: URLSearchParams) {
  const lat = Number(params.get('lat'));
  const lng = Number(params.get('lng'));
  const zoom = Number(params.get('zoom') || '15');
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  return { lat, lng, zoom: Number.isFinite(zoom) ? Math.min(18, Math.max(10, zoom)) : 15 };
}

export function MapPage() {
  useDocumentTitle('Carte live');
  const live = useLive();
  const [params] = useSearchParams();
  const location = useLocation();
  const focus = useMemo(
    () => parseFocus(new URLSearchParams(location.search)),
    [location.search],
  );
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState(
    () => params.get('quartier') || new URLSearchParams(location.search).get('quartier') || '',
  );
  const [selected, setSelected] = useState<string | null>(null);

  const count = (level: WaterLevel) => live.reports.filter((report) => report.waterLevel === level).length;
  const visible = useMemo(() => live.reports.filter((report) => {
    if (filter !== 'ALL' && report.waterLevel !== filter) return false;
    if (!query) return true;
    const text = `${report.placeLabel} ${report.neighborhoodName ?? ''} ${report.reference}`.toLowerCase();
    return text.includes(query.toLowerCase());
  }), [filter, live.reports, query]);

  const pins = useMemo<MapPin[]>(() => visible.map((report) => ({
    id: report.id,
    lat: report.latitude,
    lng: report.longitude,
    label: `${report.placeLabel} · ${report.waterLevelLabel}`,
    tone: waterTone(report.waterLevel),
  })), [visible]);

  const current = live.reports.find((report) => report.id === selected) ?? null;
  const wide = useMediaQuery('(min-width: 640px)');

  return (
    <PublicPage>
      <PageHero
        photo={photos.adidogome}
        eyebrow="Carte live"
        title="L’eau signalée à Lomé"
        short="Les signalements ouverts, en temps réel."
        long="Chaque point est un signalement d’habitant : lieu, niveau d’eau, heure. Touchez un point pour le détail."
        size="sm"
      >
        <Button to="/signaler" variant="primary"><Camera size={17} /> Signaler l’eau</Button>
      </PageHero>

      <Reveal className="card overflow-hidden p-0">
        <div className="grid lg:grid-cols-[380px_1fr]">
          <div className="order-2 flex min-w-0 flex-col border-line lg:order-1 lg:border-r">
            <div className="flex flex-col gap-3 border-b border-line p-3 sm:p-4">
              <TextInput icon={<Search size={17} />} placeholder="Lieu, quartier, référence…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Rechercher un signalement" type="search" inputMode="search" enterKeyHint="search" autoComplete="off" />
              <ScrollRow>
                <Segmented
                  label="Filtrer par niveau d’eau"
                  value={filter}
                  onChange={setFilter}
                  className="w-full min-w-max"
                  options={[
                    { value: 'ALL', label: 'Tous', count: live.reports.length },
                    { value: 'CHEVILLE', label: 'Cheville', count: count('CHEVILLE') },
                    { value: 'GENOU', label: 'Genou', count: count('GENOU') },
                    { value: 'TAILLE', label: 'Taille', count: count('TAILLE') },
                  ]}
                />
              </ScrollRow>
            </div>
            <p className="sr-only" aria-live="polite">{visible.length} signalement{visible.length > 1 ? 's' : ''} affiché{visible.length > 1 ? 's' : ''}</p>
            <ul className="scroll-thin flex max-h-[420px] flex-col gap-2 overflow-y-auto p-3 lg:max-h-[600px]">
              {live.loading && [0, 1, 2].map((key) => <li key={key}><Skeleton className="h-[72px]" /></li>)}
              {!live.loading && visible.length === 0 && (
                <li><EmptyState title="Aucun signalement" text="Rien ne correspond à ce filtre. La carte est calme." /></li>
              )}
              <AnimatePresence initial={false}>
                {visible.map((report) => {
                  const on = report.id === selected;
                  return (
                    <motion.li
                      key={report.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(on ? null : report.id)}
                        className="card-hover flex min-h-[72px] w-full items-center gap-3 rounded-2xl border p-3 text-left"
                        style={{ borderColor: on ? 'var(--cyan)' : 'var(--line)', background: on ? 'var(--accent-soft)' : 'transparent' }}
                        aria-pressed={on}
                      >
                        <span className="map-pin shrink-0" data-tone={waterTone(report.waterLevel)} style={{ animation: 'none' }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{report.placeLabel}</span>
                          <span className="block truncate text-xs text-muted">{report.neighborhoodName ?? 'Lomé'} · {ago(report.createdAt)}</span>
                        </span>
                        <span className="badge shrink-0" data-tone={waterTone(report.waterLevel)}>{report.waterLevelLabel}</span>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>

          <div className="relative isolate order-1 lg:order-2">
            <MapView pins={pins} selectedId={selected} onSelect={setSelected} focus={focus} fit={!focus} className="h-[56svh] min-h-[320px] lg:h-[720px]" />
            <MapLegend className="absolute top-3 left-3 z-[500]" />
            <AnimatePresence>
              {current && wide && (
                <motion.div
                  key={current.id}
                  className="overlay-panel absolute right-3 bottom-3 left-3 z-[500] rounded-[22px] p-4 sm:right-auto sm:w-[360px]"
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.98 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="t-num text-xs text-muted">{current.reference}</p>
                      <p className="t-h3 truncate">{current.placeLabel}</p>
                    </div>
                    <button type="button" className="btn btn-ghost btn-icon -mt-1 -mr-1" onClick={() => setSelected(null)} aria-label="Fermer le détail">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="max-h-[40svh] overflow-y-auto">
                    <ReportSummary report={current} withPhoto={Boolean(current.photoUrl)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>

      <Sheet
        open={Boolean(current) && !wide}
        onClose={() => setSelected(null)}
        title={current?.placeLabel ?? ''}
        subtitle={current ? <span className="t-num">{current.reference} · {ago(current.createdAt)}</span> : undefined}
        footer={<Button to="/signaler" variant="primary" block><Camera size={17} /> Signaler ici aussi</Button>}
      >
        {current && <ReportSummary report={current} withPhoto={Boolean(current.photoUrl)} />}
      </Sheet>
    </PublicPage>
  );
}
