import { MapPin, Navigation, UserCheck, Users } from 'lucide-react';
import { PageHero } from '../../components/Hero';
import { AdminPage } from '../../components/layout/AdminLayout';
import { useDocumentTitle } from '../../components/layout/common';
import { EmptyState } from '../../components/ui/Decor';
import { LiveDot, Skeleton, Stagger, StaggerItem } from '../../components/ui/motion';
import { demoTeams } from '../../data/demo';
import { photos } from '../../data/photos';
import { teamStatus } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import type { Team } from '../../types';
import { Kpi, SourceBadge } from './shared';

export function TeamsPage() {
  useDocumentTitle('Équipes terrain');
  const teams = useApi<Team[]>('/api/admin/teams', demoTeams);
  const list = teams.data;
  const by = (status: string) => list?.filter((team) => team.status === status).length ?? 0;

  return (
    <AdminPage>
      <PageHero
        photo={photos.entraide}
        size="sm"
        eyebrow={<span className="inline-flex items-center gap-2">Terrain <SourceBadge source={teams.source} /></span>}
        title="Équipes terrain"
        short="Qui est où, et sur quelle mission."
        long="Les équipes de la mairie et de la protection civile, leur zone et leur mission du moment."
      />
      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi accent label="Équipes" value={list?.length ?? 0} hint="mobilisables" icon={Users} />
        <Kpi label="Sur place" value={by('SUR_PLACE')} hint="en intervention" icon={MapPin} tone="ok" />
        <Kpi label="En route" value={by('EN_ROUTE')} hint="vers une zone" icon={Navigation} tone="warn" />
        <Kpi label="Disponibles" value={by('DISPONIBLE')} hint="prêtes à partir" icon={UserCheck} tone="water" />
      </Stagger>
      {!list ? <Skeleton className="h-40" /> : list.length === 0 ? (
        <EmptyState icon={<Users size={20} />} title="Aucune équipe" text="Les équipes de terrain apparaîtront ici." />
      ) : (
        <Stagger className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((team) => {
            const status = teamStatus(team.status);
            const tone = status.tone === 'info' ? undefined : status.tone;
            return (
              <StaggerItem key={team.id} as="article" className="card card-hover flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3">
                  <span className="icon-tile" data-tone={tone}><Users size={20} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[17px] font-semibold">{team.name}</p>
                    <p className="truncate text-sm text-muted">{team.zone ?? 'Sans zone'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-line px-3 py-2.5">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <LiveDot tone={status.tone} /> {status.label}
                  </span>
                  <span className="truncate text-xs text-muted">{team.assignment ?? 'Aucune mission'}</span>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </AdminPage>
  );
}
