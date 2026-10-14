import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Bell,
  CloudRain,
  Droplets,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  MessageCircle,
  Moon,
  Radio,
  Shield,
  Sun,
  Users,
  Waves,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink, Navigate, useLocation, useNavigate, useOutlet } from 'react-router';
import { isStaff, useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeProvider';

const ease = [0.16, 1, 0.3, 1] as const;

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const label = theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème nuit';
  return (
    <motion.button
      type="button"
      className="btn btn-ghost !px-3"
      aria-label={label}
      title={label}
      onClick={toggle}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.92 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="grid place-items-center"
          initial={{ rotate: -70, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 70, opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

function Brand() {
  return (
    <NavLink to="/" className="flex min-w-0 items-center gap-2 font-display text-lg font-semibold">
      <img src="/logo-mark.svg" alt="" width={32} height={32} className="shrink-0" />
      <span className="truncate">Edzii-Nku</span>
    </NavLink>
  );
}

const tabLinks = [
  { to: '/', label: 'Accueil', icon: Home, end: true },
  { to: '/carte', label: 'Carte', icon: Map, end: false },
  { to: '/signaler', label: 'Signaler', icon: Droplets, end: false },
  { to: '/whatsapp', label: 'WhatsApp', icon: MessageCircle, end: false },
];

function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: reduce ? 0.01 : 0.38, ease }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}

const publicLinks = [
  { to: '/carte', label: 'Carte' },
  { to: '/signaler', label: 'Signaler' },
  { to: '/comment', label: 'Comment ça marche' },
  { to: '/whatsapp', label: 'WhatsApp' },
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  return (
    <div className="has-tabbar min-h-screen">
      <header className="glass sticky top-0 z-40 border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
          <Brand />
          <nav className="hidden items-center gap-1 md:flex">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `chip ${isActive ? 'chip-on' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NavLink to={user && isStaff(user.role) ? '/admin' : user ? '/profil' : '/connexion'} className="btn btn-primary hidden sm:inline-flex">
              {user ? user.displayName.split(' ')[0] : 'Connexion'}
            </NavLink>
            <button type="button" className="btn btn-ghost md:hidden" aria-label="Menu" onClick={() => setOpen(true)}>
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div key="menu" className="fixed inset-0 z-50 md:hidden">
            <motion.button
              type="button"
              aria-label="Fermer le menu"
              className="absolute inset-0"
              style={{ background: 'var(--veil)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              className="surface absolute top-3 right-3 left-3 flex flex-col gap-2 p-4"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="flex justify-end">
                <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)} aria-label="Fermer"><X size={18} /></button>
              </div>
              {publicLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className="side-link" onClick={() => setOpen(false)}>{link.label}</NavLink>
              ))}
              <NavLink to={user ? '/profil' : '/connexion'} className="btn btn-primary" onClick={() => setOpen(false)}>
                {user ? 'Mon profil' : 'Connexion'}
              </NavLink>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatedOutlet />
      {location.pathname !== '/whatsapp' && (
        <footer className="mx-auto mt-16 max-w-6xl px-4 pb-10 text-sm text-muted">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <span className="inline-flex items-center gap-2"><Waves size={16} /> Edzii-Nku · Lomé</span>
            <span>Photos : Unsplash et Pexels</span>
            <span>Urgence : 170</span>
          </div>
        </footer>
      )}
      <nav className="tabbar glass" aria-label="Navigation principale">
        {tabLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `tab-link ${isActive ? 'tab-on' : ''}`}
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

const adminLinks = [
  { to: '/admin', label: 'Vue d’ensemble', icon: LayoutDashboard, end: true },
  { to: '/admin/carte', label: 'Carte live', icon: Map, end: false },
  { to: '/admin/signalements', label: 'Signalements', icon: Droplets, end: false },
  { to: '/admin/alertes', label: 'Alertes', icon: Bell, end: false },
  { to: '/admin/points-noirs', label: 'Points noirs', icon: CloudRain, end: false },
  { to: '/admin/historique', label: 'Historique', icon: History, end: false },
  { to: '/admin/equipes', label: 'Équipes', icon: Users, end: false },
  { to: '/admin/whatsapp', label: 'Messages', icon: MessageCircle, end: false },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
      <aside className="border-line md:sticky md:top-0 md:h-screen md:border-r" style={{ background: 'var(--sidebar)' }}>
        <div className="flex items-center justify-between px-4 py-4">
          <Brand />
          <ThemeToggle />
        </div>
        <nav className="admin-nav flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `side-link whitespace-nowrap ${isActive ? 'side-link-on' : ''}`}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-4 pb-4 md:block">
          <p className="text-sm text-muted">{user?.displayName}</p>
          <p className="mb-3 text-xs text-muted">{user?.role === 'PROTECTION_CIVILE' ? 'Protection civile' : 'Mairie'}</p>
          <button
            type="button"
            className="btn w-full"
            onClick={() => { void logout().then(() => navigate('/')); }}
          >
            <LogOut size={16} /> Quitter
          </button>
        </div>
      </aside>
      <div>
        <AnimatedOutlet />
      </div>
    </div>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 py-8 ${className ?? ''}`}>{children}</div>;
}

export function Guard({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return <Page><p className="text-muted">Ouverture de la session…</p></Page>;
  if (!user || !isStaff(user.role)) return <Navigate to="/connexion" replace />;
  return children;
}

export function StaffGate() {
  return (
    <Guard>
      <AdminLayout />
    </Guard>
  );
}

export function LivePill({ children }: { children: ReactNode }) {
  return (
    <span className="chip chip-on">
      <Radio size={14} />
      {children}
    </span>
  );
}

export function ShieldMark() {
  return <Shield size={18} />;
}
