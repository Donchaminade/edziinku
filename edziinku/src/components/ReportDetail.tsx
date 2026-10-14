import { Clock3, ImageOff, MapPin, Radio, Users } from 'lucide-react';
import { mediaUrl } from '../lib/api';
import { ago, channelLabel, statusTone, waterPhrase, waterTone } from '../lib/format';
import type { ReportItem } from '../types';

export function ReportPhoto({ report, className }: { report: ReportItem; className?: string }) {
  const url = mediaUrl(report.photoUrl);
  return (
    <div className={`photo-frame ${className ?? ''}`}>
      {url ? (
        <img src={url} alt={`Photo du signalement ${report.reference}`} className="h-full w-full" loading="lazy" />
      ) : (
        <div className="grid h-full w-full place-items-center text-muted">
          <span className="flex flex-col items-center gap-2 text-xs"><ImageOff size={22} /> Pas de photo</span>
        </div>
      )}
    </div>
  );
}

export function ReportMeta({ report }: { report: ReportItem }) {
  const items = [
    { icon: MapPin, label: report.neighborhoodName ? `${report.neighborhoodName}${report.commune ? ` · ${report.commune}` : ''}` : 'Quartier inconnu' },
    { icon: Radio, label: `Via ${channelLabel(report.channel)}` },
    { icon: Users, label: `${report.confirmations} confirmation${report.confirmations > 1 ? 's' : ''}` },
    { icon: Clock3, label: ago(report.createdAt) },
  ];
  return (
    <ul className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <li key={item.label} className="flex min-w-0 items-center gap-2 rounded-xl border border-line px-2.5 py-2 text-xs text-text2">
          <item.icon size={14} className="shrink-0 text-muted" />
          <span className="truncate">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReportSummary({ report, withPhoto = true }: { report: ReportItem; withPhoto?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      {withPhoto && <ReportPhoto report={report} className="aspect-[16/10]" />}
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge badge-dot" data-tone={waterTone(report.waterLevel)}>{waterPhrase(report.waterLevel)}</span>
        <span className="badge" data-tone={statusTone(report.status)}>{report.statusLabel}</span>
        {report.tags.map((tag) => <span key={tag} className="badge" data-tone="neutral">{tag}</span>)}
      </div>
      {report.comment && <p className="text-[15px] leading-relaxed text-text2">« {report.comment} »</p>}
      <ReportMeta report={report} />
    </div>
  );
}
