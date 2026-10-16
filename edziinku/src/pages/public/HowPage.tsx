import { AnimatePresence, motion } from 'motion/react';
import { BellRing, Camera, ChevronDown, CloudRain, MapPinned, ShieldCheck, Truck } from 'lucide-react';
import { useState } from 'react';
import { Photo, PhotoCredit, PageHero } from '../../components/Hero';
import { useDocumentTitle } from '../../components/layout/common';
import { PublicPage } from '../../components/layout/PublicLayout';
import { Button } from '../../components/ui/Button';
import { SectionHeader } from '../../components/ui/Decor';
import { Lift, Reveal, Stagger, StaggerItem, ease } from '../../components/ui/motion';
import { photos } from '../../data/photos';

const pillars = [
  { photo: photos.vue, title: 'Prévenir', text: 'La pluie prévue par Open-Meteo est croisée avec les zones à risque. L’alerte part avant l’averse.' },
  { photo: photos.adidogome2, title: 'Signaler', text: 'Les habitants envoient photo, position et niveau d’eau, par le web ou WhatsApp.' },
  { photo: photos.bassin, title: 'Agir', text: 'La mairie valide, la protection civile envoie les équipes, les bassins sont curés.' },
];

const timeline = [
  { icon: MapPinned, title: 'Vous choisissez un quartier', text: 'L’abonnement limite les alertes à votre zone : pas de bruit inutile.' },
  { icon: CloudRain, title: 'La pluie est surveillée', text: 'Prévisions horaires Open-Meteo, seuils par quartier, bassins à risque.' },
  { icon: BellRing, title: 'L’alerte part avant l’eau', text: 'Français de référence, éwé marqué à relire. Par WhatsApp, SMS ou l’application.' },
  { icon: Camera, title: 'Vous confirmez ce que vous voyez', text: 'Photo, position, niveau. Trois signalements concordants renforcent l’alerte.' },
  { icon: ShieldCheck, title: 'La mairie vérifie', text: 'Chaque signalement est validé, écarté ou fusionné avant affichage public.' },
  { icon: Truck, title: 'Les équipes interviennent', text: 'Points noirs priorisés, curage planifié, équipes suivies sur la carte.' },
];

const faq = [
  ['Faut-il un smartphone ?', 'Non. Les alertes arrivent aussi par SMS. Le bot WhatsApp fonctionne sur tout téléphone qui a WhatsApp.'],
  ['Mon signalement est-il anonyme ?', 'Oui si vous le souhaitez. Votre numéro n’est jamais affiché sur la carte publique.'],
  ['Pourquoi l’éwé est « à relire » ?', 'Les messages éwé sont un premier jet. Ils doivent être relus par un locuteur natif avant d’être définitifs.'],
  ['D’où viennent les prévisions ?', 'D’Open-Meteo, un service de données météo ouvert. Les chiffres affichés en démonstration sont indiqués comme tels.'],
  ['Qui voit les signalements ?', 'Les habitants voient les signalements validés. La mairie et la protection civile voient aussi la file à vérifier.'],
];

export function HowPage() {
  useDocumentTitle('Comment ça marche');
  const [open, setOpen] = useState<number | null>(0);
  return (
    <PublicPage>
      <PageHero
        photo={photos.togbagan}
        eyebrow="Le parcours"
        title="Comment ça marche"
        short="Prévenir, signaler, agir."
        long="Edzii-Nku croise la pluie prévue, les signalements des habitants et le suivi des bassins par la mairie et la protection civile."
      >
        <Button to="/whatsapp" variant="primary"><BellRing size={17} /> Recevoir les alertes</Button>
      </PageHero>

      <section className="flex flex-col gap-8">
        <SectionHeader eyebrow="Trois piliers" title="Une boucle courte, du ciel à la rue" />
        <Stagger className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <StaggerItem key={pillar.title}>
              <Lift className="card card-hover h-full overflow-hidden p-0">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Photo photo={pillar.photo} className="h-full w-full object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
                  <span className="overlay-panel t-num absolute top-3 left-3 rounded-xl px-2.5 py-1 text-sm font-semibold">0{index + 1}</span>
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <h3 className="t-h3 text-lg">{pillar.title}</h3>
                  <p className="text-sm text-muted">{pillar.text}</p>
                  <PhotoCredit photo={pillar.photo} className="mt-1" />
                </div>
              </Lift>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-14">
        <SectionHeader eyebrow="Étape par étape" title="Ce qui se passe, dans l’ordre" lead="Six étapes, de l’abonnement à l’intervention." />
        <ol className="timeline flex flex-col gap-3">
          {timeline.map((item, index) => (
            <Reveal as="li" key={item.title} delay={index * 0.05} className="relative flex gap-4">
              <span className="icon-tile relative z-[1] h-9 w-9 rounded-full" style={{ background: 'var(--surface-solid)', boxShadow: 'inset 0 0 0 1.5px var(--accent-line)' }}>
                <item.icon size={16} />
              </span>
              <div className="card card-hover min-w-0 flex-1 p-4">
                <h3 className="t-h3">{item.title}</h3>
                <p className="mt-1 text-sm text-muted">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-14">
        <SectionHeader eyebrow="Questions" title="Questions fréquentes" />
        <div className="flex flex-col gap-2.5">
          {faq.map(([question, answer], index) => {
            const on = open === index;
            return (
              <Reveal key={question} delay={index * 0.04} className="card overflow-hidden p-0">
                <button
                  type="button"
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-3 text-left"
                  aria-expanded={on}
                  onClick={() => setOpen(on ? null : index)}
                >
                  <span className="font-display font-semibold">{question}</span>
                  <motion.span animate={{ rotate: on ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 text-muted">
                    <ChevronDown size={18} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <p className="px-5 pb-5 text-sm text-muted">{answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </section>
    </PublicPage>
  );
}
