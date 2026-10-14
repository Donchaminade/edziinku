import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy as CopyIcon, Download, Filter, Search, ShieldAlert, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHero } from '../../components/Hero';
import { AdminPage } from '../../components/layout/AdminLayout';
import { useDocumentTitle } from '../../components/layout/common';
import { ReportSummary } from '../../components/ReportDetail';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Decor';
import { Segmented, Select, TextInput } from '../../components/ui/Form';
import { Reveal, Skeleton, ease } from '../../components/ui/motion';
import { Modal, Sheet, useToast } from '../../components/ui/Overlay';
import { demoReports } from '../../data/demo';
import { photos } from '../../data/photos';
import { api, apiBase, ApiError, sessionToken } from '../../lib/api';
import { ago, channelLabel, statusTone, waterTone } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import { useLive } from '../../lib/useCatalog';
import type { Page, ReportItem, ReportStatus } from '../../types';
import { SourceBadge } from './shared';

type StatusFilter = 'ALL' | ReportStatus;

const statusLabels: Record<ReportStatus, string> = {
  A_VERIFIER: 'À vérifier',
  VALIDE: 'Validé',
  REJETE: 'Rejeté',
  DOUBLON: 'Doublon',
};

export function ModerationPage() {
  useDocumentTitle('Signalements');
  const live = useLive();
  const toast = useToast();
  const [status, setStatus] = useState<StatusFilter>('A_VERIFIER');
  const [level, setLevel] = useState('');
  const [query, setQuery] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const all = useApi<Page<ReportItem>>('/api/admin/reports?size=200', () => ({ items: demoReports, page: 0, size: 200, total: demoReports.length }));
  const rows = all.data?.items ?? null;

  const visible = useMemo(() => (rows ?? []).filter((row) => {
    if (status !== 'ALL' && row.status !== status) return false;
    if (level && row.waterLevel !== level) return false;
    if (!query) return true;
    return `${row.reference} ${row.placeLabel} ${row.neighborhoodName ?? ''} ${row.comment ?? ''}`.toLowerCase().includes(query.toLowerCase());
  }), [rows, status, level, query]);

  const count = (value: ReportStatus) => rows?.filter((row) => row.status === value).length ?? 0;
  const current = rows?.find((row) => row.id === currentId) ?? null;

  function replace(updated: ReportItem) {
    all.setData((page) => page ? { ...page, items: page.items.map((item) => item.id === updated.id ? updated : item) } : page);
  }

  async function moderate(report: ReportItem, next: ReportStatus) {
    setBusy(`${report.id}:${next}`);
    try {
      if (all.source === 'demo') {
        replace({ ...report, status: next, statusLabel: statusLabels[next] });
        toast(`${report.reference} : ${statusLabels[next].toLowerCase()} (démo, non enregistré)`, 'info');
      } else {
        const updated = await api<ReportItem>(`/api/admin/reports/${report.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
        replace(updated);
        toast(`${updated.reference} : ${updated.statusLabel.toLowerCase()}`, next === 'VALIDE' ? 'ok' : 'info');
        live.reload();
      }
      setRejecting(false);
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Modération impossible', 'alert');
    } finally {
      setBusy(null);
    }
  }

  async function download() {
    try {
      const token = sessionToken();
      const response = await fetch(`${apiBase}/api/admin/reports/export${status !== 'ALL' ? `?status=${status}` : ''}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error();
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = 'signalements-edzii-nku.csv';
      link.click();
      URL.revokeObjectURL(url);
      toast('Export CSV téléchargé', 'ok');
    } catch {
      toast('Export impossible : l’API ne répond pas', 'alert');
    }
  }

  return (
    <AdminPage>
      <PageHero
        photo={photos.inondee}
        size="sm"
        eyebrow={<span className="inline-flex items-center gap-2">Modération <SourceBadge source={all.source} /></span>}
        title="Signalements"
        short="Vérifier, valider ou écarter."
        long="Chaque signalement validé apparaît sur la carte publique. L’export CSV reprend le statut filtré."
      >
        <Button onClick={() => { void download(); }}><Download size={17} /> Exporter CSV</Button>
      </PageHero>

      <Reveal className="card overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:p-4">
          <div className="scroll-x -mx-1 px-1">
            <Segmented
              label="Filtrer par statut"
              value={status}
              onChange={setStatus}
              className="min-w-max"
              options={[
                { value: 'A_VERIFIER', label: 'À vérifier', count: count('A_VERIFIER') },
                { value: 'VALIDE', label: 'Validés', count: count('VALIDE') },
                { value: 'REJETE', label: 'Rejetés', count: count('REJETE') },
                { value: 'DOUBLON', label: 'Doublons', count: count('DOUBLON') },
                { value: 'ALL', label: 'Tous', count: rows?.length ?? 0 },
              ]}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_220px]">
            <TextInput icon={<Search size={17} />} placeholder="Référence, lieu, commentaire…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Rechercher un signalement" />
            <Select
              label="Niveau d’eau"
              value={level}
              onChange={setLevel}
              icon={<Filter size={16} className="text-muted" />}
              options={[
                { value: '', label: 'Tous les niveaux' },
                { value: 'CHEVILLE', label: 'Cheville' },
                { value: 'GENOU', label: 'Genou' },
                { value: 'TAILLE', label: 'Taille' },
              ]}
            />
          </div>
        </div>

        {!rows ? (
          <div className="flex flex-col gap-2 p-4">{[0, 1, 2].map((key) => <Skeleton key={key} className="h-14" />)}</div>
        ) : visible.length === 0 ? (
          <div className="p-4"><EmptyState icon={<ShieldAlert size={20} />} title="Rien dans cette file" text="Aucun signalement ne correspond à ces filtres." /></div>
        ) : (
          <>
            <div className="scroll-thin hidden max-h-[640px] overflow-auto md:block">
              <table className="table">
                <thead>
                  <tr>
                    <th>Réf.</th>
                    <th>Lieu</th>
                    <th>Niveau</th>
                    <th>Statut</th>
                    <th>Reçu</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {visible.map((row) => (
                      <motion.tr
                        key={row.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease }}
                        data-selected={row.id === currentId}
                        onClick={() => setCurrentId(row.id)}
                      >
                        <td className="t-num font-semibold">{row.reference}</td>
                        <td>
                          <p className="max-w-[280px] truncate font-semibold">{row.placeLabel}</p>
                          <p className="max-w-[280px] truncate text-xs text-muted">{row.neighborhoodName ?? 'Lomé'} · {channelLabel(row.channel)}</p>
                        </td>
                        <td><span className="badge" data-tone={waterTone(row.waterLevel)}>{row.waterLevelLabel}</span></td>
                        <td><span className="badge badge-dot" data-tone={statusTone(row.status)}>{row.statusLabel}</span></td>
                        <td className="whitespace-nowrap text-muted">{ago(row.createdAt)}</td>
                        <td>
                          <div className="flex justify-end gap-1.5" onClick={(event) => event.stopPropagation()}>
                            <Button size="sm" variant="ok" disabled={row.status === 'VALIDE'} loading={busy === `${row.id}:VALIDE`} onClick={() => { void moderate(row, 'VALIDE'); }} aria-label={`Valider ${row.reference}`}>
                              <Check size={15} /> Valider
                            </Button>
                            <Button size="sm" variant="ghost" icon disabled={row.status === 'REJETE'} onClick={() => { setCurrentId(row.id); setRejecting(true); }} aria-label={`Rejeter ${row.reference}`} title="Rejeter">
                              <X size={16} />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <ul className="flex flex-col gap-2 p-3 md:hidden">
              <AnimatePresence initial={false}>
                {visible.map((row) => (
                  <motion.li key={row.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3, ease }}>
                    <div className="rounded-2xl border border-line p-3">
                      <button type="button" className="flex w-full items-start gap-3 text-left" onClick={() => setCurrentId(row.id)}>
                        <span className="map-pin mt-1 shrink-0" data-tone={waterTone(row.waterLevel)} style={{ animation: 'none' }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{row.placeLabel}</span>
                          <span className="block truncate text-xs text-muted"><span className="t-num">{row.reference}</span> · {ago(row.createdAt)}</span>
                        </span>
                        <span className="badge badge-dot shrink-0" data-tone={statusTone(row.status)}>{row.statusLabel}</span>
                      </button>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button size="sm" variant="ok" block disabled={row.status === 'VALIDE'} loading={busy === `${row.id}:VALIDE`} onClick={() => { void moderate(row, 'VALIDE'); }}>
                          <Check size={15} /> Valider
                        </Button>
                        <Button size="sm" block disabled={row.status === 'REJETE'} onClick={() => { setCurrentId(row.id); setRejecting(true); }}>
                          <X size={15} /> Rejeter
                        </Button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}
      </Reveal>

      <Sheet
        open={Boolean(current) && !rejecting}
        onClose={() => setCurrentId(null)}
        title={current?.reference ?? ''}
        subtitle={current ? `${current.statusLabel} · reçu ${ago(current.createdAt)}` : undefined}
        footer={current && (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="ok" block disabled={current.status === 'VALIDE'} loading={busy === `${current.id}:VALIDE`} onClick={() => { void moderate(current, 'VALIDE'); }}><Check size={16} /> Valider</Button>
            <Button block disabled={current.status === 'DOUBLON'} loading={busy === `${current.id}:DOUBLON`} onClick={() => { void moderate(current, 'DOUBLON'); }}><CopyIcon size={16} /> Doublon</Button>
            <Button variant="danger" block disabled={current.status === 'REJETE'} onClick={() => setRejecting(true)}><X size={16} /> Rejeter</Button>
          </div>
        )}
      >
        {current && <ReportSummary report={current} />}
      </Sheet>

      <Modal
        open={rejecting && Boolean(current)}
        title={`Rejeter ${current?.reference ?? ''}`}
        description="Le signalement sort de la carte publique. L’habitant n’est pas notifié."
        onClose={() => setRejecting(false)}
      >
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setRejecting(false)} block>Annuler</Button>
          <Button variant="danger" block loading={busy === `${current?.id}:REJETE`} onClick={() => { if (current) void moderate(current, 'REJETE'); }}>Rejeter</Button>
        </div>
      </Modal>
    </AdminPage>
  );
}
