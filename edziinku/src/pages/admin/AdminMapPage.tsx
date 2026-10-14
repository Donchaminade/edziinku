import { AnimatePresence, motion } from 'motion/react';
import { Droplets, MapPin as PinIcon, Search, ShieldAlert, X } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { PageHero } from '../../components/Hero';
import { AdminPage } from '../../components/layout/AdminLayout';
import { useDocumentTitle } from '../../components/layout/common';
import { MapLegend, MapView, type MapPin } from '../../components/MapView';
import { ReportSummary } from '../../components/ReportDetail';
import { EmptyState } from '../../components/ui/Decor';
import { ScrollRow, Segmented, TextInput } from '../../components/ui/Form';
import { Meter, Reveal, ease } from '../../components/ui/motion';
import { Sheet, useMediaQuery } from '../../components/ui/Overlay';
import { photos } from '../../data/photos';
import { ago, basinTone, waterTone } from '../../lib/format';
import { useLive } from '../../lib/useCatalog';
import { useAdminReports } from './shared';

type Layer = 'all' | 'reports' | 'basins';

export function AdminMapPage() {
  useDocumentTitle('Carte live · équipes');
  const live = useLive();
  const all = useAdminReports();
  const openReports = (all.data?.items ?? []).filter((report) => report.status !== 'REJETE' && report.status !== 'DOUBLON');
  const [layer, setLayer] = useState<Layer>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const match = (text: string) => !query || text.toLowerCase().includes(query.toLowerCase());
  const reports = openReports.filter((report) => layer !== 'basins' && match(`${report.placeLabel} ${report.reference} ${report.neighborhoodName ?? ''}`));
  const basins = live.basins.filter((basin) => layer !== 'reports' && match(`${basin.name} ${basin.commune}`));

  const pins = useMemo<MapPin[]>(() => [
    ...reports.map((report) => ({ id: report.id, lat: report.latitude, lng: report.longitude, label: report.placeLabel, tone: waterTone(report.waterLevel) })),
    ...basins.map((basin) => ({ id: basin.id, lat: basin.latitude, lng: basin.longitude, label: basin.name, tone: basinTone(basin.status), kind: 'basin' as const })),
  ], [reports, basins]);

  const currentReport = openReports.find((report) => report.id === selected) ?? null;
  const currentBasin = live.basins.find((basin) => basin.id === selected) ?? null;
  const wide = useMediaQuery('(min-width: 640px)');

  const detail = (
    <>
      {currentReport && <ReportSummary report={currentReport} withPhoto={Boolean(currentReport.photoUrl)} />}
      {currentBasin && (
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-muted">{currentBasin.commune}</p>
          <Meter value={currentBasin.obstructionPct} tone={basinTone(currentBasin.status)} label="Obstruction" />
          <p><span className="t-num font-semibold">{currentBasin.obstructionPct} %</span> obstrué · {currentBasin.statusLabel}</p>
        </div>
      )}
    </>
  );

  return (
    <AdminPage>
      <PageHero
        photo={photos.hedzranawoe}
        size="sm"
        eyebrow="Terrain"
        title="Carte live"
        short={`${openReports.length} signalements · ${live.basins.length} bassins`}
        long={`${openReports.length} signalements d’habitants et ${live.basins.length} bassins suivis, sur une seule carte.`}
      />
      <Reveal className="card overflow-hidden p-0">
        <div className="grid lg:grid-cols-[340px_1fr]">
          <div className="order-2 flex min-w-0 flex-col border-line lg:order-1 lg:border-r">
            <div className="flex flex-col gap-3 border-b border-line p-3 sm:p-4">
              <TextInput icon={<Search size={17} />} placeholder="Lieu, bassin, référence…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Rechercher sur la carte" type="search" inputMode="search" enterKeyHint="search" autoComplete="off" />
              <ScrollRow>
                <Segmented
                  label="Couches affichées"
                  value={layer}
                  onChange={setLayer}
                  className="w-full min-w-max"
                  options={[
                    { value: 'all', label: 'Tout', count: openReports.length + live.basins.length },
                    { value: 'reports', label: 'Eau', count: openReports.length },
                    { value: 'basins', label: 'Bassins', count: live.basins.length },
                  ]}
                />
              </ScrollRow>
            </div>
            <ul className="scroll-thin flex max-h-[380px] flex-col gap-1.5 overflow-y-auto p-3 lg:max-h-[640px]">
              {pins.length === 0 && <li><EmptyState title="Rien à afficher" text="Aucun point ne correspond à cette recherche." /></li>}
              {reports.map((report) => (
                <ListButton key={report.id} on={selected === report.id} onClick={() => setSelected(selected === report.id ? null : report.id)}
                  icon={<span className="map-pin shrink-0" data-tone={waterTone(report.waterLevel)} style={{ animation: 'none' }} />}
                  title={report.placeLabel}
                  meta={`${report.reference} · ${ago(report.createdAt)}`}
                  badge={<span className="badge" data-tone={waterTone(report.waterLevel)}>{report.waterLevelLabel}</span>}
                />
              ))}
              {basins.map((basin) => (
                <ListButton key={basin.id} on={selected === basin.id} onClick={() => setSelected(selected === basin.id ? null : basin.id)}
                  icon={<span className="icon-tile icon-tile-sm" data-tone="water"><Droplets size={16} /></span>}
                  title={basin.name}
                  meta={`${basin.commune} · ${basin.obstructionPct} % obstrué`}
                  badge={<span className="badge" data-tone={basinTone(basin.status)}>{basin.statusLabel}</span>}
                />
              ))}
            </ul>
          </div>
          <div className="relative isolate order-1 lg:order-2">
            <MapView pins={pins} selectedId={selected} onSelect={setSelected} className="h-[56svh] min-h-[340px] lg:h-[740px]" />
            <MapLegend className="absolute top-3 left-3 z-[500]" />
            <AnimatePresence>
              {(currentReport || currentBasin) && wide && (
                <motion.div
                  key={selected}
                  className="glass-strong absolute right-3 bottom-3 left-3 z-[500] rounded-[22px] p-4 sm:right-auto sm:w-[360px]"
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.98 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="icon-tile icon-tile-sm" data-tone={currentBasin ? 'water' : 'warn'}>{currentBasin ? <ShieldAlert size={16} /> : <PinIcon size={16} />}</span>
                      <p className="t-h3 truncate text-base">{currentReport?.placeLabel ?? currentBasin?.name}</p>
                    </div>
                    <button type="button" className="btn btn-ghost btn-icon -mt-1 -mr-1" onClick={() => setSelected(null)} aria-label="Fermer le détail"><X size={18} /></button>
                  </div>
                  <div className="max-h-[38svh] overflow-y-auto">{detail}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>

      <Sheet
        open={Boolean(currentReport || currentBasin) && !wide}
        onClose={() => setSelected(null)}
        title={currentReport?.placeLabel ?? currentBasin?.name ?? ''}
        subtitle={currentReport ? <span className="t-num">{currentReport.reference} · {ago(currentReport.createdAt)}</span> : currentBasin ? `Bassin · ${currentBasin.commune}` : undefined}
      >
        {detail}
      </Sheet>
    </AdminPage>
  );
}

function ListButton({ on, onClick, icon, title, meta, badge }: { on: boolean; onClick: () => void; icon: ReactNode; title: string; meta: string; badge: ReactNode }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={on}
        className="card-hover flex min-h-16 w-full items-center gap-3 rounded-2xl border p-3 text-left"
        style={{ borderColor: on ? 'var(--cyan)' : 'transparent', background: on ? 'var(--accent-soft)' : 'transparent' }}
      >
        {icon}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{title}</span>
          <span className="block truncate text-xs text-muted">{meta}</span>
        </span>
        <span className="shrink-0">{badge}</span>
      </button>
    </li>
  );
}
