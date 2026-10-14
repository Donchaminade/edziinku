import { motion, useReducedMotion } from 'framer-motion';
import { Camera, LocateFixed, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { MapView, type MapPin as Pin } from '../components/MapView';
import { LivePill, Page, ThemeToggle } from '../components/Shell';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../lib/api';
import { ago, alertTone, statusTone, waterPhrase, waterTone } from '../lib/format';
import { useLive } from '../lib/useCatalog';
import { Drawer, HoverCard, LiveDot, Press, Reveal, Skeleton, Stagger, StaggerItem, Toast } from '../motion/ui';
import { useTheme } from '../theme/ThemeProvider';
import type { Neighborhood, Preference, Profile, ReportItem, WaterLevel } from '../types';

const levels: { id: WaterLevel; label: string; hint: string }[] = [
  { id: 'CHEVILLE', label: 'Cheville', hint: 'On passe encore' },
  { id: 'GENOU', label: 'Genou', hint: 'La rue se ferme' },
  { id: 'TAILLE', label: 'Taille', hint: 'Danger immédiat' },
];

export function HomePage() {
  const live = useLive();
  const lead = live.alerts[0];
  return (
    <Page>
      <section className="relative grid items-center gap-10 overflow-hidden py-8 md:grid-cols-[1.1fr_.9fr] md:py-16">
        <div className="rings" aria-hidden>
          <span /><span /><span /><span />
        </div>
        <div>
          <Reveal>
            <LivePill><LiveDot /> {live.loading ? 'Connexion…' : live.source === 'api' ? 'Données en direct' : 'Données de démonstration'}</LivePill>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
              L’œil de la <span className="text-grad">pluie</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-hero">
              Edzii-Nku prévient les quartiers de Lomé avant que l’eau n’entre dans la cour. En français, et en éwé.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="mt-6 flex flex-wrap gap-3">
            <Link to="/whatsapp" className="btn btn-primary"><MessageCircle size={18} /> Recevoir les alertes</Link>
            <Link to="/signaler" className="btn">Signaler une inondation</Link>
          </Reveal>
          {lead && (
            <Reveal delay={0.16}>
              <HoverCard className="surface mt-8 max-w-xl p-5">
                <span className="tag" data-tone={alertTone(lead.level)}>{lead.level === 'ELEVE' ? 'Risque élevé' : lead.level}</span>
                <h2 className="mt-3 font-display text-2xl">{lead.title}</h2>
                <p className="mt-2 text-muted">{lead.body}</p>
                {lead.rainMmMax != null && <p className="mt-3 text-sm text-cyan">{lead.rainMmMin}–{lead.rainMmMax} mm · {lead.source}</p>}
              </HoverCard>
            </Reveal>
          )}
        </div>
        <Reveal delay={0.1}>
          <RainCard />
        </Reveal>
      </section>

      <Reveal>
        <section className="surface grid gap-6 p-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted">Français</p>
            <p className="mt-2 text-lg">De fortes pluies sont prévues ce soir. Surélevez vos biens, évitez les caniveaux.</p>
          </div>
          <div>
            <p className="text-sm text-muted">Eʋegbe</p>
            <p className="mt-2 text-lg">{lead?.bodyEwe || 'Tsi gã adza fiẽ sia. (texte à relire)'}</p>
            <p className="ewe-note mt-3">Texte en éwé à relire par un locuteur natif.</p>
          </div>
        </section>
      </Reveal>

      <section className="mt-14">
        <h2 className="font-display text-3xl">Trois gestes</h2>
        <Stagger className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ['Choisir son quartier', 'Bè, Agoè-Nyivé, Zogbédji et les autres zones suivies.'],
            ['Recevoir l’alerte', 'WhatsApp, l’application ou cette page, en français ou en éwé.'],
            ['Signaler l’eau', 'Une photo, un point sur la carte, un niveau : cheville, genou, taille.'],
          ].map(([title, text]) => (
            <StaggerItem key={title}>
              <HoverCard className="surface h-full p-5">
                <h3 className="font-display text-xl">{title}</h3>
                <p className="mt-2 text-muted">{text}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mt-14">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl">Quartiers</h2>
          <Link to="/communes" className="text-sm text-cyan">Voir les communes</Link>
        </div>
        {live.loading ? <Skeleton className="h-28" /> : (
          <Stagger className="grid gap-3 md:grid-cols-3">
            {live.neighborhoods.map((hood) => (
              <StaggerItem key={hood.id}>
                <HoverCard className="surface p-4">
                  <div className="flex items-center justify-between">
                    <strong>{hood.name}</strong>
                    <span className="tag" data-tone={hood.riskLevel === 'ELEVE' ? 'alert' : hood.riskLevel === 'MODERE' ? 'ok' : 'warn'}>{hood.riskLabel}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{hood.commune}{hood.approximate ? ' · zone approximative' : ''}</p>
                </HoverCard>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </Page>
  );
}

function RainCard() {
  const { hourly, weather } = useLive();
  const reduce = useReducedMotion();
  const hours = hourly.hours.length ? hourly.hours : weather.days.map((day, index) => ({ hour: index, mm: day.precipitationMm }));
  const max = Math.max(...hours.map((hour) => hour.mm), 1);
  return (
    <div className="surface relative p-5">
      <p className="text-sm text-muted">Précipitations · Open-Meteo</p>
      <div className="mt-6 flex h-40 items-end gap-2">
        {hours.map((hour) => (
          <motion.div
            key={`${hour.hour}-${hour.mm}`}
            className="rain-col flex-1"
            initial={reduce ? false : { height: 0 }}
            animate={{ height: `${Math.max(8, (hour.mm / max) * 100)}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            title={`${hour.mm} mm`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">{weather.demo ? 'Série de démonstration si Open-Meteo ne répond pas.' : weather.source}</p>
    </div>
  );
}

export function MapPage() {
  const live = useLive();
  const [selected, setSelected] = useState<string | null>(null);
  const pins = useMemo<Pin[]>(() => live.reports.map((report) => ({
    id: report.id,
    lat: report.latitude,
    lng: report.longitude,
    label: `${report.placeLabel} · ${report.waterLevelLabel}`,
    tone: waterTone(report.waterLevel),
  })), [live.reports]);
  const current = live.reports.find((report) => report.id === selected) ?? live.reports[0];
  return (
    <Page className="!max-w-none !px-0 !py-0">
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[380px_1fr]">
        <div className="order-2 max-h-[50vh] overflow-auto p-4 lg:order-1 lg:max-h-none">
          <h1 className="font-display text-3xl">Carte live</h1>
          <p className="mt-1 text-sm text-muted">Signalements ouverts à Lomé. La carte reste en contraste nuit.</p>
          <Stagger className="mt-4 flex flex-col gap-3">
            {live.loading && <Skeleton className="h-24" />}
            {live.reports.map((report) => (
              <StaggerItem key={report.id}>
                <button type="button" className="w-full text-left" onClick={() => setSelected(report.id)}>
                  <HoverCard className={`surface p-4 ${current?.id === report.id ? 'ring-1 ring-cyan' : ''}`}>
                    <div className="flex items-center justify-between gap-2">
                      <strong>{report.placeLabel}</strong>
                      <span className="tag" data-tone={waterTone(report.waterLevel)}>{report.waterLevelLabel}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{report.neighborhoodName} · {ago(report.createdAt)}</p>
                  </HoverCard>
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <MapView className="order-1 h-[46vh] lg:order-2 lg:h-auto" pins={pins} selectedId={current?.id} onSelect={setSelected} />
      </div>
    </Page>
  );
}

export function ReportPage() {
  const live = useLive();
  const [place, setPlace] = useState('');
  const [level, setLevel] = useState<WaterLevel>('GENOU');
  const [comment, setComment] = useState('');
  const [hood, setHood] = useState('');
  const [lat, setLat] = useState(6.137);
  const [lng, setLng] = useState(1.212);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<ReportItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function locate() {
    if (!navigator.geolocation) {
      setToast('La géolocalisation n’est pas disponible.');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      setLat(position.coords.latitude);
      setLng(position.coords.longitude);
      try {
        const found = await api<{ neighborhood: Neighborhood | null }>(
          `/api/geo/locate?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
        );
        if (found.neighborhood) setHood(found.neighborhood.id);
        setToast(found.neighborhood ? `Quartier : ${found.neighborhood.name}` : 'Position enregistrée, hors zone connue.');
      } catch {
        setToast('Position enregistrée.');
      }
    }, () => setToast('Position refusée. Vous pouvez la placer à la main.'));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const payload = {
      neighborhoodId: hood || null,
      placeLabel: place,
      latitude: lat,
      longitude: lng,
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
      setToast(error instanceof ApiError ? error.message : 'Envoi impossible. Le signalement de démo reste visible sur la carte.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Page>
        <Reveal>
          <div className="surface mx-auto max-w-lg p-8 text-center">
            <motion.div
              className="icon-bubble mx-auto"
              data-tone="ok"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <ShieldCheck />
            </motion.div>
            <h1 className="mt-4 font-display text-3xl">Signalement envoyé</h1>
            <p className="mt-2 text-muted">Référence {done.reference}. Il sera visible après vérification.</p>
            <Link to="/carte" className="btn btn-primary mt-6">Voir la carte</Link>
          </div>
        </Reveal>
      </Page>
    );
  }

  return (
    <Page>
      <Reveal>
        <h1 className="font-display text-4xl">Signaler l’eau</h1>
        <p className="mt-2 max-w-xl text-muted">Une photo, un lieu, un niveau. Le signalement anonyme est accepté.</p>
      </Reveal>
      <form className="mt-6 grid gap-4 md:grid-cols-[1fr_320px]" onSubmit={submit}>
        <div className="surface flex flex-col gap-4 p-5">
          <label className="text-sm text-muted">Lieu
            <span className="field mt-1"><MapPin size={16} /><input required value={place} onChange={(event) => setPlace(event.target.value)} placeholder="Bè Ahligo, près du marché" /></span>
          </label>
          <label className="text-sm text-muted">Quartier
            <select className="field mt-1" value={hood} onChange={(event) => setHood(event.target.value)}>
              <option value="">Je ne sais pas</option>
              {live.neighborhoods.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.commune}</option>)}
            </select>
          </label>
          <div>
            <p className="text-sm text-muted">Niveau d’eau</p>
            <div className="mt-2 flex gap-2">
              {levels.map((item) => (
                <motion.button
                  key={item.id}
                  type="button"
                  className={`level ${level === item.id ? 'level-on' : ''}`}
                  onClick={() => setLevel(item.id)}
                  whileTap={{ scale: 0.97 }}
                >
                  {item.label}
                  <small>{item.hint}</small>
                </motion.button>
              ))}
            </div>
          </div>
          <label className="text-sm text-muted">Commentaire
            <span className="field mt-1 items-start"><textarea rows={3} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Le caniveau est bouché." /></span>
          </label>
          <div className="flex flex-wrap gap-2">
            <Press className="btn" onClick={() => { void locate(); }}><LocateFixed size={16} /> Ma position</Press>
            <label className="btn cursor-pointer">
              <Camera size={16} /> {photo ? photo.name : 'Photo'}
              <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
            </label>
          </div>
          <Press className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer le signalement'}</Press>
        </div>
        <MapView
          className="h-80 overflow-hidden rounded-[20px]"
          pins={[{ id: 'me', lat, lng, label: place || 'Votre point', tone: waterTone(level) }]}
          selectedId="me"
        />
      </form>
      <Toast message={toast} />
    </Page>
  );
}

export function HowPage() {
  return (
    <Page>
      <Reveal>
        <h1 className="font-display text-4xl">Comment ça marche</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Edzii-Nku croise la pluie prévue (Open-Meteo), les signalements des habitants et les bassins suivis par la mairie et la protection civile.
        </p>
      </Reveal>
      <Stagger className="mt-8 grid gap-4">
        {[
          ['1', 'Vous choisissez un quartier', 'L’abonnement WhatsApp ou le profil de l’application limite les alertes à votre zone.'],
          ['2', 'Une alerte part avant la pluie', 'Le message est en français. La version éwé est un premier jet, marqué à relire.'],
          ['3', 'Vous confirmez ce que vous voyez', 'Photo, position, niveau d’eau. La mairie valide ou écarte le signalement.'],
          ['4', 'Les équipes suivent les points noirs', 'Bassins obstrués, caniveaux, équipes sur le terrain.'],
        ].map(([step, title, text]) => (
          <StaggerItem key={step}>
            <HoverCard className="surface flex gap-4 p-5">
              <span className="avatar">{step}</span>
              <div>
                <h2 className="font-display text-xl">{title}</h2>
                <p className="mt-1 text-muted">{text}</p>
              </div>
            </HoverCard>
          </StaggerItem>
        ))}
      </Stagger>
    </Page>
  );
}

export function CommunesPage() {
  const { neighborhoods, loading } = useLive();
  const communes = [...new Set(neighborhoods.map((item) => item.commune))];
  return (
    <Page>
      <Reveal>
        <h1 className="font-display text-4xl">Communes suivies</h1>
        <p className="mt-2 text-muted">Les polygones de quartiers sont dans PostGIS. Certaines limites restent approximatives.</p>
      </Reveal>
      {loading ? <Skeleton className="mt-6 h-40" /> : (
        <Stagger className="mt-6 grid gap-4 md:grid-cols-2">
          {communes.map((commune) => (
            <StaggerItem key={commune}>
              <HoverCard className="surface p-5">
                <h2 className="font-display text-2xl">{commune}</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {neighborhoods.filter((item) => item.commune === commune).map((item) => (
                    <li key={item.id} className="chip">{item.name}</li>
                  ))}
                </ul>
              </HoverCard>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </Page>
  );
}

export function WhatsAppPage() {
  const { neighborhoods } = useLive();
  const [step, setStep] = useState<'lang' | 'hood' | 'ready' | 'level' | 'sent'>('lang');
  const [language, setLanguage] = useState<'fr' | 'ewe'>('fr');
  const [hood, setHood] = useState<Neighborhood | null>(null);
  const ewe = language === 'ewe';
  return (
    <Page>
      <div className="mx-auto grid max-w-xl gap-4">
        <Reveal>
          <h1 className="font-display text-3xl">WhatsApp</h1>
          <p className="mt-2 text-sm text-muted">Simulation du parcours. Le bot réel répond sur le webhook Cloud API de l’API.</p>
        </Reveal>
        <div className="wa">
          <div className="wa-top">
            <img src="/logo-mark.svg" alt="" width={36} height={36} />
            <div>
              <strong>Edzii-Nku</strong>
              <p className="text-xs" style={{ color: 'var(--map-muted)' }}>en ligne</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="wa-bubble">👋 Bienvenue sur Edzii-Nku, l’œil de la pluie. Quelle langue préférez-vous ?{'\n'}Tia wò gbe. (éwé à relire)</div>
            {step !== 'lang' && <div className="wa-bubble wa-out">{ewe ? 'Eʋegbe' : 'Français'}</div>}
            {step !== 'lang' && (
              <div className="wa-bubble">{ewe ? 'Tia wò kɔƒe. (à relire)' : 'Choisissez votre quartier.'}</div>
            )}
            {hood && <div className="wa-bubble wa-out">{hood.name}</div>}
            {hood && step !== 'hood' && step !== 'lang' && (
              <div className="wa-bubble">{ewe
                ? `Wò ŋkɔ le ${hood.name}. (à relire)`
                : `Vous êtes abonné·e à ${hood.name}. Envoyez une photo pour signaler l’eau, ou attendez l’alerte.`}</div>
            )}
            {step === 'level' && <div className="wa-bubble">{ewe ? 'Tsi le afɔ kɔ ƒe? (à relire)' : 'Jusqu’où monte l’eau ?'}</div>}
            {step === 'sent' && <div className="wa-bubble wa-out">{ewe ? 'Tsi le afɔkɔ me' : 'Eau au genou'}</div>}
            {step === 'sent' && <div className="wa-bubble">Signalement reçu. La mairie le vérifiera. Merci.</div>}
            {ewe && <p className="ewe-note">Textes éwé à relire par un locuteur natif.</p>}
          </div>
          <div className="flex flex-wrap gap-2 p-3">
            {step === 'lang' && (
              <>
                <button type="button" className="wa-quick" onClick={() => { setLanguage('fr'); setStep('hood'); }}>Français</button>
                <button type="button" className="wa-quick" onClick={() => { setLanguage('ewe'); setStep('hood'); }}>Eʋegbe</button>
              </>
            )}
            {step === 'hood' && neighborhoods.slice(0, 4).map((item) => (
              <button key={item.id} type="button" className="wa-quick" onClick={() => { setHood(item); setStep('ready'); }}>{item.name}</button>
            ))}
            {step === 'ready' && (
              <button type="button" className="wa-quick" onClick={() => setStep('level')}>Signaler</button>
            )}
            {step === 'level' && (
              <button type="button" className="wa-quick" onClick={() => setStep('sent')}>Genou</button>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

export function AuthPage() {
  const { login, register, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('afi@edzii.local');
  const [password, setPassword] = useState('Demo-Edzii-2026');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const account = mode === 'login'
        ? await login(identifier, password)
        : await register({ displayName: name, email: identifier, phone, password });
      await api('/api/me/theme', { method: 'PUT', body: JSON.stringify({ theme }) }).catch(() => undefined);
      navigate(account.role === 'CITOYEN' ? '/profil' : '/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <motion.form className="surface mx-auto max-w-md p-6" onSubmit={submit} layout>
        <div className="mb-4 flex justify-between">
          <h1 className="font-display text-3xl">{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h1>
          <ThemeToggle />
        </div>
        {user && <p className="demo-note mb-3">Session ouverte : {user.displayName}</p>}
        <div className="mb-4 flex gap-2">
          <button type="button" className={`chip ${mode === 'login' ? 'chip-on' : ''}`} onClick={() => setMode('login')}>Connexion</button>
          <button type="button" className={`chip ${mode === 'register' ? 'chip-on' : ''}`} onClick={() => setMode('register')}>Inscription</button>
        </div>
        {mode === 'register' && (
          <label className="mb-3 block text-sm text-muted">Nom
            <span className="field mt-1"><input required value={name} onChange={(event) => setName(event.target.value)} /></span>
          </label>
        )}
        <label className="mb-3 block text-sm text-muted">{mode === 'login' ? 'E-mail ou téléphone' : 'E-mail'}
          <span className="field mt-1"><input required value={identifier} onChange={(event) => setIdentifier(event.target.value)} /></span>
        </label>
        {mode === 'register' && (
          <label className="mb-3 block text-sm text-muted">Téléphone
            <span className="field mt-1"><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+228…" /></span>
          </label>
        )}
        <label className="mb-3 block text-sm text-muted">Mot de passe
          <span className="field mt-1"><input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /></span>
        </label>
        {error && (
          <motion.p className="ewe-note mb-3" animate={{ x: [0, -6, 6, -3, 0] }}>{error}</motion.p>
        )}
        <Press className="btn btn-primary w-full" type="submit" disabled={busy}>{busy ? 'Patientez…' : 'Continuer'}</Press>
        <p className="demo-note mt-4">Comptes de démo : afi@edzii.local, mairie@edzii.local, pc@edzii.local — mot de passe Demo-Edzii-2026. Google OAuth est prévu, pas encore branché.</p>
      </motion.form>
    </Page>
  );
}

export function ProfilePage() {
  const { user, ready, logout } = useAuth();
  const live = useLive();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    let cancel = false;
    void api<Profile>('/api/me')
      .then((data) => { if (!cancel) setProfile(data); })
      .catch(() => { if (!cancel) setToast('Profil indisponible.'); });
    return () => { cancel = true; };
  }, [ready, user]);

  if (!ready) return <Page><Skeleton className="h-40" /></Page>;
  if (!user) return <Page><Link to="/connexion" className="btn btn-primary">Se connecter</Link></Page>;

  async function saveChannels(next: Preference) {
    const saved = await api<Preference>('/api/me/channels', { method: 'PUT', body: JSON.stringify(next) });
    setProfile((current) => current ? { ...current, preferences: saved } : current);
    setToast('Canaux mis à jour');
  }

  async function toggleHood(id: string) {
    if (!profile) return;
    const ids = profile.neighborhoods.some((item) => item.id === id)
      ? profile.neighborhoods.filter((item) => item.id !== id).map((item) => item.id)
      : [...profile.neighborhoods.map((item) => item.id), id];
    const saved = await api<Profile>('/api/me/neighborhoods', { method: 'PUT', body: JSON.stringify({ neighborhoodIds: ids }) });
    setProfile(saved);
  }

  const prefs = profile?.preferences;
  return (
    <Page>
      <Reveal>
        <div className="flex items-center gap-4">
          <span className="avatar h-14 w-14 text-xl">{user.displayName.slice(0, 1)}</span>
          <div>
            <h1 className="font-display text-3xl">{user.displayName}</h1>
            <p className="text-muted">{user.email || user.phone} · {user.role}</p>
          </div>
        </div>
      </Reveal>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="surface p-5">
          <h2 className="font-display text-xl">Canaux</h2>
          {prefs ? (
            <div className="mt-3 flex flex-col gap-2">
              <Channel label="Notifications" on={prefs.pushEnabled} onClick={() => { void saveChannels({ ...prefs, pushEnabled: !prefs.pushEnabled }); }} />
              <Channel label="WhatsApp" on={prefs.whatsappEnabled} onClick={() => { void saveChannels({ ...prefs, whatsappEnabled: !prefs.whatsappEnabled }); }} />
              <Channel label="SMS" on={prefs.smsEnabled} onClick={() => { void saveChannels({ ...prefs, smsEnabled: !prefs.smsEnabled }); }} />
              <Channel label="Alertes de nuit" on={prefs.nightAlerts} onClick={() => { void saveChannels({ ...prefs, nightAlerts: !prefs.nightAlerts }); }} />
            </div>
          ) : <Skeleton className="mt-3 h-24" />}
        </section>
        <section className="surface p-5">
          <h2 className="font-display text-xl">Quartiers suivis</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {live.neighborhoods.map((item) => {
              const on = profile?.neighborhoods.some((hood) => hood.id === item.id);
              return (
                <button key={item.id} type="button" className={`chip ${on ? 'chip-on' : ''}`} onClick={() => { void toggleHood(item.id); }}>{item.name}</button>
              );
            })}
          </div>
        </section>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" className="btn" onClick={() => setOpen(true)}>Mes signalements</button>
        <button type="button" className="btn" onClick={() => { void logout().then(() => navigate('/')); }}>Quitter</button>
      </div>
      <Drawer open={open} title="Mes signalements" onClose={() => setOpen(false)}>
        <Mine />
      </Drawer>
      <Toast message={toast} />
    </Page>
  );
}

function Channel({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" className="flex items-center justify-between" onClick={onClick}>
      <span>{label}</span>
      <motion.span className={`chip ${on ? 'chip-on' : ''}`} layout>{on ? 'Oui' : 'Non'}</motion.span>
    </button>
  );
}

function Mine() {
  const [items, setItems] = useState<ReportItem[] | null>(null);
  useEffect(() => {
    let cancel = false;
    void api<ReportItem[]>('/api/me/reports')
      .then((data) => { if (!cancel) setItems(data); })
      .catch(() => { if (!cancel) setItems([]); });
    return () => { cancel = true; };
  }, []);
  if (!items) return <Skeleton className="h-24" />;
  if (!items.length) return <p className="text-muted">Aucun signalement pour le moment.</p>;
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <article key={item.id} className="surface p-3">
          <div className="flex justify-between gap-2">
            <strong>{item.reference}</strong>
            <span className="tag" data-tone={statusTone(item.status)}>{item.statusLabel}</span>
          </div>
          <p className="text-sm text-muted">{item.placeLabel} · {waterPhrase(item.waterLevel)}</p>
        </article>
      ))}
    </div>
  );
}
