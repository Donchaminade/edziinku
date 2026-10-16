import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ImagePlus,
  LocateFixed,
  MapPin,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { PageHero } from '../../components/Hero';
import { useDocumentTitle } from '../../components/layout/common';
import { PublicPage } from '../../components/layout/PublicLayout';
import { MapView } from '../../components/MapView';
import { Button } from '../../components/ui/Button';
import { Field, Select, TextArea, TextInput } from '../../components/ui/Form';
import { useToast } from '../../components/ui/Overlay';
import { Reveal, ease } from '../../components/ui/motion';
import { photos } from '../../data/photos';
import { api, ApiError } from '../../lib/api';
import { waterPhrase, waterTone } from '../../lib/format';
import { GPS_ACCEPT_M, gpsAccuracyHint } from '../../lib/useLocalRisk';
import { looksLikeUnresolvedShortlink, parseMapLink } from '../../lib/parseMapLink';
import { useLive } from '../../lib/useCatalog';
import type { Neighborhood, ReportItem, WaterLevel } from '../../types';

const levels: { id: WaterLevel; label: string; hint: string; fill: number }[] = [
  { id: 'CHEVILLE', label: 'Cheville', hint: 'On passe encore', fill: 1 },
  { id: 'GENOU', label: 'Genou', hint: 'La rue se ferme', fill: 3 },
  { id: 'TAILLE', label: 'Taille', hint: 'Danger immédiat', fill: 5 },
];

const steps = ['Photo', 'Lieu', 'Niveau'];

