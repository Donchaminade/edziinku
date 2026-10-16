import { motion, useReducedMotion } from 'motion/react';
import {
  Bell,
  CloudRain,
  ExternalLink,
  History,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  MessageCircle,
  ShieldAlert,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, NavLink, useLocation, useNavigate } from 'react-router';
import { isStaff, useAuth } from '../../context/AuthContext';
import { initials, roleLabel } from '../../lib/format';
import { api } from '../../lib/api';
import { demoReports } from '../../data/demo';
import type { Page, ReportItem } from '../../types';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/motion';
import { Sheet } from '../ui/Overlay';
import { AnimatedOutlet, Brand, ThemeToggle } from './common';
import { DataStatus, useHideOnScroll } from './PublicLayout';

interface AdminLink { to: string; label: string; short: string; icon: LucideIcon; end?: boolean; count?: 'pending' }

const groups: { title: string; links: AdminLink[] }[] = [
  {
    title: 'Pilotage',
    links: [
      { to: '/admin', label: 'Vue d’ensemble', short: 'Accueil', icon: LayoutDashboard, end: true },
      { to: '/admin/carte', label: 'Carte live', short: 'Carte', icon: Map },
    ],
  },
  {
    title: 'Opérations',
    links: [
      { to: '/admin/signalements', label: 'Signalements', short: 'Modérer', icon: ShieldAlert, count: 'pending' },
      { to: '/admin/alertes', label: 'Alertes', short: 'Alertes', icon: Bell },
      { to: '/admin/points-noirs', label: 'Points noirs', short: 'Bassins', icon: CloudRain },
      { to: '/admin/equipes', label: 'Équipes terrain', short: 'Équipes', icon: Users },
    ],
  },
  {
    title: 'Journal',
    links: [
      { to: '/admin/historique', label: 'Historique', short: 'Historique', icon: History },
      { to: '/admin/whatsapp', label: 'Messages WhatsApp', short: 'Messages', icon: MessageCircle },
    ],
  },
];

const allLinks = groups.flatMap((group) => group.links);

const PendingContext = createContext<{ count: number; refresh: () => void }>({ count: 0, refresh: () => {} });

function PendingProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const refresh = useCallback(() => {
    api<Page<ReportItem>>('/api/admin/reports?status=A_VERIFIER&size=1')
      .then((page) => setCount(page.total))
      .catch(() => setCount(demoReports.filter((report) => report.status === 'A_VERIFIER').length));
  }, []);
  useEffect(refresh, [refresh]);
  return <PendingContext.Provider value={{ count, refresh }}>{children}</PendingContext.Provider>;
}

/** Nombre de signalements à vérifier, partagé par la navigation et la file de modération. */
export function usePendingReports() {
  return useContext(PendingContext);
}

function usePending() {
  return usePendingReports().count;
}

