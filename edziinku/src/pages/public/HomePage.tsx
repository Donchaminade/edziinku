import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BellRing,
  Building2,
  Camera,
  CheckCircle2,
  Clock3,
  CloudRain,
  Languages,
  MapPinned,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Users,
  Waves,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AreaChart, BarChart } from '../../components/Charts';
import { HeroCarousel } from '../../components/HeroCarousel';
import { Photo, PhotoCredit } from '../../components/Hero';
import { useDocumentTitle } from '../../components/layout/common';
import { DataStatus } from '../../components/layout/PublicLayout';
import { MapView, type MapPin } from '../../components/MapView';
import { Button } from '../../components/ui/Button';
import { Container, Copy, Curves, SectionHeader, WaveDivider } from '../../components/ui/Decor';
import { Segmented } from '../../components/ui/Form';
import { CountUp, Lift, Reveal, Skeleton, Stagger, StaggerItem, ease } from '../../components/ui/motion';
import { photos } from '../../data/photos';
import { ago, alertLevelLabel, alertTone, clock, riskTone, waterTone } from '../../lib/format';
import { useLive } from '../../lib/useCatalog';

export function HomePage() {
  useDocumentTitle('');
  return (
    <>
      <HeroCarousel>
        {() => <HeroText />}
      </HeroCarousel>
      <Stats />
      <Problem />
      <Steps />
      <AlertNow />
      <MapTeaser />
      <Channels />
      <ForTeams />
      <Neighborhoods />
      <FinalCta />
    </>
  );
}