export function ReportPage() {
  useDocumentTitle('Signaler l’eau');
  const live = useLive();
  const toast = useToast();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [place, setPlace] = useState('');
  const [hood, setHood] = useState('');
  const [lat, setLat] = useState(6.137);
  const [lng, setLng] = useState(1.212);
  const [located, setLocated] = useState(false);
  const [accuracyM, setAccuracyM] = useState<number | null>(null);
  const [link, setLink] = useState('');
  const [linkHint, setLinkHint] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [level, setLevel] = useState<WaterLevel>('GENOU');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<ReportItem | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photo) { setPreview(null); return; }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const hoodOptions = useMemo(() => [
    { value: '', label: 'Je ne sais pas' },
    ...live.neighborhoods.map((item) => ({ value: item.id, label: item.name, hint: item.commune })),
  ], [live.neighborhoods]);

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function pickFile(file: File | undefined | null) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast('Formats acceptés : JPEG, PNG ou WebP.', 'alert');
      return;
    }
    setPhoto(file);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDrag(false);
    pickFile(event.dataTransfer.files?.[0]);
  }

  async function resolveHood(nextLat: number, nextLng: number) {
    try {
      const found = await api<{ neighborhood: Neighborhood | null }>(
        `/api/geo/locate?lat=${nextLat}&lng=${nextLng}`,
      );
      if (found.neighborhood) setHood(found.neighborhood.id);
      return found.neighborhood;
    } catch {
      return null;
    }
  }

  function applyPoint(nextLat: number, nextLng: number, accuracy: number | null, source: string) {
    setLat(nextLat);
    setLng(nextLng);
    setAccuracyM(accuracy);
    setLocated(true);
    void resolveHood(nextLat, nextLng).then((neighborhood) => {
      toast(
        neighborhood ? `Quartier détecté : ${neighborhood.name}` : `${source} enregistrée, hors zone connue.`,
        neighborhood ? 'ok' : 'info',
      );
    });
  }

  async function applyLink(value: string) {
    setLink(value);
    const parsed = parseMapLink(value);
    if (parsed && located && Math.abs(parsed.latitude - lat) < 1e-5 && Math.abs(parsed.longitude - lng) < 1e-5) {
      setLinkHint(null);
      return;
    }
    if (parsed) {
      setLinkHint(null);
      applyPoint(parsed.latitude, parsed.longitude, null, 'Le lien');
      return;
    }
    if (!value.trim()) {
      setLinkHint(null);
      return;
    }
    if (looksLikeUnresolvedShortlink(value)) {
      try {
        const remote = await api<{ latitude: number | null; longitude: number | null; unresolvedShortlink: boolean; hint: string | null }>(
          '/api/geo/parse-link',
          { method: 'POST', body: JSON.stringify({ url: value.trim() }) },
        );
        if (remote.latitude != null && remote.longitude != null) {
          setLinkHint(null);
          applyPoint(remote.latitude, remote.longitude, null, 'Le lien');
          return;
        }
        setLinkHint(remote.hint ?? 'Ouvrez le lien et copiez les coordonnées.');
        return;
      } catch {
        setLinkHint('Ouvrez le lien dans Maps, puis copiez les coordonnées (lat, lng).');
        return;
      }
    }
    setLinkHint('Lien non reconnu. Collez un lien Google / Apple / OSM, geo: ou un couple lat,lng.');
  }

  function locate() {
    if (!navigator.geolocation) {
      toast('La géolocalisation n’est pas disponible.', 'alert');
      return;
    }
    setLocating(true);
    let best: GeolocationPosition | null = null;
    let done = false;
    const finish = (position?: GeolocationPosition | null) => {
      if (done) return;
      done = true;
      navigator.geolocation.clearWatch(watch);
      window.clearTimeout(timer);
      if (position) finishGps(position);
      else {
        setLocating(false);
        toast('Position trop lente. Réessayez à l’extérieur, ou collez un lien.', 'info');
      }
    };
    const watch = navigator.geolocation.watchPosition((position) => {
      if (!best || position.coords.accuracy < best.coords.accuracy) best = position;
      if (position.coords.accuracy <= 5) finish(position);
    }, () => {
      if (done) return;
      done = true;
      navigator.geolocation.clearWatch(watch);
      window.clearTimeout(timer);
      setLocating(false);
      toast('Position refusée. Collez un lien ou touchez la carte.', 'info');
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
    const timer = window.setTimeout(() => finish(best), 12000);
  }

  function finishGps(position: GeolocationPosition) {
    setLocating(false);
    const accuracy = position.coords.accuracy;
    setAccuracyM(accuracy);
    if (accuracy > GPS_ACCEPT_M) {
      setLat(position.coords.latitude);
      setLng(position.coords.longitude);
      toast(gpsAccuracyHint(accuracy), 'alert');
      return;
    }
    applyPoint(position.coords.latitude, position.coords.longitude, accuracy, 'La position');
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!place.trim()) {
      goTo(1);
      toast('Indiquez le lieu du signalement.', 'alert');
      return;
    }
    setBusy(true);
    const payload = {
      neighborhoodId: hood || null,
      placeLabel: place.trim(),
      latitude: lat,
      longitude: lng,
      accuracyM,
      waterLevel: level,
      comment,
      channel: 'WEB',
      tags: [],
    };
    try {
      let created: ReportItem;
      if (photo) {
        const form = new FormData();
        form.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        form.append('photo', photo);
        created = await api<ReportItem>('/api/reports', { method: 'POST', body: form });
      } else {
        created = await api<ReportItem>('/api/reports', { method: 'POST', body: JSON.stringify(payload) });
      }
      setDone(created);
      live.reload();
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Envoi impossible pour le moment. Réessayez dans un instant.', 'alert');
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setDone(null);
    setPhoto(null);
    setPlace('');
    setComment('');
    setLevel('GENOU');
    setStep(0);
  }

  if (done) return <Confirmation report={done} onAgain={reset} />;

  const canNext = step === 0 || (step === 1 && place.trim().length > 1 && located) || step === 2;
  const slide = {
    enter: (dir: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: dir * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: dir * -40 }),
  };

  return (
    <PublicPage>
      <PageHero
        photo={photos.apresPluie}
        eyebrow="Signalement"
        title="Signaler l’eau"
        short="Photo, lieu, niveau. En moins d’une minute."
        long="Une photo, un lieu et un niveau d’eau suffisent. Le signalement anonyme est accepté ; la mairie le vérifie avant affichage public."
        size="sm"
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Reveal className="card p-4 sm:p-6">
          <p className="sr-only" aria-live="polite">Étape {step + 1} sur {steps.length} : {steps[step]}</p>
          <ol className="mb-5 grid grid-cols-3 gap-2 sm:mb-6" aria-label="Étapes">
            {steps.map((label, index) => {
              const state = index < step ? 'done' : index === step ? 'current' : 'todo';
              return (
                <li key={label}>
                  <button
                    type="button"
                    className="flex min-h-11 w-full flex-col justify-center gap-2 text-left disabled:cursor-default"
                    onClick={() => index < step && goTo(index)}
                    disabled={index >= step}
                    aria-current={state === 'current' ? 'step' : undefined}
                  >
                    <span className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--bg-3)' }}>
                      <motion.span
                        className="block h-full rounded-full"
                        style={{ background: 'var(--cyan)' }}
                        initial={false}
                        animate={{ width: state === 'todo' ? '0%' : '100%' }}
                        transition={{ duration: 0.5, ease }}
                      />
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold sm:text-sm ${state === 'todo' ? 'text-muted' : ''}`}>
                      {state === 'done' ? <Check size={14} className="text-cyan" /> : <span className="t-num text-cyan">{index + 1}</span>}
                      {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <form onSubmit={submit} className="overflow-x-clip">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={step}
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease }}
                className="flex min-h-[260px] flex-col gap-5 sm:min-h-[340px]"
              >
                {step === 0 && (
                  <>
                    <div>
                      <h2 className="t-h3 text-xl">Une photo de l’eau</h2>
                      <p className="mt-1 text-sm text-muted">Elle aide la mairie à valider vite. Facultative.</p>
                    </div>
                    {preview ? (
                      <div className="relative overflow-hidden rounded-[22px] border border-line">
                        <motion.img
                          src={preview}
                          alt="Aperçu de votre photo"
                          className="aspect-[4/3] w-full object-cover"
                          initial={{ opacity: 0, scale: 1.04 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, ease }}
                        />
                        <div className="absolute right-3 bottom-3 left-3 flex flex-wrap gap-2">
                          <Button size="sm" className="overlay-panel" onClick={() => fileInput.current?.click()}><RotateCcw size={15} /> Changer</Button>
                          <Button size="sm" variant="danger" className="overlay-panel" onClick={() => setPhoto(null)}><Trash2 size={15} /> Retirer</Button>
                        </div>
                      </div>
                    ) : (
                      <label
                        className="dropzone"
                        data-drag={drag}
                        onDragOver={(event) => { event.preventDefault(); setDrag(true); }}
                        onDragLeave={() => setDrag(false)}
                        onDrop={onDrop}
                      >
                        <span className="icon-tile icon-tile-lg"><ImagePlus size={26} /></span>
                        <span>
                          <span className="block font-semibold">Prendre ou choisir une photo</span>
                          <span className="block text-sm text-muted">JPEG, PNG ou WebP</span>
                        </span>
                        <span className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                          <span className="btn btn-primary pointer-events-none sm:hidden" aria-hidden><Camera size={16} /> Prendre une photo</span>
                          <span className="btn btn-primary btn-sm pointer-events-none max-sm:hidden" aria-hidden><Camera size={16} /> Choisir une photo</span>
                          <button
                            type="button"
                            className="btn sm:hidden"
                            onClick={(event) => { event.preventDefault(); event.stopPropagation(); fileInput.current?.click(); }}
                          >
                            <ImagePlus size={16} /> Choisir dans la galerie
                          </button>
                        </span>
                        <input
                          ref={cameraInput}
                          className="sr-only"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          capture="environment"
                          aria-label="Prendre une photo"
                          onChange={(event) => pickFile(event.target.files?.[0])}
                        />
                      </label>
                    )}
                    <input ref={fileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choisir une photo" onChange={(event) => pickFile(event.target.files?.[0])} />
                  </>
                )}

                {step === 1 && (
                  <>
                    <div>
                      <h2 className="t-h3 text-xl">Où est l’eau ?</h2>
                      <p className="mt-1 text-sm text-muted">Collez un lien de localisation, ou envoyez votre position exacte. Un point est obligatoire avant de continuer.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Lieu" htmlFor="place">
                        <TextInput id="place" icon={<MapPin size={17} />} required value={place} onChange={(event) => setPlace(event.target.value)} placeholder="Bè Ahligo, près du marché" autoComplete="off" autoCapitalize="sentences" enterKeyHint="next" />
                      </Field>
                      <Field label="Quartier">
                        <Select label="Quartier" value={hood} onChange={setHood} options={hoodOptions} />
                      </Field>
                    </div>
                    <Field label="Coller un lien" hint="Google Maps, Apple Maps, OpenStreetMap, geo: ou lat,lng" htmlFor="map-link">
                      <TextInput
                        id="map-link"
                        value={link}
                        onChange={(event) => { void applyLink(event.target.value); }}
                        placeholder="https://maps.google.com/… ou 6.1328, 1.2342"
                        autoComplete="off"
                        inputMode="url"
                        enterKeyHint="done"
                      />
                    </Field>
                    {linkHint && <p className="note" data-tone="info">{linkHint}</p>}
                    <Button className="min-h-11 w-full sm:w-auto" onClick={locate} loading={locating}>
                      {!locating && <LocateFixed size={16} />} Position
                    </Button>
                    {accuracyM != null && (
                      <p className="geo-accuracy" data-ok={accuracyM <= GPS_ACCEPT_M}>
                        {gpsAccuracyHint(accuracyM)}
                      </p>
                    )}
                    <div className="relative isolate overflow-hidden rounded-[22px] border border-line">
                      <MapView
                        className="h-56 sm:h-72"
                        pins={located ? [{ id: 'me', lat, lng, label: place || 'Votre point', tone: waterTone(level), kind: 'me' }] : []}
                        selectedId={located ? 'me' : null}
                        fit={false}
                        focus={located ? { lat, lng, zoom: 17 } : { lat: 6.1725, lng: 1.2314, zoom: 12 }}
                        onPick={(nextLat, nextLng) => { applyPoint(nextLat, nextLng, null, 'La carte'); }}
                      />
                    </div>
                    <p className="t-num text-xs text-muted">
                      {located ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Aucun point validé'}
                    </p>
                    {!located && <p className="text-xs text-muted">Collez un lien, touchez la carte, ou envoyez votre position pour valider l’étape.</p>}
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <h2 className="t-h3 text-xl">Jusqu’où monte l’eau ?</h2>
                      <p className="mt-1 text-sm text-muted">Choisissez le niveau le plus proche.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3" role="radiogroup" aria-label="Niveau d’eau">
                      {levels.map((item) => {
                        const on = level === item.id;
                        return (
                          <motion.button
                            key={item.id}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            className="level-card"
                            data-on={on}
                            onClick={() => setLevel(item.id)}
                            whileTap={reduce ? undefined : { scale: 0.96 }}
                          >
                            <span className="level-gauge" aria-hidden>
                              {[1, 2, 3, 4, 5].map((bar) => (
                                <motion.i
                                  key={bar}
                                  data-fill={bar <= item.fill}
                                  style={{ height: `${bar * 6 + 4}px` }}
                                  animate={on && !reduce ? { scaleY: [1, 1.15, 1] } : undefined}
                                  transition={{ delay: bar * 0.04, duration: 0.4 }}
                                />
                              ))}
                            </span>
                            <span className="font-display font-semibold">{item.label}</span>
                            <span className="text-xs text-muted max-sm:hidden">{item.hint}</span>
                            {on && (
                              <motion.span layoutId="level-check" className="absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full" style={{ background: 'var(--cyan)', color: 'var(--on-primary)' }}>
                                <Check size={14} />
                              </motion.span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                    <Field label="Commentaire" hint="Facultatif. Ex. : caniveau bouché, rue coupée." htmlFor="comment">
                      <TextArea id="comment" rows={3} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Le caniveau devant le marché est bouché." maxLength={500} autoCapitalize="sentences" enterKeyHint="done" />
                    </Field>
                    {level === 'TAILLE' && (
                      <p className="note" data-tone="alert">
                        <Phone size={16} /> Danger immédiat : éloignez-vous de l’eau et appelez le 170.
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="sticky-actions card-solid mt-5 -mx-1 flex items-center justify-between gap-3 rounded-2xl p-2 sm:mt-6 sm:mx-0 sm:rounded-none sm:border-0 sm:border-t sm:border-line sm:bg-transparent sm:p-0 sm:pt-4 sm:shadow-none">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => goTo(step - 1)}><ArrowLeft size={17} /> Retour</Button>
              ) : <span />}
              {step < 2 ? (
                <Button key="next" variant="primary" onClick={() => goTo(step + 1)} disabled={!canNext} className="max-sm:flex-1">
                  {step === 0 && !photo ? 'Continuer sans photo' : 'Continuer'} <ArrowRight size={17} />
                </Button>
              ) : (
                <Button key="submit" variant="primary" type="submit" loading={busy} className="max-sm:flex-1">
                  {!busy && <Send size={17} />} {busy ? 'Envoi…' : 'Envoyer le signalement'}
                </Button>
              )}
            </div>
          </form>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-4">
          <div className="card p-5">
            <p className="t-h3">Votre signalement</p>
            <dl className="mt-4 grid gap-3 text-sm">
              {[
                ['Photo', photo ? photo.name : 'Aucune'],
                ['Lieu', place || '—'],
                ['Quartier', live.neighborhoods.find((item) => item.id === hood)?.name ?? 'Non précisé'],
                ['Niveau', waterPhrase(level)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                  <dt className="text-muted">{label}</dt>
                  <dd className="min-w-0 truncate font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card flex gap-3 p-5">
            <span className="icon-tile icon-tile-sm" data-tone="ok"><ShieldCheck size={18} /></span>
            <p className="text-sm text-muted">Anonyme accepté. Votre numéro n’est jamais affiché sur la carte.</p>
          </div>
        </Reveal>
      </div>
    </PublicPage>
  );
}

function Confirmation({ report, onAgain }: { report: ReportItem; onAgain: () => void }) {
  const reduce = useReducedMotion();
  return (
    <PublicPage>
      <div className="mx-auto w-full max-w-lg py-6 md:py-12">
        <motion.div
          className="card flex flex-col items-center gap-5 p-6 text-center md:p-10"
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease }}
        >
          <motion.span
            className="grid h-20 w-20 place-items-center rounded-full"
            style={{ background: 'var(--ok-soft)', color: 'var(--ok-text)' }}
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
              <motion.path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.4, ease }}
              />
            </svg>
          </motion.span>
          <div>
            <h1 className="t-h2">Signalement envoyé</h1>
            <p className="mt-2 text-muted">Merci. La mairie le vérifie avant de l’afficher sur la carte publique.</p>
          </div>
          <div className="w-full rounded-2xl border border-line p-4">
            <p className="text-xs text-muted">Référence</p>
            <p className="t-num mt-1 text-2xl font-semibold text-cyan">{report.reference}</p>
            <p className="mt-1 text-sm text-text2">{report.placeLabel} · {waterPhrase(report.waterLevel)}</p>
          </div>
          <div className="grid w-full gap-2.5 sm:grid-cols-2">
            <Button to="/carte" variant="primary">Voir la carte</Button>
            <Button onClick={onAgain}><Camera size={16} /> Nouveau signalement</Button>
          </div>
        </motion.div>
      </div>
    </PublicPage>
  );
}