function isActive(pathname: string, link: AdminLink) {
  return link.end ? pathname === link.to : pathname.startsWith(link.to);
}

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const pending = usePending();

  return (
    <aside className="overlay-panel fixed inset-y-3 left-3 z-40 hidden w-[260px] flex-col rounded-[28px] lg:flex">
      <div className="px-5 pt-5 pb-4"><Brand to="/admin" /></div>
      <nav className="scroll-thin flex-1 overflow-y-auto px-3" aria-label="Navigation de l’espace équipes">
        {groups.map((group) => (
          <div key={group.title} className="mb-4">
            <p className="t-eyebrow mb-1.5 px-3 text-[10.5px] text-muted">{group.title}</p>
            <div className="flex flex-col gap-0.5">
              {group.links.map((link) => {
                const on = isActive(pathname, link);
                return (
                  <NavLink key={link.to} to={link.to} end={link.end} className="side-link isolate">
                    {on && (
                      <motion.span
                        layoutId="side-pill"
                        className="side-link-pill"
                        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 450, damping: 36 }}
                      />
                    )}
                    <link.icon size={18} className={on ? 'text-cyan' : ''} />
                    {link.label}
                    {link.count === 'pending' && pending > 0 && <span className="side-count">{pending}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-3 rounded-2xl border border-line p-3" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center gap-3">
          <span className="avatar">{initials(user?.displayName ?? '')}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.displayName}</p>
            <p className="truncate text-xs text-muted">{roleLabel(user?.role ?? '')} · Grand Lomé</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button to="/" size="sm" variant="ghost"><ExternalLink size={15} /> Site</Button>
          <Button size="sm" variant="ghost" onClick={() => { navigate('/'); void logout(); }}>
            <LogOut size={15} /> Quitter
          </Button>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const current = allLinks.find((link) => isActive(pathname, link));
  const today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  return (
    <header className="sticky top-0 z-30 px-3 pt-[calc(12px+var(--safe-top))] lg:px-0 lg:pt-3">
      <div className="overlay-panel flex h-14 items-center justify-between gap-3 rounded-[22px] px-3 lg:h-16 lg:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="lg:hidden"><Brand to="/admin" compact /></span>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate font-display text-base font-semibold">{current?.label ?? 'Espace équipes'}</p>
            <p className="truncate text-xs text-muted first-letter:uppercase">{today} · Grand Lomé</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="hidden sm:inline-flex"><DataStatus /></span>
          <ThemeToggle />
          <span className="avatar h-9 w-9 text-xs lg:hidden" aria-label={user?.displayName}>{initials(user?.displayName ?? '')}</span>
        </div>
      </div>
    </header>
  );
}

function AdminBottomNav({ onMore, moreOpen }: { onMore: () => void; moreOpen: boolean }) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const pending = usePending();
  const hidden = useHideOnScroll(moreOpen);
  const tabs = [allLinks[0], allLinks[1], allLinks[2], allLinks[3]];
  const inMore = allLinks.slice(4).some((link) => isActive(pathname, link));
  return (
    <motion.nav
      className="bottom-nav"
      aria-label="Navigation mobile de l’espace équipes"
      data-hidden={hidden}
      animate={{ y: hidden ? 'calc(100% + 24px)' : 0 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 36 }}
    >
      {tabs.map((link) => {
        const on = isActive(pathname, link);
        return (
          <NavLink key={link.to} to={link.to} end={link.end} className="bottom-link isolate" data-on={on} aria-label={link.label}>
            {on && (
              <motion.span
                layoutId="admin-bottom-pill"
                className="bottom-link-pill"
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <motion.span className="relative" whileTap={reduce ? undefined : { scale: 0.82 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}>
              <link.icon size={21} />
              {link.count === 'pending' && pending > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-4 rounded-full px-1 text-center text-[10px] leading-4 font-bold text-white" style={{ background: 'var(--alert)' }} aria-label={`${pending} à vérifier`}>
                  {pending}
                </span>
              )}
            </motion.span>
            <span className="max-w-full truncate px-1">{link.short}</span>
          </NavLink>
        );
      })}
      <motion.button
        type="button"
        className="bottom-link isolate"
        data-on={inMore}
        onClick={onMore}
        aria-label="Plus de rubriques"
        aria-haspopup="dialog"
        aria-expanded={moreOpen}
        whileTap={reduce ? undefined : { scale: 0.9 }}
      >
        {inMore && <span className="bottom-link-pill" />}
        <Menu size={21} />
        <span>Plus</span>
      </motion.button>
    </motion.nav>
  );
}

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Espace équipes"
      subtitle={`${user?.displayName ?? ''} · ${roleLabel(user?.role ?? '')}`}
      footer={(
        <div className="grid grid-cols-2 gap-2">
          <Button to="/" onClick={onClose}><ExternalLink size={16} /> Site public</Button>
          <Button variant="danger" onClick={() => { onClose(); navigate('/'); void logout(); }}>
            <LogOut size={16} /> Quitter
          </Button>
        </div>
      )}
    >
      <div className="grid gap-2">
        {allLinks.slice(4).map((link) => {
          const on = isActive(pathname, link);
          return (
            <NavLink key={link.to} to={link.to} onClick={onClose} className="card card-hover flex min-h-14 items-center gap-3 rounded-2xl px-4" style={on ? { borderColor: 'var(--accent-line)' } : undefined}>
              <span className="icon-tile icon-tile-sm"><link.icon size={18} /></span>
              <span className="font-semibold">{link.label}</span>
              {on && <span className="badge ml-auto">Ici</span>}
            </NavLink>
          );
        })}
        <div className="mt-2 flex items-center justify-between rounded-2xl border border-line px-4 py-1">
          <span className="text-sm font-semibold">Thème</span>
          <ThemeToggle />
        </div>
      </div>
    </Sheet>
  );
}

export function AdminLayout() {
  const [more, setMore] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setMore(false), [pathname]);
  return (
    <PendingProvider>
      <div className="has-bottom-nav min-h-screen lg:pl-[284px] lg:pr-6">
        <Sidebar />
        <Topbar />
        <main className="pb-10">
          <AnimatedOutlet scope="admin" />
        </main>
        <AdminBottomNav onMore={() => setMore(true)} moreOpen={more} />
        <MoreSheet open={more} onClose={() => setMore(false)} />
      </div>
    </PendingProvider>
  );
}

export function StaffGate() {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <div className="mx-auto grid max-w-5xl gap-4 p-6">
        <Skeleton className="h-16" />
        <Skeleton className="h-48" />
        <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
      </div>
    );
  }
  if (!user || !isStaff(user.role)) return <Navigate to="/connexion?suite=admin" replace />;
  return <AdminLayout />;
}

export function AdminPage({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-3 pt-4 sm:px-4 lg:px-0 lg:pt-5">{children}</div>;
}
