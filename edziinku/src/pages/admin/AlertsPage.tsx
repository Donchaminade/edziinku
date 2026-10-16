import { AnimatePresence, motion } from 'motion/react';
import { Bell, CloudRain, Languages, MapPin, Megaphone, Send, ShieldOff } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { PageHero } from '../../components/Hero';
import { AdminPage } from '../../components/layout/AdminLayout';
import { LogoMark, useDocumentTitle } from '../../components/layout/common';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Decor';
import { Field, ScrollRow, Segmented, Select, TextArea, TextInput } from '../../components/ui/Form';
import { Reveal, Stagger, StaggerItem, ease } from '../../components/ui/motion';
import { useToast } from '../../components/ui/Overlay';
import { photos } from '../../data/photos';
import { api, ApiError } from '../../lib/api';
import { ago, alertKindLabel, alertLevelLabel, alertTone } from '../../lib/format';
import { NEIGHBOR_RADIUS_KM } from '../../lib/localRisk';
import { useApi } from '../../lib/useApi';
import { useLive } from '../../lib/useCatalog';
import type { AlertItem, City } from '../../types';
import { Panel, SourceBadge } from './shared';

type Level = 'INFO' | 'VIGILANCE' | 'ELEVE' | 'CRITIQUE';
type WeatherKind = 'ORAGE' | 'FORTE_PLUIE' | 'VIGILANCE_INONDATION' | 'CALME';
type Target = 'lome' | 'city' | 'hood';

const weatherPresets: Record<WeatherKind, { title: string; body: string; level: Level }> = {
  ORAGE: {
    title: 'Orage annoncé',
    body: 'Un orage approche. Restez à l’abri, débranchez les appareils, évitez les toits et les arbres.',
    level: 'ELEVE',
  },
  FORTE_PLUIE: {
    title: 'Forte pluie prévue',
    body: 'De fortes pluies sont prévues. Surélevez vos biens, évitez les caniveaux et ne traversez pas l’eau qui coule.',
    level: 'ELEVE',
  },
  VIGILANCE_INONDATION: {
    title: 'Vigilance inondation',
    body: 'Le secteur est exposé. Surélevez vos biens, préparez un itinéraire sec, suivez les consignes de la mairie.',
    level: 'CRITIQUE',
  },
  CALME: {
    title: 'Retour au calme',
    body: 'Plus de signe météo immédiat dans le secteur. Restez attentifs aux caniveaux.',
    level: 'INFO',
  },
};

