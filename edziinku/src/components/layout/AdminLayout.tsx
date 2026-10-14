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
import { useState, type ReactNode } from 'react';
import { Navigate, NavLink, useLocation, useNavigate } from 'react-router';
import { isStaff, useAuth } from '../../context/AuthContext';
import { initials, roleLabel } from '../../lib/format';
import { useLive } from '../../lib/useCatalog';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/motion';
import { Sheet } from '../ui/Overlay';
import { AnimatedOutlet, Brand, ThemeToggle } from './common';
import { DataStatus } from './PublicLayout';

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

function usePending() {
  const live = useLive();
  return live.reports.filter((report) => report.status === 'A_VERIFIER').length;
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
    <aside className="glass fixed inset-y-3 left-3 z-40 hidden w-[260px] flex-col rounded-[28px] lg:flex">
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
          <Button size="sm" variant="ghost" onClick={() => { void logout().then(() => navigate('/')); }}>
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
    <header className="sticky top-0 z-30 px-3 pt-3 lg:px-0">
      <div className="glass flex h-16 items-center justify-between gap-3 rounded-[22px] px-3 lg:px-5">
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

function AdminBottomNav({ onMore }: { onMore: () => void }) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const pending = usePending();
  const tabs = [allLinks[0], allLinks[1], allLinks[2], allLinks[3]];
  return (
    <nav className="bottom-nav glass-strong" aria-label="Navigation mobile de l’espace équipes">
      {tabs.map((link) => {
        const on = isActive(pathname, link);
        return (
          <NavLink key={link.to} to={link.to} end={link.end} className="bottom-link isolate" data-on={on}>
            {on && (
              <motion.span
                layoutId="admin-bottom-pill"
                className="bottom-link-pill"
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">
              <link.icon size={21} />
              {link.count === 'pending' && pending > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-4 rounded-full px-1 text-center text-[10px] leading-4 font-bold text-white" style={{ background: 'var(--alert)' }}>
                  {pending}
                </span>
              )}
            </span>
            <span className="max-w-full truncate px-1">{link.short}</span>
          </NavLink>
        );
      })}
      <button type="button" className="bottom-link" onClick={onMore} aria-label="Plus de rubriques">
        <Menu size={21} />
        <span>Plus</span>
      </button>
    </nav>
  );
}

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <Sheet open={open} onClose={onClose} title="Espace équipes" subtitle={`${user?.displayName ?? ''} · ${roleLabel(user?.role ?? '')}`}>
      <div className="grid gap-2">
        {allLinks.slice(4).map((link) => (
          <NavLink key={link.to} to={link.to} onClick={onClose} className="card card-hover flex min-h-14 items-center gap-3 rounded-2xl px-4">
            <span className="icon-tile icon-tile-sm"><link.icon size={18} /></span>
            <span className="font-semibold">{link.label}</span>
          </NavLink>
        ))}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button to="/" onClick={onClose}><ExternalLink size={16} /> Site public</Button>
          <Button variant="danger" onClick={() => { onClose(); void logout().then(() => navigate('/')); }}>
            <LogOut size={16} /> Quitter
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

export function AdminLayout() {
  const [more, setMore] = useState(false);
  return (
    <div className="has-bottom-nav min-h-screen lg:pl-[284px] lg:pr-6">
      <Sidebar />
      <Topbar />
      <main className="pb-10">
        <AnimatedOutlet scope="admin" />
      </main>
      <AdminBottomNav onMore={() => setMore(true)} />
      <MoreSheet open={more} onClose={() => setMore(false)} />
    </div>
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
