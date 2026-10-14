import { AnimatePresence, motion } from 'motion/react';
import { Bell, CloudRain, Languages, MapPin, Megaphone, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { PageHero } from '../../components/Hero';
import { AdminPage } from '../../components/layout/AdminLayout';
import { LogoMark, useDocumentTitle } from '../../components/layout/common';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Decor';
import { Field, Segmented, Select, TextArea, TextInput } from '../../components/ui/Form';
import { Reveal, Stagger, StaggerItem, ease } from '../../components/ui/motion';
import { useToast } from '../../components/ui/Overlay';
import { photos } from '../../data/photos';
import { api, ApiError } from '../../lib/api';
import { ago, alertLevelLabel, alertTone } from '../../lib/format';
import { useLive } from '../../lib/useCatalog';
import type { AlertItem } from '../../types';
import { Panel, SourceBadge } from './shared';

type Level = 'INFO' | 'VIGILANCE' | 'ELEVE' | 'CRITIQUE';

export function AlertsPage() {
  useDocumentTitle('Alertes');
  const live = useLive();
  const toast = useToast();
  const [title, setTitle] = useState('Forte pluie prévue ce soir');
  const [body, setBody] = useState('De fortes pluies sont prévues. Surélevez vos biens, évitez les caniveaux et ne traversez pas l’eau qui coule.');
  const [bodyEwe, setBodyEwe] = useState('');
  const [level, setLevel] = useState<Level>('ELEVE');
  const [hood, setHood] = useState('');
  const [preview, setPreview] = useState<'fr' | 'ewe'>('fr');
  const [sending, setSending] = useState(false);
  const [broadcasting, setBroadcasting] = useState<string | null>(null);

  const place = live.neighborhoods.find((item) => item.id === hood)?.name ?? 'Grand Lomé';

  async function publish(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    try {
      const created = await api<AlertItem>('/api/admin/alerts', {
        method: 'POST',
        body: JSON.stringify({ title, body, bodyEwe: bodyEwe || null, level, kind: 'RAIN', neighborhoodId: hood || null, source: 'Mairie' }),
      });
      toast(`Alerte publiée : ${created.title}`, 'ok');
      live.reload();
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Publication impossible : l’API ne répond pas', 'alert');
    } finally {
      setSending(false);
    }
  }

  async function broadcast(alert: AlertItem) {
    setBroadcasting(alert.id);
    try {
      await api(`/api/admin/alerts/${alert.id}/broadcast`, { method: 'POST' });
      toast('Diffusion WhatsApp préparée', 'ok');
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Diffusion impossible : l’API ne répond pas', 'alert');
    } finally {
      setBroadcasting(null);
    }
  }

  return (
    <AdminPage>
      <PageHero
        photo={photos.nairobi}
        size="sm"
        eyebrow={<span className="inline-flex items-center gap-2">Diffusion <SourceBadge source={live.source} /></span>}
        title="Alertes"
        short="Prévenir avant la pluie."
        long="Publiez une alerte avant la pluie : elle part sur l’application et WhatsApp. Le français fait foi, l’éwé est relu par un locuteur natif."
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Reveal>
          <Panel title={<span className="inline-flex items-center gap-2"><Megaphone size={18} className="text-cyan" /> Nouvelle alerte</span>}>
            <form className="flex flex-col gap-4" onSubmit={publish}>
              <Field label="Niveau">
                <div className="scroll-x -mx-1 px-1">
                  <Segmented
                    label="Niveau de l’alerte"
                    value={level}
                    onChange={setLevel}
                    className="min-w-max"
                    options={(['INFO', 'VIGILANCE', 'ELEVE', 'CRITIQUE'] as Level[]).map((value) => ({ value, label: alertLevelLabel(value) }))}
                  />
                </div>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Titre" htmlFor="alert-title">
                  <TextInput id="alert-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
                </Field>
                <Field label="Zone">
                  <Select
                    label="Quartier ciblé"
                    value={hood}
                    onChange={setHood}
                    icon={<MapPin size={16} className="text-muted" />}
                    options={[{ value: '', label: 'Tout le Grand Lomé' }, ...live.neighborhoods.map((item) => ({ value: item.id, label: item.name, hint: item.commune }))]}
                  />
                </Field>
              </div>
              <Field label="Message en français" hint={`${body.length} / 4000`} htmlFor="alert-body">
                <TextArea id="alert-body" rows={4} value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} required />
              </Field>
              <Field label="Message en éwé" hint="Facultatif. Sera marqué « à relire » tant qu’un locuteur natif ne l’a pas validé." htmlFor="alert-ewe">
                <TextArea id="alert-ewe" rows={3} value={bodyEwe} onChange={(event) => setBodyEwe(event.target.value)} maxLength={4000} placeholder="Traduction relue par un locuteur natif" />
              </Field>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted">Envoi : application, puis WhatsApp aux abonnés de la zone.</p>
                <Button type="submit" variant="primary" loading={sending}><Send size={16} /> Publier l’alerte</Button>
              </div>
            </form>
          </Panel>
        </Reveal>

        <Reveal delay={0.06}>
          <Panel
            title="Aperçu"
            action={<Segmented label="Langue de l’aperçu" value={preview} onChange={setPreview} options={[{ value: 'fr', label: 'FR' }, { value: 'ewe', label: 'Éwé' }]} />}
            className="h-full"
          >
            <div className="mx-auto flex max-w-sm flex-col gap-3">
              <AnimatePresence mode="wait">
                <motion.article
                  key={`${preview}-${level}`}
                  className="glass-strong rounded-[22px] p-4"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl text-cyan" style={{ background: 'var(--accent-soft)' }}><LogoMark size={20} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">Edzii-Nku · {place}</p>
                      <p className="text-[11px] text-muted">maintenant</p>
                    </div>
                    <span className="badge badge-dot" data-tone={alertTone(level)}>{alertLevelLabel(level)}</span>
                  </div>
                  <p className="mt-3 font-display text-[17px] font-semibold">{title || 'Titre de l’alerte'}</p>
                  {preview === 'fr' ? (
                    <p className="mt-1 text-sm whitespace-pre-wrap text-text2">{body || 'Votre message apparaîtra ici.'}</p>
                  ) : bodyEwe ? (
                    <>
                      <p className="mt-1 text-sm whitespace-pre-wrap text-text2">{bodyEwe}</p>
                      <p className="note mt-3" data-tone="info"><Languages size={15} /> Éwé à relire par un locuteur natif.</p>
                    </>
                  ) : (
                    <p className="note mt-3" data-tone="info"><Languages size={15} /> Pas de version éwé : seul le français sera envoyé.</p>
                  )}
                </motion.article>
              </AnimatePresence>
              <div className="flex flex-wrap gap-2 text-xs text-muted">
                <span className="pill"><Bell size={13} /> Application</span>
                <span className="pill"><CloudRain size={13} /> {place}</span>
              </div>
            </div>
          </Panel>
        </Reveal>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="t-h3">Alertes publiées</h2>
        {live.alerts.length === 0 ? (
          <EmptyState icon={<Bell size={20} />} title="Aucune alerte" text="Les alertes publiées apparaîtront ici." />
        ) : (
          <Stagger className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {live.alerts.map((alert) => (
              <StaggerItem key={alert.id} as="article" className="card card-hover flex flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="badge badge-dot" data-tone={alertTone(alert.level)}>{alertLevelLabel(alert.level)}</span>
                  <span className="text-xs text-muted">{ago(alert.createdAt)}</span>
                </div>
                <p className="mt-3 font-display text-[17px] font-semibold">{alert.title}</p>
                <p className="mt-1 text-xs text-muted">{alert.neighborhoodName ?? 'Grand Lomé'}{alert.source ? ` · ${alert.source}` : ''}</p>
                <p className="clamp-3 mt-2 flex-1 text-sm text-text2">{alert.body}</p>
                {alert.eweNeedsReview && <p className="note mt-3" data-tone="info"><Languages size={15} /> Éwé à relire</p>}
                <div className="mt-4">
                  <Button size="sm" variant="whatsapp" loading={broadcasting === alert.id} onClick={() => { void broadcast(alert); }}>
                    <Send size={15} /> Rediffuser sur WhatsApp
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </AdminPage>
  );
}
