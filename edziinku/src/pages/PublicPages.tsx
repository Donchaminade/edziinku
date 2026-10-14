import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Camera, ChevronLeft, ChevronRight, LocateFixed, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { MapView, type MapPin as Pin } from '../components/MapView';
import { Copy, PageHero, PhotoCredit, QuietNote } from '../components/Hero';
import { LivePill, Page, ThemeToggle } from '../components/Shell';
import { useAuth } from '../context/AuthContext';
import { photos, type StockPhoto } from '../data/photos';
import { api, ApiError } from '../lib/api';
import { ago, statusTone, waterPhrase, waterTone } from '../lib/format';
import { useLive } from '../lib/useCatalog';
import { Drawer, HoverCard, LiveDot, Press, Reveal, Skeleton, Stagger, StaggerItem, Toast } from '../motion/ui';
import { useTheme } from '../theme/ThemeProvider';
import type { Neighborhood, Preference, Profile, ReportItem, WaterLevel } from '../types';

const levels: { id: WaterLevel; label: string; hint: string }[] = [
  { id: 'CHEVILLE', label: 'Cheville', hint: 'On passe encore' },
  { id: 'GENOU', label: 'Genou', hint: 'La rue se ferme' },
  { id: 'TAILLE', label: 'Taille', hint: 'Danger immédiat' },
];

const heroSlides: StockPhoto[] = [photos.lekki, photos.cap, photos.kampala, photos.nairobi];

