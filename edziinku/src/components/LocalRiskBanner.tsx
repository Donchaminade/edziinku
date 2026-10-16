import { CloudLightning, CloudRain, MapPin, ShieldAlert } from 'lucide-react';
import { contrastOn } from '../lib/format';
import { NEIGHBOR_RADIUS_KM } from '../lib/localRisk';
import { useLocalRisk } from '../lib/useLocalRisk';
import { Button } from './ui/Button';

function kindIcon(kind: string) {
  if (kind === 'ORAGE') return CloudLightning;
  if (kind === 'CALME') return ShieldAlert;
  return CloudRain;
}

export function LocalRiskBanner({ className }: { className?: string }) {
  const { status, risk, message, request } = useLocalRisk();
  const weather = risk?.alerts.filter((item) => (
    ['ORAGE', 'FORTE_PLUIE', 'VIGILANCE_INONDATION', 'CALME', 'RAIN'].includes(item.alert.kind)
  )) ?? [];
  const neighborAlert = risk?.alerts.some((item) => item.scope === 'NEIGHBOR');
  const lead = weather[0] ?? risk?.alerts[0];
  const Icon = lead ? kindIcon(lead.alert.kind) : MapPin;

  return (
    <section className={`local-risk ${className ?? ''}`} aria-live="polite">
      <div className="local-risk-head">
        <span className="icon-tile icon-tile-sm" data-tone={lead && lead.alert.level !== 'INFO' ? 'alert' : undefined}>
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[17px] font-semibold">Risque près de chez vous</p>
          {status === 'denied' || status === 'prompt' ? (
            <p className="mt-0.5 text-sm text-muted">
              {message ?? 'Activez la position pour voir le risque près de chez vous.'}
            </p>
          ) : status === 'locating' ? (
            <p className="mt-0.5 text-sm text-muted">Localisation en cours…</p>
          ) : status === 'error' ? (
            <p className="mt-0.5 text-sm text-muted">{message}</p>
          ) : risk?.outOfKnownZone ? (
            <p className="mt-0.5 text-sm text-muted">{message}</p>
          ) : risk?.neighborhood ? (
            <p className="mt-0.5 text-sm text-muted">
              {risk.neighborhood.name}
              {risk.neighborhood.cityName ? ` · ${risk.neighborhood.cityName}` : ''}
              {risk.distanceM != null ? ` · ${Math.round(risk.distanceM)} m` : ''}
            </p>
          ) : null}
        </div>
      </div>

      {status === 'ready' && risk?.neighborhood && !risk.outOfKnownZone && (
        <div className="mt-3 flex flex-col gap-2">
          {risk.urgencyLabel && (
            <span
              className="urgency-badge w-fit"
              style={{
                background: risk.urgencyColor && /^#([0-9A-Fa-f]{6})$/.test(risk.urgencyColor)
                  ? risk.urgencyColor
                  : 'var(--primary)',
                color: contrastOn(risk.urgencyColor),
              }}
            >
              {risk.urgencyLabel}
            </span>
          )}
          {lead ? (
            <p className="text-sm text-text2">
              <strong>{lead.alert.title}</strong>
              {lead.scope === 'NEIGHBOR' ? ' — alerte dans un voisinage' : ` — ${lead.alert.kind === 'CALME' ? 'calme dans le secteur' : 'signe météo dans le secteur'}`}
            </p>
          ) : (
            <p className="text-sm text-text2">Aucun signe météo actif dans votre secteur.</p>
          )}
          {neighborAlert && (
            <p className="text-sm text-muted">
              Un voisinage est aussi en alerte
              {risk.neighborNames.length ? ` (${risk.neighborNames.slice(0, 3).join(', ')})` : ''}.
            </p>
          )}
          {risk.neighborNames.length > 0 && !neighborAlert && (
            <p className="text-xs text-muted">
              Voisinages dans {NEIGHBOR_RADIUS_KM} km : {risk.neighborNames.slice(0, 4).join(', ')}
              {risk.neighborNames.length > 4 ? '…' : ''}
            </p>
          )}
        </div>
      )}

      {(status === 'prompt' || status === 'denied' || status === 'error') && (
        <div className="mt-3">
          <Button variant="primary" onClick={request} className="btn-wrap w-full min-h-11 sm:w-auto">
            <MapPin size={16} /> Partager ma position pour voir le risque dans mon secteur
          </Button>
        </div>
      )}
    </section>
  );
}
