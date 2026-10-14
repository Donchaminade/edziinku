import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  Camera,
  Download,
  Droplets,
  Home,
  LayoutDashboard,
  LogIn,
  Map,
  MapPinned,
  Menu,
  MessageCircle,
  Phone,
  UserRound,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router';
import { isStaff, useAuth } from '../../context/AuthContext';
import { useLive } from '../../lib/useCatalog';
import { initials } from '../../lib/format';
import { useInstallPrompt } from '../../lib/useInstallPrompt';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../ui/Button';
import { Container, Curves } from '../ui/Decor';
import { LiveDot } from '../ui/motion';
import { Sheet } from '../ui/Overlay';
import { AnimatedOutlet, Brand, ThemeToggle } from './common';

const mainLinks = [
  { to: '/carte', label: 'Carte live' },
  { to: '/signaler', label: 'Signaler' },
  { to: '/comment', label: 'Comment ça marche' },
  { to: '/communes', label: 'Communes' },
  { to: '/whatsapp', label: 'Alertes WhatsApp' },
];

export function DataStatus({ compact }: { compact?: boolean }) {
  const live = useLive();
  const label = live.loading ? 'Connexion…' : live.source === 'api' ? 'Données à jour' : live.waking ? 'Réveil du serveur…' : 'Démonstration';
  const tone = live.source === 'api' ? 'ok' : live.loading || live.waking ? 'info' : 'warn';
  const title = live.source === 'demo'
    ? 'L’API ne répond pas : jeu de démonstration affiché.'
    : live.partial ? 'L’API répond, mais certaines données n’ont pas pu être chargées.' : 'Données servies par l’API Edzii-Nku.';
  return (
    <span className="pill" title={title}>
      <LiveDot tone={tone} />
      {compact ? (live.source === 'api' ? 'À jour' : 'Démo') : label}
    </span>
  );
}

function AccountButton() {
  const { user } = useAuth();
  if (!user) {
    return (
      <Button to="/connexion" variant="primary" size="sm" className="hidden sm:inline-flex">
        <LogIn size={16} /> Connexion
      </Button>
    );
  }
  const to = isStaff(user.role) ? '/admin' : '/profil';
  return (
    <NavLink to={to} className="hidden min-h-11 items-center gap-2 rounded-xl pr-3 pl-1 hover:bg-[var(--accent-soft)] sm:flex">
      <span className="avatar h-9 w-9 text-xs">{initials(user.displayName)}</span>
      <span className="max-w-28 truncate text-sm font-semibold">{user.displayName.split(' ')[0]}</span>
    </NavLink>
  );
}

const photoHeroPaths = ['/', '/carte', '/signaler', '/comment', '/communes', '/whatsapp', '/credits'];