function HeroCarousel() {
  const live = useLive();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = heroSlides[index];

  useEffect(() => {
    if (reduce || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroSlides.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [paused, reduce]);

  function go(next: number) {
    setIndex((next + heroSlides.length) % heroSlides.length);
  }

  return (
    <section
      className="hero-stage"
      aria-roledescription="carrousel"
      aria-label="Villes sous la pluie"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          className="hero-photo"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </AnimatePresence>
      <div className="soft-shape hero-blob" aria-hidden />
      <div className="hero-veil">
        <LivePill>
          <LiveDot /> {live.loading ? 'Connexion…' : live.source === 'api' ? 'Données en direct' : 'Démonstration'}
        </LivePill>
        <h1 className="display">
          L’œil de la <span className="text-grad">pluie</span>
        </h1>
        <Copy
          className="hero-lead"
          short="Prévenir Lomé avant que l’eau n’entre."
          long="Edzii-Nku prévient les quartiers de Lomé avant que l’eau n’entre dans la cour. En français, et en éwé."
        />
        <div className="hero-actions">
          <Link to="/whatsapp" className="btn btn-primary"><MessageCircle size={18} /> Recevoir les alertes</Link>
          <Link to="/signaler" className="btn">Signaler</Link>
        </div>
        <PhotoCredit photo={slide} />
      </div>
      <button type="button" className="hero-nav hero-nav-prev" aria-label="Image précédente" onClick={() => go(index - 1)}>
        <ChevronLeft size={18} />
      </button>
      <button type="button" className="hero-nav hero-nav-next" aria-label="Image suivante" onClick={() => go(index + 1)}>
        <ChevronRight size={18} />
      </button>
      <div className="hero-dots">
        {heroSlides.map((item, itemIndex) => (
          <button
            key={item.src}
            type="button"
            className="hero-dot"
            data-on={itemIndex === index}
            aria-label={item.alt}
            aria-current={itemIndex === index}
            onClick={() => setIndex(itemIndex)}
          />
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  const live = useLive();
  const lead = live.alerts[0];
  return (
    <>
      <HeroCarousel />
      <Page>
        <section className="relative">
          <div className="soft-shape" style={{ width: 140, height: 140, top: -30, right: -20 }} aria-hidden />
          <Stagger className="grid gap-3 md:grid-cols-3">
            {[
              ['Deux langues', 'Français, et éwé à relire.'],
              ['Trois canaux', 'Cette page, l’application, WhatsApp.'],
              [live.neighborhoods.length ? `${live.neighborhoods.length} quartiers` : 'Quartiers', 'Bè, Agoè-Nyivé, Zogbédji et les zones suivies.'],
            ].map(([title, text]) => (
              <StaggerItem key={title}>
                <HoverCard className="surface showcase h-full p-5">
                  <h2 className="display-sm">{title}</h2>
                  <p className="clamp-3 mt-2 text-muted">{text}</p>
                </HoverCard>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="mt-10 md:mt-16">
          <PageHero
            tone="band"
            heading="h2"
            photo={photos.inondee}
            kicker="Le problème"
            title="L’eau entre avant l’alerte"
            short="L’averse remplit la cour plus vite que le bouche-à-oreille."
            long="À Lomé, une averse remplit la cour et le caniveau plus vite que le bouche-à-oreille. Le quartier l’apprend souvent quand il est déjà trop tard pour surélever les biens."
          />
        </section>

        <section className="relative mt-10 md:mt-16">
          <div className="soft-shape" style={{ width: 180, height: 120, left: -30, bottom: 40, borderRadius: 48 }} aria-hidden />
          <PageHero
            tone="band"
            heading="h2"
            photo={photos.sao}
            kicker="Le projet"
            title="Pourquoi Edzii-Nku"
            short="Voir la pluie venir, puis agir avec son quartier."
            long="Une vitrine simple pour voir la pluie venir, puis agir avec son quartier."
          />
          <Stagger className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ['Avant l’eau', 'L’alerte part quand la pluie menace le quartier.'],
              ['Vu par les habitants', 'Photo, lieu, niveau : cheville, genou ou taille.'],
              ['Deux langues', 'Le français fait foi. L’éwé est marqué à relire.'],
              ['Une carte commune', 'Signalements et bassins, pour la ville et la protection civile.'],
            ].map(([title, text]) => (
              <StaggerItem key={title}>
                <HoverCard className="surface h-full p-5">
                  <h3 className="display-sm">{title}</h3>
                  <p className="clamp-3 mt-2 text-muted">{text}</p>
                </HoverCard>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="mt-10 md:mt-16">
          <PageHero
            tone="compact"
            heading="h2"
            photo={photos.cap}
            kicker="Le parcours"
            title="Comment ça marche"
            short="Quartier, message, photo, puis la ville suit."
            long="Quatre étapes : choisir son quartier, recevoir le message, dire ce que l’on voit, laisser la ville suivre."
          />
          <Stagger className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              ['01', 'Choisir son quartier', 'L’alerte ne part que là où vous habitez.'],
              ['02', 'Recevoir le message', 'WhatsApp, l’application ou cette page.'],
              ['03', 'Dire ce que vous voyez', 'Une photo et un niveau d’eau suffisent.'],
              ['04', 'La ville suit', 'Validation, points noirs, équipes sur place.'],
            ].map(([step, title, text]) => (
              <StaggerItem key={step}>
                <HoverCard className="surface h-full p-4">
                  <p className="step-no">{step}</p>
                  <h3 className="mt-2 font-display text-lg">{title}</h3>
                  <p className="clamp-3 mt-2 text-sm text-muted">{text}</p>
                </HoverCard>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="mt-10 md:mt-16">
          <PageHero
            tone="compact"
            heading="h2"
            photo={photos.kampala}
            kicker="Langues"
            title="Français et éwé"
            short="Le français fait foi. L’éwé est à relire."
            long="Le message français est la référence. La version éwé est un premier jet, marqué à relire par un locuteur natif."
          />
          <div className="surface mt-4 grid gap-4 p-4 md:grid-cols-2 md:p-6">
            <div className="min-w-0">
              <p className="text-sm text-muted">Français</p>
              <p className="clamp-3 mt-2">{lead?.body || 'De fortes pluies sont prévues. Surélevez vos biens, évitez les caniveaux.'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted">Eʋegbe</p>
              <p className="clamp-3 mt-2">{lead?.bodyEwe || 'Tsi gã adza fiẽ sia. (texte à relire)'}</p>
              <p className="ewe-note mt-3">Texte en éwé à relire par un locuteur natif.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 md:mt-16">
          <PageHero
            tone="band"
            heading="h2"
            photo={photos.nairobi}
            kicker="Alertes"
            title={lead?.title || 'Forte pluie prévue'}
            short="Le message part avant la pluie, en français et en éwé."
            long={lead?.body || 'Le message part avant la pluie, en français et en éwé.'}
          />
          <div className="mt-4">
            <RainCard />
          </div>
        </section>

        <section className="mt-10 md:mt-16">
          <PageHero
            tone="band"
            heading="h2"
            photo={photos.lekki}
            kicker="Carte"
            title="Voir l’eau déjà signalée"
            short="Les points restent lisibles. La carte garde son contraste sombre."
            long="Les points restent lisibles, de nuit comme de jour. La carte, elle, garde son contraste sombre."
          >
            <Link to="/carte" className="btn">Ouvrir la carte</Link>
          </PageHero>
        </section>

        <section className="mt-10 md:mt-16">
          <PageHero
            tone="band"
            heading="h2"
            photo={photos.telephone}
            kicker="Bot WhatsApp"
            title="Le quartier dans la poche"
            short="Langue, quartier, puis une photo et un niveau d’eau."
            long="Langue, quartier, puis une photo et un niveau d’eau. La simulation montre le parcours ; le bot réel répond via l’API."
          >
            <Link to="/whatsapp" className="btn">Essayer le parcours</Link>
          </PageHero>
        </section>

        <section className="mt-10 md:mt-16">
          <PageHero
            tone="compact"
            heading="h2"
            photo={photos.kampala}
            kicker="Territoire"
            title="Quartiers"
            short="Les zones suivies, commune par commune."
            long="Les zones suivies à Lomé, avec leur commune et le niveau de risque affiché."
          >
            <Link to="/communes" className="btn">Voir les communes</Link>
          </PageHero>
          {live.loading ? <Skeleton className="mt-4 h-28" /> : (
            <Stagger className="mt-4 grid gap-3 md:grid-cols-3">
              {live.neighborhoods.map((hood) => (
                <StaggerItem key={hood.id}>
                  <HoverCard className="surface p-4">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="min-w-0">{hood.name}</strong>
                      <span className="tag shrink-0" data-tone={hood.riskLevel === 'ELEVE' ? 'alert' : hood.riskLevel === 'MODERE' ? 'ok' : 'warn'}>{hood.riskLabel}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{hood.commune}{hood.approximate ? ' · zone approximative' : ''}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </section>

        <section className="mt-10 md:mt-16">
          <PageHero
            tone="band"
            heading="h2"
            photo={photos.entraide}
            kicker="Acteurs"
            title="Qui fait circuler l’alerte"
            short="Pas un partenariat signé : les rôles prévus sur la plateforme."
            long="Pas un partenariat signé : les rôles que la plateforme prévoit. Open-Meteo fournit la pluie prévue, en donnée ouverte."
          />
          <Stagger className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {[
              ['Habitants', 'Ils signalent et reçoivent.'],
              ['Mairie', 'Elle valide et suit les bassins.'],
              ['Protection civile', 'Elle envoie les équipes.'],
              ['Open-Meteo', 'La source météo, publique.'],
            ].map(([title, text]) => (
              <StaggerItem key={title}>
                <HoverCard className="surface h-full p-4">
                  <h3 className="font-display text-lg">{title}</h3>
                  <p className="clamp-2 text-sm text-muted">{text}</p>
                </HoverCard>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="mt-10 md:mt-16">
          <PageHero
            tone="band"
            heading="h2"
            photo={photos.lekki}
            title="Votre quartier mérite d’être prévenu"
            short="Rejoignez les alertes, ou dites ce que vous voyez."
            long="Rejoignez les alertes, ou dites ce que vous voyez dans la rue."
          >
            <Link to="/connexion" className="btn btn-primary">Créer un compte</Link>
          </PageHero>
        </section>
      </Page>
    </>
  );
}

function RainCard() {
  const { hourly, weather } = useLive();
  const reduce = useReducedMotion();
  const hours = hourly.hours.length ? hourly.hours : weather.days.map((day, index) => ({ hour: index, mm: day.precipitationMm }));
  const max = Math.max(...hours.map((hour) => hour.mm), 1);
  return (
    <div className="surface relative p-4 md:p-5">
      <p className="text-sm text-muted">Précipitations · Open-Meteo</p>
      <div className="mt-6 flex h-32 items-end gap-2 md:h-40">
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
      <p className="clamp-2 mt-3 text-xs text-muted">{weather.demo ? 'Série de démonstration si Open-Meteo ne répond pas.' : weather.source}</p>
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
    <div>
      <div className="px-4 pt-4">
        <PageHero
          tone="compact"
          photo={photos.lekki}
          kicker="Carte"
          title="Carte live"
          short="Signalements ouverts à Lomé. Contraste nuit."
          long="Signalements ouverts à Lomé. La carte reste en contraste nuit, quel que soit le thème."
        />
      </div>
      <div className="mt-4 grid min-h-[70vh] lg:grid-cols-[380px_1fr]">
        <div className="order-2 max-h-[50vh] overflow-auto p-4 lg:order-1 lg:max-h-none">
          <Stagger className="flex flex-col gap-3">
            {live.loading && <Skeleton className="h-24" />}
            {!live.loading && live.reports.length === 0 && (
              <QuietNote title="Aucun signalement" text="La carte est calme. Le premier point apparaîtra ici." />
            )}
            {live.reports.map((report) => (
              <StaggerItem key={report.id}>
                <button type="button" className="tap-row text-left" onClick={() => setSelected(report.id)}>
                  <HoverCard className={`surface w-full p-4 ${current?.id === report.id ? 'ring-1 ring-cyan' : ''}`}>
                    <div className="flex items-center justify-between gap-2">
                      <strong className="min-w-0">{report.placeLabel}</strong>
                      <span className="tag shrink-0" data-tone={waterTone(report.waterLevel)}>{report.waterLevelLabel}</span>
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
    </div>
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
          <div className="surface mx-auto max-w-lg p-6 text-center md:p-8">
            <motion.div
              className="icon-bubble mx-auto"
              data-tone="ok"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <ShieldCheck />
            </motion.div>
            <h1 className="display-sm mt-4">Signalement envoyé</h1>
            <p className="mt-2 text-muted">Référence {done.reference}. Il sera visible après vérification.</p>
            <Link to="/carte" className="btn btn-primary mt-6">Voir la carte</Link>
          </div>
        </Reveal>
      </Page>
    );
  }

  return (
    <Page>
      <PageHero
        tone="band"
        photo={photos.telephone}
        kicker="Signalement"
        title="Signaler l’eau"
        short="Une photo, un lieu, un niveau. L’anonyme est accepté."
        long="Une photo, un lieu, un niveau. Le signalement anonyme est accepté."
      />
      <form className="mt-4 grid gap-4 md:grid-cols-[1fr_320px]" onSubmit={submit}>
        <div className="surface flex min-w-0 flex-col gap-4 p-4 md:p-5">
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
            <label className="btn max-w-full cursor-pointer">
              <Camera size={16} /> <span className="truncate">{photo ? photo.name : 'Photo'}</span>
              <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
            </label>
          </div>
          <Press className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer'}</Press>
        </div>
        <MapView
          className="h-64 overflow-hidden rounded-[20px] md:h-80"
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
      <PageHero
        tone="band"
        photo={photos.sao}
        kicker="Parcours"
        title="Comment ça marche"
        short="Pluie prévue, signalements, bassins suivis."
        long="Edzii-Nku croise la pluie prévue (Open-Meteo), les signalements des habitants et les bassins suivis par la mairie et la protection civile."
      />
      <Stagger className="mt-4 grid gap-3">
        {[
          ['1', 'Vous choisissez un quartier', 'L’abonnement limite les alertes à votre zone.'],
          ['2', 'Une alerte part avant la pluie', 'Français de référence. Éwé marqué à relire.'],
          ['3', 'Vous confirmez ce que vous voyez', 'Photo, position, niveau. La mairie valide ou écarte.'],
          ['4', 'Les équipes suivent les points noirs', 'Bassins, caniveaux, équipes sur le terrain.'],
        ].map(([step, title, text]) => (
          <StaggerItem key={step}>
            <HoverCard className="surface flex gap-4 p-4 md:p-5">
              <span className="avatar">{step}</span>
              <div className="min-w-0">
                <h2 className="font-display text-xl">{title}</h2>
                <p className="clamp-3 mt-1 text-muted">{text}</p>
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
      <PageHero
        tone="band"
        photo={photos.kampala}
        kicker="Territoire"
        title="Communes suivies"
        short="Quartiers dans PostGIS. Certaines limites sont approximatives."
        long="Les polygones de quartiers sont dans PostGIS. Certaines limites restent approximatives."
      />
      {loading ? <Skeleton className="mt-4 h-40" /> : (
        <Stagger className="mt-4 grid gap-3 md:grid-cols-2">
          {communes.map((commune) => (
            <StaggerItem key={commune}>
              <HoverCard className="surface p-5">
                <h2 className="display-sm">{commune}</h2>
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
        <PageHero
          tone="compact"
          photo={photos.telephone}
          kicker="WhatsApp"
          title="WhatsApp"
          short="Simulation. Le bot réel répond sur le webhook."
          long="Simulation du parcours. Le bot réel répond sur le webhook Cloud API de l’API."
        />
        <div className="wa">
          <div className="wa-top">
            <img src="/logo-mark.svg" alt="" width={36} height={36} />
            <div className="min-w-0">
              <strong>Edzii-Nku</strong>
              <p className="text-xs" style={{ color: 'var(--map-muted)' }}>en ligne</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="wa-bubble">Bienvenue. Quelle langue ?{'\n'}Tia wò gbe. (éwé à relire)</div>
            {step !== 'lang' && <div className="wa-bubble wa-out">{ewe ? 'Eʋegbe' : 'Français'}</div>}
            {step !== 'lang' && (
              <div className="wa-bubble">{ewe ? 'Tia wò kɔƒe. (à relire)' : 'Choisissez votre quartier.'}</div>
            )}
            {hood && <div className="wa-bubble wa-out">{hood.name}</div>}
            {hood && step !== 'hood' && step !== 'lang' && (
              <div className="wa-bubble">{ewe
                ? `Wò ŋkɔ le ${hood.name}. (à relire)`
                : `Abonné·e à ${hood.name}. Envoyez une photo, ou attendez l’alerte.`}</div>
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
      <PageHero
        tone="compact"
        photo={photos.entraide}
        kicker="Compte"
        title={mode === 'login' ? 'Connexion' : 'Créer un compte'}
        short="Habitant, mairie ou protection civile."
        long="Le même compte sert la page publique et, pour les équipes, le tableau de bord."
      />
      <motion.form className="surface mx-auto mt-4 max-w-md p-4 md:p-6" onSubmit={submit} layout>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="display-sm">{mode === 'login' ? 'Connexion' : 'Inscription'}</h2>
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
        <Copy
          className="demo-note mt-4"
          short="Démo : afi@, mairie@ ou pc@edzii.local — Demo-Edzii-2026."
          long="Comptes de démo : afi@edzii.local, mairie@edzii.local, pc@edzii.local — mot de passe Demo-Edzii-2026. Google OAuth est prévu, pas encore branché."
        />
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
      <PageHero
        tone="compact"
        photo={photos.kampala}
        kicker="Profil"
        title={user.displayName}
        short={user.email || user.phone || user.role}
        long={`${user.email || user.phone || 'Compte'} · ${user.role}`}
      />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="surface p-4 md:p-5">
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
        <section className="surface p-4 md:p-5">
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
      <div className="mt-4 flex flex-wrap gap-2">
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
    <button type="button" className="tap-row" onClick={onClick}>
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
  if (!items.length) return <QuietNote title="Aucun signalement" text="Quand vous enverrez une photo et un niveau, ils resteront ici." />;
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
