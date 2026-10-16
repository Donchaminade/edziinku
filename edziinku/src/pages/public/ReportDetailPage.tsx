import { ArrowLeft, MapPinned } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { MapView } from '../../components/MapView';
import { ReportSummary } from '../../components/ReportDetail';
import { useDocumentTitle } from '../../components/layout/common';
import { PublicPage } from '../../components/layout/PublicLayout';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Decor';
import { Skeleton } from '../../components/ui/motion';
import { ApiError, api } from '../../lib/api';
import { mapFocusPath, waterTone } from '../../lib/format';
import type { ReportItem } from '../../types';

export function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState<ReportItem | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing' | 'error'>('loading');

  useDocumentTitle(report ? report.placeLabel : 'Signalement');

  useEffect(() => {
    if (!id) {
      setStatus('missing');
      setReport(null);
      return;
    }
    let cancel = false;
    setStatus('loading');
    setReport(null);
    api<ReportItem>(`/api/reports/${id}`)
      .then((value) => {
        if (cancel) return;
        setReport(value);
        setStatus('ok');
      })
      .catch((error: unknown) => {
        if (cancel) return;
        setReport(null);
        setStatus(error instanceof ApiError && error.status === 404 ? 'missing' : 'error');
      });
    return () => { cancel = true; };
  }, [id]);

  return (
    <PublicPage>
      <div className="flex flex-col gap-5 md:gap-6">
        <Link to="/" className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-text2">
          <ArrowLeft size={16} /> Retour
        </Link>

        {status === 'loading' && (
          <div className="card-solid flex flex-col gap-4 p-4 md:p-6">
            <Skeleton className="aspect-[16/10] w-full" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24" />
          </div>
        )}

        {(status === 'missing' || status === 'error') && (
          <EmptyState
            title={status === 'missing' ? 'Signalement introuvable' : 'Signalement indisponible'}
            text={status === 'missing'
              ? 'Ce signalement n’existe pas, ou n’est pas encore public.'
              : 'La liste n’a pas pu être chargée. Réessayez plus tard.'}
            action={<div className="flex flex-wrap justify-center gap-2"><Button to="/" variant="primary">Accueil</Button><Button to="/carte">Carte live</Button></div>}
          />
        )}

        {status === 'ok' && report && (
          <article className="card-solid flex flex-col gap-5 p-4 md:p-6">
            <header className="flex flex-col gap-1">
              <p className="t-num text-xs text-muted">{report.reference}</p>
              <h1 className="t-h2 text-[1.6rem]">{report.placeLabel}</h1>
              <p className="text-sm text-muted">
                {report.neighborhoodName ?? 'Quartier'}
                {report.commune ? ` · ${report.commune}` : ''}
              </p>
            </header>
            <ReportSummary report={report} withPhoto />
            <div className="overflow-hidden rounded-[22px] border border-line">
              <MapView
                className="h-56"
                pins={[{ id: report.id, lat: report.latitude, lng: report.longitude, label: report.placeLabel, tone: waterTone(report.waterLevel) }]}
                selectedId={report.id}
                fit={false}
                focus={{ lat: report.latitude, lng: report.longitude, zoom: 17 }}
              />
            </div>
            <Button
              to={mapFocusPath(report.latitude, report.longitude, 16, report.neighborhoodName ?? report.placeLabel)}
              variant="primary"
              block
            >
              <MapPinned size={17} /> Voir sur la carte
            </Button>
          </article>
        )}
      </div>
    </PublicPage>
  );
}
