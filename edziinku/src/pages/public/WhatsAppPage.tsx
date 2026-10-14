import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Camera, CheckCheck, Languages, MapPinned, MessageCircle, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PageHero } from '../../components/Hero';
import { LogoMark, useDocumentTitle } from '../../components/layout/common';
import { PublicPage } from '../../components/layout/PublicLayout';
import { Button } from '../../components/ui/Button';
import { SectionHeader } from '../../components/ui/Decor';
import { Reveal, Stagger, StaggerItem, ease } from '../../components/ui/motion';
import { photos } from '../../data/photos';
import { useLive } from '../../lib/useCatalog';
import type { Neighborhood } from '../../types';

type Step = 'lang' | 'hood' | 'ready' | 'level' | 'sent';
interface Message { id: number; out?: boolean; text: string; review?: boolean }

const now = () => new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date());

export function WhatsAppPage() {
  useDocumentTitle('Alertes WhatsApp');
  const { neighborhoods } = useLive();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>('lang');
  const [ewe, setEwe] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Bienvenue sur Edzii-Nku. Quelle langue préférez-vous ?\nTia wò gbe. (éwé à relire)' },
  ]);
  const seq = useRef(2);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [messages, typing, reduce]);

  function exchange(out: string, reply: string, next: Step, review = false) {
    setMessages((list) => [...list, { id: seq.current++, out: true, text: out }]);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((list) => [...list, { id: seq.current++, text: reply, review }]);
      setStep(next);
    }, reduce ? 50 : 900);
  }

  function chooseLang(isEwe: boolean) {
    setEwe(isEwe);
    exchange(isEwe ? 'Eʋegbe' : 'Français', isEwe ? 'Tia wò kɔƒe. (à relire)' : 'Parfait. Choisissez votre quartier.', 'hood', isEwe);
  }

  function chooseHood(hood: Neighborhood) {
    exchange(
      hood.name,
      ewe ? `Wò ŋkɔ le ${hood.name}. (à relire)` : `C’est noté : vous recevrez les alertes pour ${hood.name}.\nEnvoyez une photo si l’eau monte.`,
      'ready',
      ewe,
    );
  }

  function reset() {
    seq.current = 2;
    setMessages([{ id: 1, text: 'Bienvenue sur Edzii-Nku. Quelle langue préférez-vous ?\nTia wò gbe. (éwé à relire)' }]);
    setStep('lang');
    setEwe(false);
  }

  const features = [
    { icon: MapPinned, title: 'Un quartier, des alertes ciblées', text: 'Pas de message hors de votre zone.' },
    { icon: Languages, title: 'Français ou éwé', text: 'Le français fait foi, l’éwé est à relire.' },
    { icon: Camera, title: 'Signalez en photo', text: 'Envoyez une photo et le niveau d’eau.' },
  ];

  return (
    <PublicPage>
      <PageHero
        photo={photos.telephone}
        eyebrow="Bot WhatsApp"
        title="Le quartier dans la poche"
        short="Alertes et signalements, sans application."
        long="Abonnez-vous à votre quartier sur WhatsApp, recevez l’alerte avant la pluie et répondez par une photo quand l’eau monte."
      />

      <section className="grid items-start gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
        <div className="flex flex-col gap-8">
          <SectionHeader
            eyebrow="Essayez"
            title="Le parcours en trente secondes"
            lead="Cette simulation reproduit le bot. Le vrai bot répond via l’API WhatsApp Cloud."
          />
          <Stagger className="grid gap-3">
            {features.map((feature) => (
              <StaggerItem key={feature.title} className="card flex items-start gap-4 p-4">
                <span className="icon-tile" data-tone="whatsapp"><feature.icon size={20} /></span>
                <div className="min-w-0">
                  <h3 className="t-h3">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted">{feature.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="flex flex-wrap gap-2.5">
            <Button to="/connexion" variant="primary">Créer un compte</Button>
            <Button onClick={reset}><RotateCcw size={16} /> Recommencer</Button>
          </Reveal>
        </div>

        <Reveal className="wa-phone">
          <div className="wa-screen">
            <div className="wa-head">
              <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: 'var(--surface-solid)' }}><LogoMark size={26} /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Edzii-Nku</p>
                <p className="text-xs" style={{ color: 'var(--whatsapp)' }}>{typing ? 'écrit…' : 'en ligne'}</p>
              </div>
              <MessageCircle size={20} className="text-muted" />
            </div>
            <div ref={body} className="wa-body scroll-thin" aria-live="polite">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`wa-bubble ${message.out ? 'wa-out' : ''}`}
                    initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease }}
                    style={{ transformOrigin: message.out ? 'bottom right' : 'bottom left' }}
                  >
                    {message.text}
                    {message.review && <span className="mt-1 block text-[11px] text-warn">Texte éwé à relire</span>}
                    <time className="flex items-center justify-end gap-1">
                      {now()} {message.out && <CheckCheck size={13} style={{ color: 'var(--cyan)' }} />}
                    </time>
                  </motion.div>
                ))}
                {typing && (
                  <motion.div key="typing" className="wa-bubble flex w-16 items-center justify-center gap-1 py-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: 'var(--muted)' }}
                        animate={reduce ? undefined : { y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.9, delay: dot * 0.15 }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="wa-actions">
              {step === 'lang' && (
                <>
                  <QuickReply onClick={() => chooseLang(false)} disabled={typing}>Français</QuickReply>
                  <QuickReply onClick={() => chooseLang(true)} disabled={typing}>Eʋegbe</QuickReply>
                </>
              )}
              {step === 'hood' && neighborhoods.slice(0, 4).map((item) => (
                <QuickReply key={item.id} onClick={() => chooseHood(item)} disabled={typing}>{item.name}</QuickReply>
              ))}
              {step === 'ready' && (
                <QuickReply onClick={() => exchange('Photo envoyée', ewe ? 'Tsi le afɔ kɔ ƒe? (à relire)' : 'Merci. Jusqu’où monte l’eau ?', 'level', ewe)} disabled={typing}>
                  <Camera size={15} /> Envoyer une photo
                </QuickReply>
              )}
              {step === 'level' && ['Cheville', 'Genou', 'Taille'].map((level) => (
                <QuickReply key={level} onClick={() => exchange(level, `Signalement reçu (eau : ${level.toLowerCase()}). La mairie le vérifie. Merci !`, 'sent')} disabled={typing}>
                  {level}
                </QuickReply>
              ))}
              {step === 'sent' && <QuickReply onClick={reset}><RotateCcw size={15} /> Recommencer</QuickReply>}
            </div>
          </div>
        </Reveal>
      </section>
    </PublicPage>
  );
}

function QuickReply({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      type="button"
      className="chip"
      style={{ color: 'var(--whatsapp)', borderColor: 'var(--whatsapp-soft)' }}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -2 }}
    >
      {children}
    </motion.button>
  );
}