export function AlertsPage() {
  useDocumentTitle('Alertes');
  const live = useLive();
  const toast = useToast();
  const [title, setTitle] = useState(weatherPresets.FORTE_PLUIE.title);
  const [body, setBody] = useState(weatherPresets.FORTE_PLUIE.body);
  const [bodyEwe, setBodyEwe] = useState('');
  const [level, setLevel] = useState<Level>('ELEVE');
  const [kind, setKind] = useState<WeatherKind>('FORTE_PLUIE');
  const [target, setTarget] = useState<Target>('hood');
  const [hood, setHood] = useState('');
  const [city, setCity] = useState('');
  const [preview, setPreview] = useState<'fr' | 'ewe'>('fr');
  const [sending, setSending] = useState(false);
  const [broadcasting, setBroadcasting] = useState<string | null>(null);
  const [ending, setEnding] = useState<string | null>(null);
  const cities = useApi<City[]>('/api/cities', []);

  const place = useMemo(() => {
    if (target === 'hood') return live.neighborhoods.find((item) => item.id === hood)?.name ?? 'Un quartier';
    if (target === 'city') return cities.data?.find((item) => item.id === city)?.name ?? 'Une ville';
    return 'Grand Lomé';
  }, [target, hood, city, live.neighborhoods, cities.data]);

  async function publish(event: FormEvent) {
    event.preventDefault();
    if (target === 'hood' && !hood) {
      toast('Choisissez le quartier à signaler.', 'alert');
      return;
    }
    if (target === 'city' && !city) {
      toast('Choisissez la ville à signaler.', 'alert');
      return;
    }
    setSending(true);
    try {
      const created = await api<AlertItem>('/api/admin/alerts', {
        method: 'POST',
        body: JSON.stringify({
          title,
          body,
          bodyEwe: bodyEwe || null,
          level,
          kind,
          neighborhoodId: target === 'hood' && hood ? hood : null,
          cityId: target === 'city' && city ? city : null,
          source: 'Mairie',
        }),
      });
      toast(`Alerte publiée : ${created.title}`, 'ok');
      live.reload();
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Publication impossible : l’API ne répond pas', 'alert');
    } finally {
      setSending(false);
    }
  }

  async function endAlert(alert: AlertItem) {
    setEnding(alert.id);
    try {
      await api(`/api/admin/alerts/${alert.id}/end`, { method: 'POST' });
      toast('Signe météo levé', 'ok');
      live.reload();
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Impossible de lever le signe', 'alert');
    } finally {
      setEnding(null);
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
              <Field label="Signe météo">
                <ScrollRow>
                  <Segmented
                    label="Type de signe météo"
                    value={kind}
                    onChange={(value) => {
                      const next = value as WeatherKind;
                      setKind(next);
                      const preset = weatherPresets[next];
                      setTitle(preset.title);
                      setBody(preset.body);
                      setLevel(preset.level);
                    }}
                    className="min-w-max"
                    options={(['ORAGE', 'FORTE_PLUIE', 'VIGILANCE_INONDATION', 'CALME'] as WeatherKind[]).map((value) => ({
                      value,
                      label: alertKindLabel(value),
                    }))}
                  />
                </ScrollRow>
              </Field>
              <Field label="Niveau">
                <ScrollRow>
                  <Segmented
                    label="Niveau de l’alerte"
                    value={level}
                    onChange={setLevel}
                    className="min-w-max"
                    options={(['INFO', 'VIGILANCE', 'ELEVE', 'CRITIQUE'] as Level[]).map((value) => ({ value, label: alertLevelLabel(value) }))}
                  />
                </ScrollRow>
              </Field>
              <Field label="Cible">
                <ScrollRow>
                  <Segmented
                    label="Cible du signe"
                    value={target}
                    onChange={setTarget}
                    className="min-w-max"
                    options={[
                      { value: 'hood', label: 'Quartier' },
                      { value: 'city', label: 'Ville' },
                      { value: 'lome', label: 'Grand Lomé' },
                    ]}
                  />
                </ScrollRow>
              </Field>
              <p className="text-xs text-muted">
                Un quartier alerte le secteur et les voisinages dans un rayon de {NEIGHBOR_RADIUS_KM} km (centroïdes).
                Une ville alerte tous ses quartiers, plus les limitrophes dans ce rayon. Ex. Bè-Kpota → Bè, Bè-Ahligo, Bè-Klikamé.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Titre" htmlFor="alert-title">
                  <TextInput id="alert-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
                </Field>
                {target === 'hood' && (
                  <Field label="Quartier">
                    <Select
                      label="Quartier ciblé"
                      value={hood}
                      onChange={setHood}
                      icon={<MapPin size={16} className="text-muted" />}
                      options={[{ value: '', label: 'Choisir un quartier' }, ...live.neighborhoods.map((item) => ({ value: item.id, label: item.name, hint: item.commune }))]}
                    />
                  </Field>
                )}
                {target === 'city' && (
                  <Field label="Ville">
                    <Select
                      label="Ville ciblée"
                      value={city}
                      onChange={setCity}
                      icon={<MapPin size={16} className="text-muted" />}
                      options={[{ value: '', label: 'Choisir une ville' }, ...(cities.data ?? []).map((item) => ({ value: item.id, label: item.name, hint: item.region ?? undefined }))]}
                    />
                  </Field>
                )}
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
                  className="overlay-panel rounded-[22px] p-4"
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
                <p className="mt-1 text-xs text-muted">
                  {alertKindLabel(alert.kind)} · {alert.neighborhoodName ?? alert.cityName ?? 'Grand Lomé'}
                  {alert.source ? ` · ${alert.source}` : ''}
                  {alert.endsAt && new Date(alert.endsAt).getTime() <= Date.now() ? ' · levée' : ''}
                </p>
                <p className="clamp-3 mt-2 flex-1 text-sm text-text2">{alert.body}</p>
                {alert.eweNeedsReview && <p className="note mt-3" data-tone="info"><Languages size={15} /> Éwé à relire</p>}
                <div className="mt-4 flex flex-col gap-2">
                  {(!alert.endsAt || new Date(alert.endsAt).getTime() > Date.now()) && (
                    <Button size="sm" loading={ending === alert.id} onClick={() => { void endAlert(alert); }}>
                      <ShieldOff size={15} /> Lever le signe
                    </Button>
                  )}
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