function Header() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  useMotionValueEvent(scrollY, 'change', (value) => setSolid(value > 24));
  const overHero = !solid && photoHeroPaths.some((path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)));

  return (
    <header className="site-header">
      <motion.div
        className="site-header-bar glass"
        data-solid={solid}
        data-over-hero={overHero}
        initial={reduce ? false : { y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Brand />
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigation principale">
          {mainLinks.map((link) => {
            const on = location.pathname.startsWith(link.to);
            return (
              <NavLink key={link.to} to={link.to} className="nav-link isolate">
                {on && (
                  <motion.span
                    layoutId="nav-pill"
                    className="nav-link-pill"
                    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 450, damping: 36 }}
                  />
                )}
                {link.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="flex items-center gap-1">
          <span className="hidden xl:inline-flex"><DataStatus /></span>
          <ThemeToggle />
          <AccountButton />
          {solid && (
            <Button to="/signaler" variant="primary" size="sm" className="btn-header-cta hidden lg:inline-flex">
              <Camera size={16} /> Signaler
            </Button>
          )}
        </div>
      </motion.div>
    </header>
  );
}

/**
 * Barre d’onglets qui s’efface quand on descend dans la page et revient dès
 * qu’on remonte, qu’on approche du haut ou du bas, ou qu’une feuille s’ouvre.
 */
export function useHideOnScroll(force = false) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);
  useMotionValueEvent(scrollY, 'change', (value) => {
    const delta = value - last.current;
    last.current = value;
    if (reduce || window.innerWidth >= 1024) { setHidden(false); return; }
    const bottom = window.innerHeight + value >= document.documentElement.scrollHeight - 48;
    if (value < 120 || bottom || delta < -6) setHidden(false);
    else if (delta > 8) setHidden(true);
  });
  useEffect(() => { if (force) setHidden(false); }, [force]);
  return hidden && !force;
}

export function BottomNav({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  const location = useLocation();
  const reduce = useReducedMotion();
  const hidden = useHideOnScroll(menuOpen);
  const tabs = [
    { to: '/', label: 'Accueil', icon: Home, on: location.pathname === '/' },
    { to: '/carte', label: 'Carte', icon: Map, on: location.pathname.startsWith('/carte') },
    { to: '/signaler', label: 'Signaler', icon: Camera, on: location.pathname.startsWith('/signaler'), fab: true },
    { to: '/whatsapp', label: 'Alertes', icon: Bell, on: location.pathname.startsWith('/whatsapp') },
  ];
  return (
    <motion.nav
      className="bottom-nav glass-strong"
      aria-label="Navigation mobile"
      data-hidden={hidden}
      animate={{ y: hidden ? 'calc(100% + 24px)' : 0 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 36 }}
    >
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} className="bottom-link isolate" data-on={tab.on} data-fab={tab.fab || undefined} aria-label={tab.label}>
          {tab.fab ? (
            <>
              <motion.span className="bottom-fab" whileTap={reduce ? undefined : { scale: 0.88 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}>
                <tab.icon size={22} />
              </motion.span>
              <span>{tab.label}</span>
            </>
          ) : (
            <>
              {tab.on && (
                <motion.span
                  layoutId="bottom-pill"
                  className="bottom-link-pill"
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <motion.span whileTap={reduce ? undefined : { scale: 0.82 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}><tab.icon size={21} /></motion.span>
              <span>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
      <motion.button
        type="button"
        className="bottom-link"
        onClick={onMenu}
        aria-label="Plus de liens"
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        whileTap={reduce ? undefined : { scale: 0.9 }}
      >
        <Menu size={21} />
        <span>Plus</span>
      </motion.button>
    </motion.nav>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { canInstall, install } = useInstallPrompt();
  const { pathname } = useLocation();
  const items = [
    { to: '/comment', label: 'Comment ça marche', icon: BookOpen },
    { to: '/communes', label: 'Communes suivies', icon: MapPinned },
    { to: '/whatsapp', label: 'Alertes WhatsApp', icon: MessageCircle },
    { to: '/credits', label: 'Crédits photos', icon: Camera },
  ];
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Menu"
      subtitle={<DataStatus />}
      footer={user ? (
        <div className="grid grid-cols-2 gap-2">
          {isStaff(user.role) ? (
            <>
              <Button to="/admin" variant="primary" block onClick={onClose}><LayoutDashboard size={18} /> Tableau de bord</Button>
              <Button to="/profil" block onClick={onClose}><UserRound size={18} /> Mon profil</Button>
            </>
          ) : (
            <>
              <Button to="/profil" variant="primary" block onClick={onClose}><UserRound size={18} /> Mon profil</Button>
              <Button to="/signaler" block onClick={onClose}><Camera size={18} /> Signaler</Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button to="/connexion" variant="primary" block onClick={onClose}><LogIn size={18} /> Connexion</Button>
          <Button to="/connexion?mode=inscription" block onClick={onClose}>Créer un compte</Button>
        </div>
      )}
    >
      <div className="grid gap-2">
        {items.map((item) => {
          const on = pathname.startsWith(item.to);
          return (
            <NavLink key={item.to} to={item.to} onClick={onClose} className="card card-hover flex min-h-14 items-center gap-3 rounded-2xl px-4" style={on ? { borderColor: 'var(--accent-line)' } : undefined}>
              <span className="icon-tile icon-tile-sm"><item.icon size={18} /></span>
              <span className="font-semibold">{item.label}</span>
              {on && <span className="badge ml-auto">Ici</span>}
            </NavLink>
          );
        })}
        <div className="mt-2 flex items-center justify-between rounded-2xl border border-line px-4 py-1">
          <span className="flex flex-col">
            <span className="text-sm font-semibold">Thème</span>
            <span className="text-xs text-muted">{theme === 'dark' ? 'Nuit' : 'Clair'}</span>
          </span>
          <ThemeToggle />
        </div>
        {canInstall && (
          <Button variant="secondary" block onClick={() => { void install().then((ok) => { if (ok) onClose(); }); }}>
            <Download size={18} /> Installer l’application
          </Button>
        )}
        <a href="tel:170" className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-line text-sm font-semibold" style={{ background: 'var(--alert-soft)', color: 'var(--alert-text)' }}>
          <Phone size={16} /> Urgence : appeler le 170
        </a>
      </div>
    </Sheet>
  );
}

function Footer() {
  const columns = [
    { title: 'Plateforme', links: [['/carte', 'Carte live'], ['/signaler', 'Signaler l’eau'], ['/comment', 'Comment ça marche'], ['/communes', 'Communes']] },
    { title: 'Alertes', links: [['/whatsapp', 'Bot WhatsApp'], ['/connexion', 'Créer un compte'], ['/admin', 'Espace équipes']] },
    { title: 'Infos', links: [['/credits', 'Crédits photos'], ['https://open-meteo.com', 'Open-Meteo'], ['https://www.openstreetmap.org/copyright', 'OpenStreetMap']] },
  ];
  return (
    <footer className="site-footer relative mt-20 overflow-hidden">
      <div className="px-4 pt-1 sm:px-6"><div className="footer-band mx-auto max-w-[1200px]" aria-hidden><i /><i /><i /></div></div>
      <Curves className="-top-10 right-0 h-56 w-[640px] max-w-none opacity-40" variant="b" />
      <Container className="relative grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-16">
        <div className="flex flex-col gap-4">
          <Brand />
          <p className="max-w-xs text-sm text-muted">
            Alertes inondation pour Lomé, en français et en éwé. Prévenir, signaler, agir ensemble.
          </p>
          <a href="tel:170" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold">
            <Phone size={16} className="text-alert" /> Urgence : 170
          </a>
        </div>
        <div className="grid grid-cols-2 gap-8 md:contents">
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col">
              <p className="t-eyebrow mb-2 text-muted">{column.title}</p>
              {column.links.map(([to, label]) => (
                to.startsWith('http') ? (
                  <a key={to} href={to} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm text-text2 hover:text-text">
                    {label} <ArrowUpRight size={13} />
                  </a>
                ) : (
                  <NavLink key={to} to={to} className="inline-flex min-h-11 items-center text-sm text-text2 hover:text-text">{label}</NavLink>
                )
              ))}
            </div>
          ))}
        </div>
      </Container>
      <Container className="relative flex flex-col gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Edzii-Nku · Hackathon Climat & Innovation, Lomé</span>
        <span className="inline-flex items-center gap-2"><Droplets size={14} /> Pluie prévue : Open-Meteo · Fonds de carte : Esri, OpenStreetMap</span>
      </Container>
    </footer>
  );
}

export function PublicPage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`below-header ${className ?? ''}`}>
      <Container className="flex flex-col gap-8 md:gap-14">{children}</Container>
    </div>
  );
}

export function PublicLayout() {
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setMenu(false), [pathname]);
  return (
    <div className="has-bottom-nav min-h-screen">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:bg-[var(--surface-solid)] focus:p-3">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu">
        <AnimatedOutlet scope="public" />
      </main>
      <Footer />
      <BottomNav onMenu={() => setMenu(true)} menuOpen={menu} />
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </div>
  );
}
