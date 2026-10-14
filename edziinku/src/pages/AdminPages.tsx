import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { MapView, type MapPin } from '../components/MapView';
import { Page } from '../components/Shell';
import { api, apiBase, ApiError } from '../lib/api';
import { ago, basinTone, clock, statusTone, waterTone } from '../lib/format';
import { useLive } from '../lib/useCatalog';
import { CountUp, Drawer, HoverCard, Modal, Press, Reveal, Skeleton, Stagger, StaggerItem, Toast } from '../motion/ui';
import { demoDashboard } from '../data/demo';
import type { AlertItem, Dashboard, Outbound, Page as PageType, ReportItem, Team, TimelineItem } from '../types';

export function OverviewPage() {
  const live = useLive();
  const [dash, setDash] = useState<Dashboard | null>(null);
  useEffect(() => {
    let cancel = false;
    void api<Dashboard>('/api/admin/dashboard')
      .then((data) => { if (!cancel) setDash(data); })
      .catch(() => { if (!cancel) setDash(demoDashboard); });
    return () => { cancel = true; };
  }, []);
  const data = dash;
  return (
    <Page>
      <Reveal>
        <h1 className="font-display text-4xl">Vue d’ensemble</h1>
        <p className="mt-1 text-muted">{live.source === 'demo' || data?.demo ? 'Chiffres de démonstration.' : 'Chiffres issus de la base.'}</p>
      </Reveal>
      {!data ? <Skeleton className="mt-6 h-28" /> : (
        <Stagger className="mt-6 grid gap-3 md:grid-cols-4">
          <Kpi label="Alertes envoyées" value={data.alertsSentToday} hint="aujourd’hui" hot />
          <Kpi label="Signalements" value={data.reports24h} hint={data.reportsTrend} />
          <Kpi label="Points noirs" value={data.activeBlackSpots} hint={`${data.criticalBlackSpots} critiques`} />
          <Kpi label="À curer" value={data.drainsToClear} hint={`${data.plannedThisWeek} cette semaine`} />
        </Stagger>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <HoverCard className="surface p-5">
          <h2 className="font-display text-xl">{data?.vigilanceLabel ?? 'Vigilance'}</h2>
          <p className="text-muted">{data?.vigilanceNeighborhood} · {data?.vigilanceWindow}</p>
          <WeekChart />
        </HoverCard>
        <div className="flex flex-col gap-3">
          {live.loading ? <Skeleton className="h-40" /> : live.basins.slice(0, 4).map((basin) => (
            <HoverCard key={basin.id} className="surface p-4">
              <div className="flex items-center justify-between">
                <strong>{basin.name}</strong>
                <span className="tag" data-tone={basinTone(basin.status)}>{basin.statusLabel}</span>
              </div>
              <div className="bar mt-3"><motion.i data-tone={basinTone(basin.status)} initial={{ width: 0 }} animate={{ width: `${basin.obstructionPct}%` }} /></div>
              <p className="mt-1 text-xs text-muted">{basin.commune} · {basin.obstructionPct} % obstrué</p>
            </HoverCard>
          ))}
        </div>
      </div>
    </Page>
  );
}

function Kpi({ label, value, hint, hot }: { label: string; value: number; hint: string; hot?: boolean }) {
  return (
    <StaggerItem>
      <HoverCard className={`kpi surface p-4 ${hot ? 'kpi-hot' : ''}`}>
        <span className="text-sm">{label}</span>
        <b><CountUp value={value} /></b>
        <p className="text-sm">{hint}</p>
      </HoverCard>
    </StaggerItem>
  );
}

function WeekChart() {
  const { weather } = useLive();
  const reduce = useReducedMotion();
  const max = Math.max(...weather.days.map((day) => day.precipitationMm), 1);
  return (
    <div className="mt-6 flex h-36 items-end gap-2">
      {weather.days.map((day) => (
        <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
          <motion.div
            className="rain-col w-full"
            data-forecast={day.forecast ? 'true' : 'false'}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: `${Math.max(6, (day.precipitationMm / max) * 120)}px` }}
            transition={{ duration: 0.6 }}
          />
          <span className="text-xs text-muted">{day.label}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminMapPage() {
  const live = useLive();
  const [id, setId] = useState<string | null>(null);
  const pins = useMemo<MapPin[]>(() => [
    ...live.reports.map((report) => ({
      id: report.id, lat: report.latitude, lng: report.longitude,
      label: report.placeLabel, tone: waterTone(report.waterLevel),
    })),
    ...live.basins.map((basin) => ({
      id: basin.id, lat: basin.latitude, lng: basin.longitude,
      label: basin.name, tone: basinTone(basin.status),
    })),
  ], [live.reports, live.basins]);
  return (
    <div className="grid min-h-screen lg:grid-cols-[320px_1fr]">
      <div className="max-h-[40vh] overflow-auto p-4 lg:max-h-screen">
        <h1 className="font-display text-2xl">Carte live</h1>
        <p className="text-sm text-muted">{live.reports.length} signalements · {live.basins.length} bassins</p>
        <div className="mt-3 flex flex-col gap-2">
          {pins.map((pin) => (
            <button key={pin.id} type="button" className={`surface p-3 text-left ${id === pin.id ? 'ring-1 ring-cyan' : ''}`} onClick={() => setId(pin.id)}>
              {pin.label}
            </button>
          ))}
        </div>
      </div>
      <MapView className="h-[60vh] lg:h-screen" pins={pins} selectedId={id} onSelect={setId} />
    </div>
  );
}

export function ModerationPage() {
  const live = useLive();
  const [status, setStatus] = useState('');
  const [level, setLevel] = useState('');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<ReportItem[] | null>(null);
  const [current, setCurrent] = useState<ReportItem | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (level) params.set('level', level);
    if (query) params.set('q', query);
    let cancel = false;
    void api<PageType<ReportItem>>(`/api/admin/reports?${params.toString()}`)
      .then((page) => { if (!cancel) setRows(page.items); })
      .catch(() => { if (!cancel) setRows(live.reports); });
    return () => { cancel = true; };
  }, [status, level, query, live.reports]);

  async function moderate(id: string, next: string) {
    try {
      const updated = await api<ReportItem>(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      setRows((list) => list?.map((item) => item.id === id ? updated : item) ?? list);
      setCurrent(updated);
      setRejecting(false);
      setToast(`Signalement ${updated.reference} : ${updated.statusLabel}`);
      live.reload();
    } catch (error) {
      setToast(error instanceof ApiError ? error.message : 'Modération impossible');
    }
  }

  async function download() {
    const token = localStorage.getItem('edzii-access');
    const response = await fetch(`${apiBase}/api/admin/reports/export${status ? `?status=${status}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      setToast('Export impossible');
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'signalements-edzii-nku.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Page>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">Signalements</h1>
        <Press className="btn" onClick={() => { void download(); }}>Exporter CSV</Press>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <select className="field w-auto" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="A_VERIFIER">À vérifier</option>
          <option value="VALIDE">Validé</option>
          <option value="REJETE">Rejeté</option>
          <option value="DOUBLON">Doublon</option>
        </select>
        <select className="field w-auto" value={level} onChange={(event) => setLevel(event.target.value)}>
          <option value="">Tous les niveaux</option>
          <option value="CHEVILLE">Cheville</option>
          <option value="GENOU">Genou</option>
          <option value="TAILLE">Taille</option>
        </select>
        <span className="field w-auto min-w-48"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Référence, lieu…" /></span>
      </div>
      <div className="surface mt-4 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="p-3">Réf.</th>
              <th className="p-3">Lieu</th>
              <th className="p-3">Niveau</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Quand</th>
            </tr>
          </thead>
          <tbody>
            {!rows && <tr><td colSpan={5} className="p-3"><Skeleton className="h-10" /></td></tr>}
            {rows?.map((row) => (
              <tr key={row.id} className="cursor-pointer border-t border-line" onClick={() => setCurrent(row)}>
                <td className="p-3 font-display">{row.reference}</td>
                <td className="p-3">{row.placeLabel}</td>
                <td className="p-3"><span className="tag" data-tone={waterTone(row.waterLevel)}>{row.waterLevelLabel}</span></td>
                <td className="p-3"><span className="tag" data-tone={statusTone(row.status)}>{row.statusLabel}</span></td>
                <td className="p-3 text-muted">{ago(row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Drawer open={Boolean(current)} title={current?.reference ?? ''} onClose={() => setCurrent(null)}>
        {current && (
          <div className="flex flex-col gap-3">
            <p>{current.placeLabel}</p>
            <p className="text-muted">{current.comment}</p>
            <p className="text-sm text-muted">{current.neighborhoodName} · {current.channel} · {current.confirmations} confirmations</p>
            <div className="flex flex-wrap gap-2">
              <Press className="btn btn-primary" onClick={() => { void moderate(current.id, 'VALIDE'); }}>Valider</Press>
              <Press className="btn" onClick={() => setRejecting(true)}>Rejeter</Press>
              <Press className="btn" onClick={() => { void moderate(current.id, 'DOUBLON'); }}>Doublon</Press>
            </div>
          </div>
        )}
      </Drawer>
      <Modal open={rejecting} title="Rejeter le signalement" onClose={() => setRejecting(false)}>
        <p className="text-muted">Le signalement sort de la carte publique.</p>
        <div className="mt-4 flex gap-2">
          <Press className="btn btn-primary" onClick={() => { if (current) void moderate(current.id, 'REJETE'); }}>Confirmer</Press>
          <button type="button" className="btn" onClick={() => setRejecting(false)}>Annuler</button>
        </div>
      </Modal>
      <Toast message={toast} />
    </Page>
  );
}

export function AlertsPage() {
  const live = useLive();
  const [toast, setToast] = useState<string | null>(null);
  const [title, setTitle] = useState('Forte pluie prévue');
  const [body, setBody] = useState('De fortes pluies sont prévues. Surélevez vos biens, évitez les caniveaux.');
  const [bodyEwe, setBodyEwe] = useState('');
  const [level, setLevel] = useState('ELEVE');
  const [hood, setHood] = useState('');

  async function publish(event: FormEvent) {
    event.preventDefault();
    try {
      const created = await api<AlertItem>('/api/admin/alerts', {
        method: 'POST',
        body: JSON.stringify({
          title, body, bodyEwe: bodyEwe || null, level, kind: 'RAIN',
          neighborhoodId: hood || null, source: 'Mairie',
        }),
      });
      setToast(`Alerte publiée : ${created.title}`);
      live.reload();
    } catch (error) {
      setToast(error instanceof ApiError ? error.message : 'Publication impossible');
    }
  }

  return (
    <Page>
      <h1 className="font-display text-4xl">Alertes</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <form className="surface flex flex-col gap-3 p-5" onSubmit={publish}>
          <label className="text-sm text-muted">Titre<span className="field mt-1"><input value={title} onChange={(event) => setTitle(event.target.value)} required /></span></label>
          <label className="text-sm text-muted">Message<span className="field mt-1"><textarea rows={4} value={body} onChange={(event) => setBody(event.target.value)} required /></span></label>
          <label className="text-sm text-muted">Éwé (facultatif, à relire)<span className="field mt-1"><textarea rows={3} value={bodyEwe} onChange={(event) => setBodyEwe(event.target.value)} /></span></label>
          <div className="flex gap-2">
            <select className="field" value={level} onChange={(event) => setLevel(event.target.value)}>
              <option value="INFO">Info</option>
              <option value="VIGILANCE">Vigilance</option>
              <option value="ELEVE">Élevé</option>
              <option value="CRITIQUE">Critique</option>
            </select>
            <select className="field" value={hood} onChange={(event) => setHood(event.target.value)}>
              <option value="">Tous les quartiers</option>
              {live.neighborhoods.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <Press className="btn btn-primary" type="submit">Publier et préparer l’envoi</Press>
        </form>
        <Stagger className="flex flex-col gap-3">
          {live.alerts.map((alert) => (
            <StaggerItem key={alert.id}>
              <article className="surface p-4">
                <div className="flex justify-between gap-2">
                  <strong>{alert.title}</strong>
                  <span className="text-xs text-muted">{ago(alert.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{alert.body}</p>
                {alert.eweNeedsReview && <p className="ewe-note mt-2">Éwé à relire par un locuteur natif.</p>}
                <button
                  type="button"
                  className="btn mt-3"
                  onClick={() => {
                    void api(`/api/admin/alerts/${alert.id}/broadcast`, { method: 'POST' })
                      .then(() => setToast('Diffusion préparée'))
                      .catch(() => setToast('Diffusion impossible'));
                  }}
                >
                  Rediffuser
                </button>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
      <Toast message={toast} />
    </Page>
  );
}

export function BasinsPage() {
  const { basins, loading } = useLive();
  return (
    <Page>
      <h1 className="font-display text-4xl">Points noirs</h1>
      {loading ? <Skeleton className="mt-6 h-32" /> : (
        <Stagger className="mt-6 grid gap-3 md:grid-cols-2">
          {basins.map((basin) => (
            <StaggerItem key={basin.id}>
              <HoverCard className="surface p-4">
                <div className="flex justify-between">
                  <strong>{basin.name}</strong>
                  <span className="tag" data-tone={basinTone(basin.status)}>{basin.statusLabel}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{basin.commune}</p>
                <div className="bar mt-3"><motion.i data-tone={basinTone(basin.status)} initial={{ width: 0 }} whileInView={{ width: `${basin.obstructionPct}%` }} viewport={{ once: true }} /></div>
                <p className="mt-1 text-sm"><CountUp value={basin.obstructionPct} /> %</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </Page>
  );
}

export function HistoryPage() {
  const [items, setItems] = useState<TimelineItem[] | null>(null);
  useEffect(() => {
    void api<TimelineItem[]>('/api/admin/timeline').then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <Page>
      <h1 className="font-display text-4xl">Historique</h1>
      <div className="mt-6 flex flex-col gap-4">
        {!items && <Skeleton className="h-20" />}
        {items?.map((item, index) => (
          <Reveal key={item.id} delay={index * 0.04}>
            <article className="surface p-4">
              <p className="text-xs text-muted">{clock(item.occurredAt)} · {item.kind}</p>
              <h2 className="font-display text-xl">{item.title}</h2>
              {item.detail && <p className="text-muted">{item.detail}</p>}
            </article>
          </Reveal>
        ))}
        {items && !items.length && <p className="text-muted">Aucun événement.</p>}
      </div>
    </Page>
  );
}

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  useEffect(() => {
    void api<Team[]>('/api/admin/teams').then(setTeams).catch(() => setTeams([]));
  }, []);
  return (
    <Page>
      <h1 className="font-display text-4xl">Équipes</h1>
      <Stagger className="mt-6 grid gap-3 md:grid-cols-2">
        {!teams && <Skeleton className="h-24" />}
        {teams?.map((team) => (
          <StaggerItem key={team.id}>
            <HoverCard className="surface p-4">
              <div className="flex justify-between">
                <strong>{team.name}</strong>
                <span className="tag" data-tone={team.status === 'SUR_PLACE' ? 'ok' : team.status === 'EN_ROUTE' ? 'warn' : 'info'}>{team.status.replace('_', ' ')}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{team.zone}</p>
              <p className="text-sm">{team.assignment}</p>
            </HoverCard>
          </StaggerItem>
        ))}
      </Stagger>
    </Page>
  );
}

export function OutboxPage() {
  const [rows, setRows] = useState<Outbound[] | null>(null);
  useEffect(() => {
    void api<Outbound[]>('/api/admin/whatsapp/outbox').then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <Page>
      <h1 className="font-display text-4xl">Messages sortants</h1>
      <p className="mt-2 text-sm text-muted">File WhatsApp. Sans jeton Cloud API, les messages restent en échec d’envoi et sont conservés ici.</p>
      <div className="mt-4 flex flex-col gap-3">
        {!rows && <Skeleton className="h-16" />}
        {rows?.map((row) => (
          <Reveal key={row.id}>
            <article className="surface p-4">
              <div className="flex justify-between text-sm text-muted">
                <span>{row.recipient}</span>
                <span className="tag" data-tone={row.status === 'SENT' ? 'ok' : row.status === 'FAILED' ? 'alert' : 'warn'}>{row.status}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap">{row.body}</p>
            </article>
          </Reveal>
        ))}
        {rows && !rows.length && <p className="text-muted">Aucun message pour le moment.</p>}
      </div>
    </Page>
  );
}
