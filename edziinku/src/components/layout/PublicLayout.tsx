import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  Camera,
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
import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router';
import { isStaff, useAuth } from '../../context/AuthContext';
import { useLive } from '../../lib/useCatalog';
import { initials } from '../../lib/format';
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
  const label = live.loading ? 'Connexion…' : live.source === 'api' ? 'Données en direct' : live.waking ? 'Réveil du serveur…' : 'Démonstration';
  const tone = live.source === 'api' ? 'ok' : live.loading || live.waking ? 'info' : 'warn';
  return (
    <span className="pill" title={live.source === 'demo' ? 'L’API ne répond pas : jeu de démonstration affiché.' : 'Données servies par l’API Edzii-Nku.'}>
      <LiveDot tone={tone} />
      {compact ? (live.source === 'api' ? 'Live' : 'Démo') : label}
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

function Header() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  useMotionValueEvent(scrollY, 'change', (value) => setSolid(value > 24));

  return (
    <header className="site-header">
      <motion.div
        className="site-header-bar glass"
        data-solid={solid}
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
        </div>
      </motion.div>
    </header>
  );
}

function BottomNav({ onMenu }: { onMenu: () => void }) {
  const location = useLocation();
  const reduce = useReducedMotion();
  const tabs = [
    { to: '/', label: 'Accueil', icon: Home, on: location.pathname === '/' },
    { to: '/carte', label: 'Carte', icon: Map, on: location.pathname.startsWith('/carte') },
    { to: '/signaler', label: 'Signaler', icon: Camera, on: location.pathname.startsWith('/signaler'), fab: true },
    { to: '/whatsapp', label: 'Alertes', icon: Bell, on: location.pathname.startsWith('/whatsapp') },
  ];
  return (
    <nav className="bottom-nav glass-strong" aria-label="Navigation mobile">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className="bottom-link isolate" data-on={tab.on} aria-label={tab.label}>
          {tab.fab ? (
            <>
              <motion.span className="bottom-fab" whileTap={reduce ? undefined : { scale: 0.9 }}>
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
              <motion.span whileTap={reduce ? undefined : { scale: 0.85 }}><tab.icon size={21} /></motion.span>
              <span>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
      <button type="button" className="bottom-link" onClick={onMenu} aria-label="Plus de liens">
        <Menu size={21} />
        <span>Plus</span>
      </button>
    </nav>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const items = [
    { to: '/comment', label: 'Comment ça marche', icon: BookOpen },
    { to: '/communes', label: 'Communes suivies', icon: MapPinned },
    { to: '/whatsapp', label: 'Alertes WhatsApp', icon: MessageCircle },
    { to: '/credits', label: 'Crédits photos', icon: Camera },
  ];
  return (
    <Sheet open={open} onClose={onClose} title="Menu" subtitle={<DataStatus />}>
      <div className="grid gap-2">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={onClose} className="card card-hover flex min-h-14 items-center gap-3 rounded-2xl px-4">
            <span className="icon-tile icon-tile-sm"><item.icon size={18} /></span>
            <span className="font-semibold">{item.label}</span>
          </NavLink>
        ))}
        <div className="mt-2 flex items-center justify-between rounded-2xl border border-line px-4 py-1">
          <span className="text-sm font-semibold">Thème</span>
          <ThemeToggle />
        </div>
        {user ? (
          <Button to={isStaff(user.role) ? '/admin' : '/profil'} variant="primary" block onClick={onClose}>
            {isStaff(user.role) ? <LayoutDashboard size={18} /> : <UserRound size={18} />}
            {isStaff(user.role) ? 'Tableau de bord' : 'Mon profil'}
          </Button>
        ) : (
          <Button to="/connexion" variant="primary" block onClick={onClose}><LogIn size={18} /> Connexion</Button>
        )}
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
    <footer className="relative mt-20 overflow-hidden border-t border-line section-alt">
      <Curves className="-top-10 right-0 h-56 w-[640px] max-w-none opacity-60" variant="b" />
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
    <div className={`pt-[calc(var(--header-h)+20px)] ${className ?? ''}`}>
      <Container className="flex flex-col gap-10 md:gap-14">{children}</Container>
    </div>
  );
}

export function PublicLayout() {
  const [menu, setMenu] = useState(false);
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
      <BottomNav onMenu={() => setMenu(true)} />
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </div>
  );
}
