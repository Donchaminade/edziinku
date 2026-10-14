import { AlertTriangle, CheckCheck, Clock, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { PageHero } from '../../components/Hero';
import { AdminPage } from '../../components/layout/AdminLayout';
import { useDocumentTitle } from '../../components/layout/common';
import { EmptyState } from '../../components/ui/Decor';
import { Segmented } from '../../components/ui/Form';
import { Skeleton, Stagger, StaggerItem } from '../../components/ui/motion';
import { demoOutbox } from '../../data/demo';
import { photos } from '../../data/photos';
import { ago, maskPhone, outboxStatus } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import type { Outbound } from '../../types';
import { Kpi, SourceBadge } from './shared';

export function OutboxPage() {
  useDocumentTitle('Messages WhatsApp');
  const outbox = useApi<Outbound[]>('/api/admin/whatsapp/outbox', demoOutbox);
  const [filter, setFilter] = useState('ALL');
  const rows = outbox.data;
  const by = (status: string) => rows?.filter((row) => row.status === status).length ?? 0;
  const visible = (rows ?? []).filter((row) => filter === 'ALL' || row.status === filter);

  return (
    <AdminPage>
      <PageHero
        photo={photos.telephone}
        size="sm"
        eyebrow={<span className="inline-flex items-center gap-2">WhatsApp <SourceBadge source={outbox.source} /></span>}
        title="Messages sortants"
        short="La file d’envoi WhatsApp."
        long="Chaque message préparé pour WhatsApp. Sans jeton Cloud API configuré, les envois restent en échec et sont conservés ici."
      />
      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi accent label="Messages" value={rows?.length ?? 0} hint="dans la file" icon={MessageCircle} />
        <Kpi label="Envoyés" value={by('SENT')} hint="remis à WhatsApp" icon={CheckCheck} tone="ok" />
        <Kpi label="En attente" value={by('QUEUED')} hint="à envoyer" icon={Clock} tone="warn" />
        <Kpi label="Échecs" value={by('FAILED')} hint="à vérifier" icon={AlertTriangle} tone="alert" />
      </Stagger>
      <div className="scroll-x -mx-1 px-1">
        <Segmented
          label="Filtrer par statut d’envoi"
          value={filter}
          onChange={setFilter}
          className="min-w-max"
          options={[
            { value: 'ALL', label: 'Tous', count: rows?.length ?? 0 },
            { value: 'QUEUED', label: 'En attente', count: by('QUEUED') },
            { value: 'SENT', label: 'Envoyés', count: by('SENT') },
            { value: 'FAILED', label: 'Échecs', count: by('FAILED') },
          ]}
        />
      </div>
      {!rows ? <Skeleton className="h-40" /> : visible.length === 0 ? (
        <EmptyState icon={<MessageCircle size={20} />} title="Aucun message" text="La file WhatsApp est vide pour ce filtre." />
      ) : (
        <Stagger className="grid gap-3 lg:grid-cols-2">
          {visible.map((row) => {
            const status = outboxStatus(row.status);
            return (
              <StaggerItem key={row.id} as="article" className="card p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="icon-tile icon-tile-sm" data-tone="whatsapp"><MessageCircle size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="t-num truncate text-sm font-semibold">{maskPhone(row.recipient)}</p>
                    <p className="text-xs text-muted">{ago(row.createdAt)}</p>
                  </div>
                  <span className="badge badge-dot shrink-0" data-tone={status.tone === 'info' ? 'neutral' : status.tone}>{status.label}</span>
                </div>
                <div className="wa-bubble wa-out mt-3 max-w-none text-sm whitespace-pre-wrap">{row.body}</div>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </AdminPage>
  );
}
