import { MapPinned } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router';
import { mediaUrl } from '../lib/api';
import { ago, formatInt, mapFocusPath } from '../lib/format';
import { useHotspots } from '../lib/useHotspots';
import type { HotspotZone } from '../types';
import { Button } from './ui/Button';
import { EmptyState } from './ui/Decor';
import { Skeleton } from './ui/motion';
import { Sheet } from './ui/Overlay';

export function HeroHotspots() {
  const [open, setOpen] = useState(false);
  const { zones, status, loading, data } = useHotspots();
  const dialogId = useId();
  const empty = status === 'empty' || status === 'error' || (!loading && zones.length === 0);

  return (
    <>
      <button
        type="button"
        className="hotspot-pill"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        <MapPinned size={14} aria-hidden />
        {empty ? (
          <span className="hotspot-pill-title">Aucune zone marquante cette semaine</span>
        ) : (
          <>
            <span className="hotspot-pill-title">Zones les plus signalées</span>
            {loading ? null : (
              <span className="hotspot-pill-zones">
                {zones.map((zone) => (
                  <span key={zone.id} className="hotspot-pill-chip">
                    {zone.label} · {formatInt(zone.count)}
                  </span>
                ))}
              </span>
            )}
          </>
        )}
      </button>

      <Sheet
        id={dialogId}
        open={open}
        onClose={() => setOpen(false)}
        title="Zones les plus signalées"
        subtitle={`${data.days} derniers jours`}
        solid
      >
        <div className="flex flex-col gap-5">
          {loading ? (
            <div className="grid gap-3">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : empty ? (
            <EmptyState
              title="Aucune zone marquante"
              text="Pas assez de signalements validés sur les 7 derniers jours pour dresser un classement."
              icon={<MapPinned size={22} />}
            />
          ) : (
            zones.map((zone) => <HotspotZoneBlock key={zone.id} zone={zone} onNavigate={() => setOpen(false)} />)
          )}
        </div>
      </Sheet>
    </>
  );
}

function HotspotZoneBlock({ zone, onNavigate }: { zone: HotspotZone; onNavigate: () => void }) {
  const mapTo = mapFocusPath(zone.lat, zone.lng, 15, zone.label);
  return (
    <section className="hotspot-zone">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="t-h3 text-[17px]">{zone.label}</h3>
          <p className="mt-0.5 text-sm text-muted">
            {formatInt(zone.count)} signalement{zone.count > 1 ? 's' : ''}
          </p>
        </div>
        <Button to={mapTo} size="sm" className="shrink-0" onClick={onNavigate} aria-label={`Voir ${zone.label} sur la carte`}>
          <MapPinned size={16} /> Voir sur la carte
        </Button>
      </div>
      {zone.reports.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Aucun aperçu pour cette zone.</p>
      ) : (
        <ul className="hotspot-grid">
          {zone.reports.map((report) => {
            const photo = mediaUrl(report.photoUrl);
            return (
              <li key={report.id}>
                <Link
                  to={`/signalement/${report.id}`}
                  className="hotspot-thumb"
                  onClick={onNavigate}
                  aria-label={`Voir le signalement de ${report.quartier}, ${ago(report.createdAt)}`}
                >
                  <span className="hotspot-thumb-photo">
                    {photo ? (
                      <img src={photo} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="hotspot-thumb-fallback" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-text">{report.quartier}</span>
                    <span className="block truncate text-[11px] text-muted">{ago(report.createdAt)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