function HeroText() {
  const item = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } };
  return (
    <motion.div
      className="flex max-w-xl flex-col gap-4 md:gap-5"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } } }}
    >
      <motion.div variants={item} className="flex flex-wrap items-center gap-2">
        <DataStatus />
        <span className="pill hidden sm:inline-flex"><CloudRain size={14} className="text-cyan" /> Grand Lomé · saison des pluies</span>
      </motion.div>
      <motion.h1 variants={item} className="t-display">
        L’œil de la pluie <span className="t-accent">veille sur votre quartier</span>
      </motion.h1>
      <motion.div variants={item}>
        <Copy
          className="t-lead"
          short="Alertes en français et en éwé, avant que l’eau n’entre."
          long="Edzii-Nku prévient les quartiers de Lomé avant que l’eau n’entre dans la cour : alertes en français et en éwé, signalements des habitants et carte partagée avec la mairie."
        />
      </motion.div>
      <motion.div variants={item} className="flex gap-2.5 max-sm:[&>*]:flex-1">
        <Button to="/whatsapp" variant="primary" size="lg"><BellRing size={18} /> <span className="sm:hidden">Alertes</span><span className="max-sm:hidden">Recevoir les alertes</span></Button>
        <Button to="/signaler" size="lg"><Camera size={18} /> Signaler</Button>
      </motion.div>
      <motion.div variants={item} className="hidden flex-wrap gap-x-6 gap-y-3 pt-1 md:flex">
        {[
          [MessageCircle, 'WhatsApp', 'sans application'],
          [Smartphone, 'SMS', 'sans internet'],
          [Languages, 'FR · Éwé', 'alertes bilingues'],
        ].map(([Icon, title, text]) => {
          const I = Icon as typeof MessageCircle;
          return (
            <div key={title as string} className="flex items-center gap-2.5">
              <span className="icon-tile icon-tile-sm"><I size={17} /></span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold">{title as string}</span>
                <span className="block text-xs text-muted">{text as string}</span>
              </span>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

function Stats() {
  const live = useLive();
  const stats = [
    { value: live.neighborhoods.length, label: 'quartiers suivis', short: 'quartiers', icon: MapPinned },
    { value: live.reports.length, label: 'signalements ouverts', short: 'signalements', icon: Camera },
    { value: live.alerts.length, label: 'alertes publiées', short: 'alertes', icon: BellRing },
    { value: live.basins.length, label: 'bassins surveillés', short: 'bassins', icon: Waves },
  ];
  return (
    <Container className="relative z-10 -mt-10 md:-mt-14">
      <Stagger className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
        {stats.map((stat) => (
          <StaggerItem key={stat.label}>
            <Lift className="card flex items-center gap-3 p-4 md:p-5">
              <span className="icon-tile hidden sm:grid"><stat.icon size={20} /></span>
              <div className="min-w-0">
                {live.loading ? <Skeleton className="h-8 w-14" /> : <CountUp value={stat.value} className="t-num block text-2xl font-semibold md:text-3xl" />}
                <p className="truncate text-xs text-muted md:text-sm"><span className="md:hidden">{stat.short}</span><span className="max-md:hidden">{stat.label}</span></p>
              </div>
            </Lift>
          </StaggerItem>
        ))}
      </Stagger>
    </Container>
  );
}

function Problem() {
  const lead = useLive().alerts.find((alert) => alert.rainMmMax);
  const points = [
    { icon: Clock3, title: 'L’eau va plus vite que l’info', text: 'Une averse remplit la cour avant que le quartier ne soit prévenu.' },
    { icon: BellRing, title: 'Prévenir avant la pluie', text: 'L’alerte part dès que la pluie prévue menace votre quartier.' },
    { icon: Users, title: 'Les habitants voient en premier', text: 'Photo, lieu et niveau d’eau remontent tout de suite à la mairie.' },
  ];
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <Curves className="top-10 -left-40 h-72 w-[720px] max-w-none" />
      <Container className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative">
          <div className="photo-frame aspect-[4/3] md:aspect-[5/4]">
            <Photo photo={photos.adidogome2} className="h-full w-full" sizes="(min-width: 1024px) 50vw, 100vw" />
            <div className="photo-tag">
              <PhotoCredit photo={photos.adidogome2} />
            </div>
          </div>
          {lead && (
          <motion.div
            className="overlay-panel absolute -right-2 -bottom-6 hidden w-60 rounded-2xl p-4 sm:block md:-right-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
          >
            <p className="truncate text-xs text-muted">Pluie prévue · {lead.neighborhoodName ?? 'Grand Lomé'}</p>
            <p className="t-num mt-1 text-3xl font-semibold">{lead.rainMmMin}–{lead.rainMmMax} <span className="text-base text-muted">mm</span></p>
            <p className="mt-1 text-xs text-warn">{alertLevelLabel(lead.level)}</p>
          </motion.div>
          )}
        </Reveal>
        <div className="flex flex-col gap-8">
          <SectionHeader
            eyebrow="Pourquoi Edzii-Nku"
            title={<>À Lomé, l’eau entre <span className="t-accent">avant l’alerte</span></>}
            lead={<Copy short="Le quartier l’apprend trop tard pour surélever ses biens." long="Caniveaux bouchés, bassins qui débordent : le quartier l’apprend souvent quand il est déjà trop tard pour surélever les biens ou changer d’itinéraire." />}
          />
          <Stagger className="grid gap-3">
            {points.map((point) => (
              <StaggerItem key={point.title}>
                <Lift className="card card-hover flex gap-4 p-4">
                  <span className="icon-tile"><point.icon size={20} /></span>
                  <div className="min-w-0">
                    <h3 className="t-h3">{point.title}</h3>
                    <p className="mt-1 text-sm text-muted">{point.text}</p>
                  </div>
                </Lift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}

function Steps() {
  const steps = [
    { title: 'Choisir son quartier', text: 'L’alerte ne part que là où vous vivez.' },
    { title: 'Recevoir le message', text: 'WhatsApp, SMS ou cette application.' },
    { title: 'Dire ce que l’on voit', text: 'Une photo et un niveau d’eau suffisent.' },
    { title: 'La ville agit', text: 'Validation, bassins à curer, équipes envoyées.' },
  ];
  return (
    <section className="relative">
      <WaveDivider />
      <div className="section-alt relative overflow-hidden py-14 md:py-20">
        <Curves className="right-0 -bottom-10 h-64 w-[640px] max-w-none" variant="b" />
        <Container className="relative flex flex-col gap-10">
          <SectionHeader align="center" eyebrow="Le parcours" title="Comment ça marche" lead="Quatre étapes, du quartier à l’équipe de terrain." />
          <Stagger className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
            {steps.map((step, index) => (
              <StaggerItem key={step.title} className="h-full">
                <Lift className="card card-hover flex h-full items-center gap-4 p-4 sm:flex-col sm:items-start sm:gap-3 sm:p-5 md:p-6">
                  <span className="step-num text-[34px] sm:text-[44px]">0{index + 1}</span>
                  <div className="min-w-0">
                    <h3 className="t-h3">{step.title}</h3>
                    <p className="mt-0.5 text-sm text-muted sm:mt-1.5">{step.text}</p>
                  </div>
                </Lift>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="flex justify-center">
            <Button to="/comment">En savoir plus <ArrowRight size={16} /></Button>
          </Reveal>
        </Container>
      </div>
      <WaveDivider flip />
    </section>
  );
}

function AlertNow() {
  const live = useLive();
  const [lang, setLang] = useState<'fr' | 'ewe'>('fr');
  const lead = live.alerts[0];
  const hours = live.hourly.hours.length ? live.hourly.hours : lead?.rainSeries ?? [];
  const week = live.weather.days.map((day) => ({ key: day.date, label: day.label, value: Math.round(day.precipitationMm), muted: day.forecast }));

  return (
    <section className="py-16 md:py-24">
      <Container className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="En ce moment"
          title="L’alerte du jour"
          lead={<Copy short="Le français fait foi. L’éwé est à relire." long="Le message français fait foi. La version éwé est un premier jet, marqué à relire par un locuteur natif." />}
          action={<span className="hidden md:inline-flex"><DataStatus /></span>}
        />
        <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <Reveal className="card flex flex-col gap-5 p-5 md:p-7">
            {live.loading || !lead ? <Skeleton className="h-48" /> : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="icon-tile icon-tile-lg" data-tone={alertTone(lead.level)}><CloudRain size={24} /></span>
                    <div className="min-w-0">
                      <span className="badge badge-dot" data-tone={alertTone(lead.level)}>{alertLevelLabel(lead.level)}</span>
                      <h3 className="t-h3 mt-2 text-xl">{lead.title}</h3>
                      <p className="mt-0.5 text-sm text-muted">
                        {lead.neighborhoodName ?? 'Grand Lomé'}
                        {lead.startsAt && lead.endsAt ? ` · ${clock(lead.startsAt)} – ${clock(lead.endsAt)}` : ` · ${ago(lead.createdAt)}`}
                      </p>
                    </div>
                  </div>
                  <Segmented label="Langue du message" value={lang} onChange={setLang} options={[{ value: 'fr', label: 'Français' }, { value: 'ewe', label: 'Eʋegbe' }]} />
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={lang}
                    className="text-lg leading-relaxed text-text2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {lang === 'fr' ? lead.body : lead.bodyEwe || 'Version éwé en préparation.'}
                  </motion.p>
                </AnimatePresence>
                {lang === 'ewe' && lead.eweNeedsReview && (
                  <p className="note"><Languages size={16} /> Texte éwé à relire par un locuteur natif.</p>
                )}
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ['Pluie prévue', lead.rainMmMin && lead.rainMmMax ? `${lead.rainMmMin}–${lead.rainMmMax} mm` : '—'],
                    ['Source', lead.source ?? 'Mairie'],
                    ['Publiée', ago(lead.createdAt)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-line p-3">
                      <p className="text-xs text-muted">{label}</p>
                      <p className="t-num mt-1 truncate font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-auto flex flex-col gap-2 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted">Recevez la prochaine directement sur votre téléphone.</p>
                  <Button to="/whatsapp" variant="whatsapp" size="sm"><MessageCircle size={16} /> Recevoir sur WhatsApp</Button>
                </div>
              </>
            )}
          </Reveal>
          <div className="grid gap-4">
            <Reveal delay={0.1} className="card p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="t-h3 text-[15px]">Ce soir, heure par heure</p>
                <span className="badge" data-tone="neutral">mm</span>
              </div>
              {hours.length > 1 ? <AreaChart points={hours.map((hour) => ({ x: `${hour.hour}h`, y: hour.mm }))} /> : <Skeleton className="h-36" />}
            </Reveal>
            <Reveal delay={0.18} className="card p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="t-h3 text-[15px]">Sept jours à Lomé</p>
                <span className="flex items-center gap-3 text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm" style={{ background: 'var(--water)' }} /> Observé</span>
                  <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm" style={{ boxShadow: 'inset 0 0 0 1.5px var(--cyan)' }} /> Prévu</span>
                </span>
              </div>
              <BarChart data={week} height={150} />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

function MapTeaser() {
  const live = useLive();
  const pins = useMemo<MapPin[]>(() => live.reports.map((report) => ({
    id: report.id, lat: report.latitude, lng: report.longitude, label: `${report.placeLabel} · ${report.waterLevelLabel}`, tone: waterTone(report.waterLevel),
  })), [live.reports]);
  const latest = live.reports.slice(0, 3);
  return (
    <section className="pb-16 md:pb-24">
      <Container>
        <Reveal className="card grid overflow-hidden p-0 lg:grid-cols-[1fr_380px]">
          <MapView pins={pins} className="h-72 md:h-[420px] lg:h-full lg:min-h-[440px]" interactive={false} />
          <div className="flex flex-col gap-4 p-5 md:p-7">
            <span className="t-eyebrow">Carte live</span>
            <h2 className="t-h2">Voir l’eau déjà signalée</h2>
            <p className="text-sm text-muted">Les signalements validés, quartier par quartier.</p>
            <div className="flex flex-col gap-2">
              {live.loading ? <Skeleton className="h-36" /> : latest.map((report) => (
                <div key={report.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{report.placeLabel}</p>
                    <p className="text-xs text-muted">{ago(report.createdAt)}</p>
                  </div>
                  <span className="badge badge-dot shrink-0" data-tone={waterTone(report.waterLevel)}>{report.waterLevelLabel}</span>
                </div>
              ))}
            </div>
            <Button to="/carte" variant="primary" className="mt-auto">Ouvrir la carte <ArrowRight size={16} /></Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function Channels() {
  const channels = [
    { icon: MessageCircle, tone: 'whatsapp', title: 'WhatsApp', text: 'Abonnez-vous à votre quartier et répondez par une photo.', to: '/whatsapp', cta: 'Essayer le bot' },
    { icon: Smartphone, tone: 'water', title: 'Application', text: 'Installable depuis ce site, même sur un petit forfait.', to: '/connexion', cta: 'Créer un compte' },
    { icon: BellRing, tone: undefined, title: 'SMS', text: 'Pour les téléphones simples, sans internet.', to: '/comment', cta: 'Comment ça marche' },
  ];
  return (
    <section className="relative overflow-hidden py-16 md:py-24 section-alt">
      <Curves className="-top-6 -right-20 h-72 w-[760px] max-w-none" />
      <Container className="relative grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div className="flex flex-col gap-6">
          <SectionHeader eyebrow="Trois canaux" title="L’alerte arrive là où vous êtes" lead={<Copy short="Même sans smartphone." long="Même sans smartphone, même avec peu de données mobiles." />} />
          <Reveal className="photo-frame hidden aspect-[16/10] lg:block">
            <Photo photo={photos.rue} className="h-full w-full" sizes="40vw" />
            <div className="photo-tag"><PhotoCredit photo={photos.rue} /></div>
          </Reveal>
        </div>
        <Stagger className="grid gap-3">
          {channels.map((channel) => (
            <StaggerItem key={channel.title}>
              <Lift className="card card-hover relative flex items-start gap-3.5 p-4 sm:items-center sm:gap-4 sm:p-5">
                <span className="icon-tile sm:h-14 sm:w-14 sm:rounded-[18px]" data-tone={channel.tone}><channel.icon size={22} /></span>
                <div className="min-w-0 flex-1">
                  <h3 className="t-h3 text-lg">{channel.title}</h3>
                  <p className="mt-0.5 text-sm text-muted sm:mt-1">{channel.text}</p>
                  <Link to={channel.to} className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-cyan after:absolute after:inset-0 after:content-[''] sm:hidden">
                    {channel.cta} <ArrowRight size={15} />
                  </Link>
                </div>
                <Link to={channel.to} className="hidden min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-cyan sm:inline-flex">
                  {channel.cta} <ArrowRight size={15} />
                </Link>
              </Lift>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

function ForTeams() {
  const validated = useLive().reports.find((report) => report.status === 'VALIDE');
  const features = [
    { icon: ShieldCheck, text: 'Modération des signalements en un geste' },
    { icon: BellRing, text: 'Alertes ciblées par quartier, FR et éwé' },
    { icon: Waves, text: 'Suivi des bassins et caniveaux à curer' },
    { icon: Users, text: 'Équipes de terrain et historique partagé' },
  ];
  return (
    <section className="py-16 md:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 flex flex-col gap-6 lg:order-1">
          <SectionHeader
            eyebrow="Mairie et protection civile"
            title="Un tableau de bord pour agir vite"
            lead={<Copy short="Voir, valider, prévenir, envoyer." long="La même carte que les habitants, avec en plus la modération, la diffusion des alertes et le suivi des équipes." />}
          />
          <Stagger className="grid gap-2.5 sm:grid-cols-2">
            {features.map((feature) => (
              <StaggerItem key={feature.text} className="flex items-start gap-3 rounded-2xl border border-line p-3.5">
                <span className="icon-tile icon-tile-sm"><feature.icon size={17} /></span>
                <p className="text-sm font-medium text-text2">{feature.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="flex flex-wrap gap-2.5">
            <Button to="/admin" variant="primary"><Building2 size={17} /> Espace équipes</Button>
            <Button to="/connexion">Comptes de démo</Button>
          </Reveal>
        </div>
        <Reveal className="relative order-1 lg:order-2">
          <div className="photo-frame aspect-[4/3]">
            <Photo photo={photos.toits} className="h-full w-full" sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
          {validated && (
          <motion.div
            className="overlay-panel absolute right-3 bottom-3 left-3 rounded-2xl p-4 sm:right-auto sm:-left-6 sm:w-72"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25, ease }}
          >
            <div className="flex items-center gap-3">
              <span className="icon-tile icon-tile-sm" data-tone="ok"><CheckCircle2 size={18} /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{validated.reference} validé</p>
                <p className="truncate text-xs text-muted">{validated.placeLabel} · {validated.waterLevelLabel.toLowerCase()}</p>
              </div>
            </div>
          </motion.div>
          )}
          <PhotoCredit photo={photos.toits} className="mt-2" />
        </Reveal>
      </Container>
    </section>
  );
}

function Neighborhoods() {
  const live = useLive();
  return (
    <section className="pb-16 md:pb-24">
      <Container className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Territoire"
          title="Quartiers suivis"
          lead="Niveau de risque affiché pour chaque zone."
          action={<Button to="/communes" size="sm">Toutes les communes <ArrowRight size={15} /></Button>}
        />
        {live.loading ? <Skeleton className="h-28" /> : (
          <Stagger className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {live.neighborhoods.map((hood) => (
              <StaggerItem key={hood.id}>
                <Lift className="card card-hover flex items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="icon-tile icon-tile-sm" data-tone={riskTone(hood.riskLevel)}><MapPinned size={17} /></span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{hood.name}</p>
                      <p className="truncate text-xs text-muted">{hood.commune}{hood.approximate ? ' · limites approx.' : ''}</p>
                    </div>
                  </div>
                  <span className="badge shrink-0" data-tone={riskTone(hood.riskLevel)}>{hood.riskLabel}</span>
                </Lift>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Container>
    </section>
  );
}

function FinalCta() {
  return (
    <section>
      <WaveDivider color="var(--cta-band)" />
      <div className="cta-band">
        <Container className="flex flex-col items-center gap-5 py-14 text-center md:py-20">
          <span className="t-eyebrow">Rejoindre</span>
          <h2 className="t-h2 max-w-2xl">Votre quartier mérite d’être prévenu</h2>
          <Copy className="t-lead max-w-xl" short="Recevez les alertes, ou signalez l’eau." long="Recevez les alertes de votre quartier, ou dites ce que vous voyez dans la rue." />
          <div className="flex flex-wrap justify-center gap-2.5">
            <Button to="/connexion" size="lg">Créer un compte</Button>
            <Button to="/signaler" size="lg"><Camera size={18} /> Signaler</Button>
          </div>
        </Container>
      </div>
    </section>
  );
}
