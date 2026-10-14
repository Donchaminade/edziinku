import { ArrowRight, Bell, CloudRain, Megaphone, ShieldAlert, Siren, Users } from 'lucide-react';
import { useMemo } from 'react';
import { BarChart, Donut } from '../../components/Charts';
import { PageHero } from '../../components/Hero';
import { AdminPage } from '../../components/layout/AdminLayout';
import { useDocumentTitle } from '../../components/layout/common';
import { MapLegend, MapView, type MapPin } from '../../components/MapView';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Decor';
import { Meter, Reveal, Skeleton, Stagger } from '../../components/ui/motion';
import { demoDashboard, demoTeams, demoTimeline } from '../../data/demo';
import { photos } from '../../data/photos';
import { ago, basinTone, waterTone } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import { useLive } from '../../lib/useCatalog';
import type { Dashboard, Team, TimelineItem } from '../../types';
import { Kpi, Panel, SourceBadge, TeamRow, TimelineList, useAdminReports } from './shared';

export function OverviewPage() {
  useDocumentTitle('Vue d’ensemble');
  const live = useLive();
  const dash = useApi<Dashboard>('/api/admin/dashboard', demoDashboard);
  const timeline = useApi<TimelineItem[]>('/api/admin/timeline', demoTimeline);
  const teams = useApi<Team[]>('/api/admin/teams', demoTeams);
  const all = useAdminReports();
  const reports = all.data?.items ?? [];
  const data = dash.data;
  const pending = reports.filter((report) => report.status === 'A_VERIFIER');

  const pins = useMemo<MapPin[]>(() => [
    ...reports.filter((report) => report.status !== 'REJETE').map((report) => ({ id: report.id, lat: report.latitude, lng: report.longitude, label: report.placeLabel, tone: waterTone(report.waterLevel) })),
    ...live.basins.map((basin) => ({ id: basin.id, lat: basin.latitude, lng: basin.longitude, label: basin.name, tone: basinTone(basin.status), kind: 'basin' as const })),
  ], [reports, live.basins]);

  const statuses = useMemo(() => {
    const count = (status: string) => reports.filter((report) => report.status === status).length;
    return [
      { key: 'A_VERIFIER', label: 'À vérifier', value: count('A_VERIFIER'), color: 'var(--warn)' },
      { key: 'VALIDE', label: 'Validés', value: count('VALIDE'), color: 'var(--ok)' },
      { key: 'REJETE', label: 'Rejetés', value: count('REJETE'), color: 'var(--alert)' },
      { key: 'DOUBLON', label: 'Doublons', value: count('DOUBLON'), color: 'var(--muted)' },
    ];
  }, [reports]);

  return (
    <AdminPage>
      <PageHero
        photo={photos.toits}
        size="sm"
        eyebrow={<span className="inline-flex items-center gap-2">Pilotage <SourceBadge source={dash.source} /></span>}
        title="Grand Lomé, saison des pluies"
        short={data ? `${data.vigilanceLabel} · ${data.vigilanceNeighborhood}` : 'Chargement des indicateurs…'}
        long={data ? `${data.vigilanceLabel} sur ${data.vigilanceNeighborhood}, ${data.vigilanceWindow}. ${data.pendingReports} signalements attendent une vérification.` : 'Chargement des indicateurs…'}
      >
        <Button to="/admin/alertes" variant="primary"><Megaphone size={17} /> Publier une alerte</Button>
        <Button to="/admin/signalements"><ShieldAlert size={17} /> Modérer{pending.length ? ` (${pending.length})` : ''}</Button>
      </PageHero>

      {!data ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-32" />)}</div>
      ) : (
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi accent label="Alertes envoyées" value={data.alertsSentToday} hint="aujourd’hui" icon={Bell} />
          <Kpi label="Signalements 24 h" value={data.reports24h} hint={data.reportsTrend} icon={Siren} tone="warn" />
          <Kpi label="Points noirs" value={data.activeBlackSpots} hint={`${data.criticalBlackSpots} critiques`} icon={ShieldAlert} tone="alert" />
          <Kpi label="Caniveaux à curer" value={data.drainsToClear} hint={`${data.plannedThisWeek} cette semaine`} icon={CloudRain} tone="water" />
        </Stagger>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Reveal>
          <Panel
            title="Carte du moment"
            action={<Button to="/admin/carte" size="sm" variant="ghost">Plein écran <ArrowRight size={15} /></Button>}
            bodyClassName="relative isolate"
          >
            <MapView pins={pins} className="h-[320px] sm:h-[380px]" />
            <MapLegend className="absolute top-3 left-3 z-[500]" />
          </Panel>
        </Reveal>
        <Reveal delay={0.06}>
          <Panel
            title="Pluie sur 7 jours"
            action={<span className="text-xs text-muted">{live.weather.source}</span>}
            className="h-full"
          >
            <BarChart
              height={230}
              data={live.weather.days.map((day) => ({ key: day.date, label: day.label, value: day.precipitationMm, muted: day.forecast }))}
            />
            <p className="mt-3 flex items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--cyan)' }} /> Mesuré</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border" style={{ borderColor: 'var(--cyan)' }} /> Prévision</span>
            </p>
          </Panel>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal>
          <Panel title="Statut des signalements" className="h-full">
            <Donut segments={statuses} label="signalements" />
          </Panel>
        </Reveal>
        <Reveal delay={0.05}>
          <Panel title="Bassins à surveiller" action={<Button to="/admin/points-noirs" size="sm" variant="ghost">Tous <ArrowRight size={15} /></Button>} className="h-full">
            <ul className="flex flex-col gap-4">
              {live.basins.slice().sort((a, b) => b.obstructionPct - a.obstructionPct).slice(0, 4).map((basin) => (
                <li key={basin.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-semibold">{basin.name}</span>
                    <span className="t-num shrink-0 text-muted">{basin.obstructionPct} %</span>
                  </div>
                  <Meter value={basin.obstructionPct} tone={basinTone(basin.status)} label={`${basin.name} : obstruction`} />
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>
        <Reveal delay={0.1}>
          <Panel title="Équipes terrain" action={<Button to="/admin/equipes" size="sm" variant="ghost">Détail <ArrowRight size={15} /></Button>} className="h-full">
            {!teams.data ? <Skeleton className="h-32" /> : teams.data.length === 0 ? (
              <EmptyState icon={<Users size={20} />} title="Aucune équipe" text="Les équipes apparaîtront ici." />
            ) : (
              <div className="flex flex-col gap-4">{teams.data.map((team) => <TeamRow key={team.id} team={team} />)}</div>
            )}
          </Panel>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <Panel title="Fil des opérations" action={<Button to="/admin/historique" size="sm" variant="ghost">Historique <ArrowRight size={15} /></Button>} className="h-full">
            {!timeline.data ? <Skeleton className="h-40" /> : <TimelineList items={timeline.data.slice(0, 5)} compact />}
          </Panel>
        </Reveal>
        <Reveal delay={0.06}>
          <Panel title={`À vérifier (${pending.length})`} action={<Button to="/admin/signalements" size="sm" variant="ghost">Modérer <ArrowRight size={15} /></Button>} className="h-full" bodyClassName="p-2">
            {pending.length === 0 ? (
              <EmptyState icon={<ShieldAlert size={20} />} title="File vide" text="Aucun signalement en attente." />
            ) : (
              <ul className="flex flex-col">
                {pending.slice(0, 5).map((report) => (
                  <li key={report.id} className="flex min-h-14 items-center gap-3 rounded-xl px-3 py-2">
                    <span className="map-pin shrink-0" data-tone={waterTone(report.waterLevel)} style={{ animation: 'none' }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{report.placeLabel}</p>
                      <p className="truncate text-xs text-muted"><span className="t-num">{report.reference}</span> · {ago(report.createdAt)}</p>
                    </div>
                    <span className="badge shrink-0" data-tone={waterTone(report.waterLevel)}>{report.waterLevelLabel}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </Reveal>
      </div>
    </AdminPage>
  );
}
