import { motion } from 'motion/react';
import { Bell, Camera, Check, LogIn, LogOut, MessageCircle, Moon, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHero } from '../../components/Hero';
import { ThemeToggle, useDocumentTitle } from '../../components/layout/common';
import { PublicPage } from '../../components/layout/PublicLayout';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Decor';
import { Segmented, Switch } from '../../components/ui/Form';
import { useToast } from '../../components/ui/Overlay';
import { Reveal, Skeleton } from '../../components/ui/motion';
import { useAuth } from '../../context/AuthContext';
import { photos } from '../../data/photos';
import { api } from '../../lib/api';
import { ago, initials, roleLabel, statusTone, waterPhrase } from '../../lib/format';
import { useLive } from '../../lib/useCatalog';
import type { Preference, Profile, ReportItem } from '../../types';

export function ProfilePage() {
  useDocumentTitle('Mon profil');
  const { user, ready, logout } = useAuth();
  const live = useLive();
  const toast = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mine, setMine] = useState<ReportItem[] | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    let cancel = false;
    void api<Profile>('/api/me')
      .then((data) => { if (!cancel) setProfile(data); })
      .catch(() => { if (!cancel) toast('Profil indisponible pour le moment.', 'alert'); });
    void api<ReportItem[]>('/api/me/reports')
      .then((data) => { if (!cancel) setMine(data); })
      .catch(() => { if (!cancel) setMine([]); });
    return () => { cancel = true; };
  }, [ready, user, toast]);

  if (!ready) return <PublicPage><Skeleton className="h-64" /><Skeleton className="h-48" /></PublicPage>;

  if (!user) {
    return (
      <PublicPage>
        <PageHero photo={photos.hedzranawoe} eyebrow="Profil" title="Votre espace" short="Connectez-vous pour suivre vos quartiers." size="sm" />
        <EmptyState
          title="Vous n’êtes pas connecté"
          text="Connectez-vous pour choisir vos quartiers, vos canaux d’alerte et retrouver vos signalements."
          icon={<LogIn size={22} />}
          action={<Button to="/connexion" variant="primary">Se connecter</Button>}
        />
      </PublicPage>
    );
  }

  async function saveChannels(key: keyof Preference, next: Preference) {
    setSaving(key);
    try {
      const saved = await api<Preference>('/api/me/channels', { method: 'PUT', body: JSON.stringify(next) });
      setProfile((current) => current ? { ...current, preferences: saved } : current);
      toast('Préférences enregistrées');
    } catch {
      toast('Enregistrement impossible.', 'alert');
    } finally {
      setSaving(null);
    }
  }

  async function toggleHood(id: string) {
    if (!profile) return;
    const ids = profile.neighborhoods.some((item) => item.id === id)
      ? profile.neighborhoods.filter((item) => item.id !== id).map((item) => item.id)
      : [...profile.neighborhoods.map((item) => item.id), id];
    try {
      const saved = await api<Profile>('/api/me/neighborhoods', { method: 'PUT', body: JSON.stringify({ neighborhoodIds: ids }) });
      setProfile(saved);
      toast('Quartiers mis à jour');
    } catch {
      toast('Mise à jour impossible.', 'alert');
    }
  }

  const prefs = profile?.preferences;
  const channels: { key: keyof Preference; label: string; text: string; icon: typeof Bell }[] = [
    { key: 'pushEnabled', label: 'Notifications', text: 'Sur ce téléphone', icon: Bell },
    { key: 'whatsappEnabled', label: 'WhatsApp', text: 'Messages du bot', icon: MessageCircle },
    { key: 'smsEnabled', label: 'SMS', text: 'Sans internet', icon: Smartphone },
    { key: 'nightAlerts', label: 'Alertes de nuit', text: 'Entre 22 h et 6 h', icon: Moon },
  ];

  return (
    <PublicPage>
      <PageHero
        photo={photos.hedzranawoe}
        eyebrow={roleLabel(user.role)}
        title={user.displayName}
        short={user.email || user.phone || 'Compte Edzii-Nku'}
        size="sm"
      >
        <span className="avatar h-12 w-12 text-base">{initials(user.displayName)}</span>
        {user.verified && <span className="badge" data-tone="ok"><Check size={12} /> Vérifié</span>}
      </PageHero>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Reveal className="card p-5 md:p-6">
          <h2 className="t-h3 text-lg">Canaux d’alerte</h2>
          <p className="mt-1 text-sm text-muted">Comment voulez-vous être prévenu ?</p>
          <div className="mt-4 flex flex-col divide-y divide-[var(--line)]">
            {!prefs && [0, 1, 2, 3].map((key) => <Skeleton key={key} className="my-2 h-12" />)}
            {prefs && channels.map((channel) => (
              <div key={channel.key} className="flex items-center gap-3 py-2.5">
                <span className="icon-tile icon-tile-sm"><channel.icon size={17} /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{channel.label}</p>
                  <p className="text-xs text-muted">{channel.text}</p>
                </div>
                <Switch
                  label={channel.label}
                  on={Boolean(prefs[channel.key])}
                  disabled={saving === channel.key}
                  onChange={(next) => { void saveChannels(channel.key, { ...prefs, [channel.key]: next }); }}
                />
              </div>
            ))}
          </div>
          {prefs && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <span className="text-sm font-semibold">Langue des alertes</span>
              <Segmented
                label="Langue des alertes"
                value={prefs.alertLanguage === 'ewe' || prefs.alertLanguage === 'both' ? prefs.alertLanguage : 'fr'}
                onChange={(value) => { void saveChannels('alertLanguage', { ...prefs, alertLanguage: value }); }}
                options={[{ value: 'fr', label: 'Français' }, { value: 'ewe', label: 'Eʋegbe' }, { value: 'both', label: 'Les deux' }]}
              />
            </div>
          )}
        </Reveal>

        <Reveal delay={0.08} className="card p-5 md:p-6">
          <h2 className="t-h3 text-lg">Quartiers suivis</h2>
          <p className="mt-1 text-sm text-muted">Touchez pour suivre ou ne plus suivre.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!profile && <Skeleton className="h-24 w-full" />}
            {profile && live.neighborhoods.map((item) => {
              const on = profile.neighborhoods.some((hood) => hood.id === item.id);
              return (
                <motion.button key={item.id} type="button" className="chip" data-on={on} onClick={() => { void toggleHood(item.id); }} whileTap={{ scale: 0.94 }} aria-pressed={on}>
                  {on && <Check size={14} />} {item.name}
                </motion.button>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-line px-4 py-1">
            <span className="text-sm font-semibold">Thème de l’interface</span>
            <ThemeToggle />
          </div>
        </Reveal>
      </div>

      <Reveal className="card p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="t-h3 text-lg">Mes signalements</h2>
            <p className="text-sm text-muted">Leur statut de vérification.</p>
          </div>
          <Button to="/signaler" variant="primary" size="sm"><Camera size={16} /> Signaler</Button>
        </div>
        {!mine && <Skeleton className="h-24" />}
        {mine && mine.length === 0 && <EmptyState title="Aucun signalement" text="Quand vous enverrez une photo et un niveau, ils apparaîtront ici." icon={<Camera size={22} />} />}
        {mine && mine.length > 0 && (
          <ul className="grid gap-2 md:grid-cols-2">
            {mine.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3.5">
                <div className="min-w-0">
                  <p className="t-num text-xs text-muted">{item.reference} · {ago(item.createdAt)}</p>
                  <p className="truncate font-semibold">{item.placeLabel}</p>
                  <p className="text-xs text-muted">{waterPhrase(item.waterLevel)}</p>
                </div>
                <span className="badge shrink-0" data-tone={statusTone(item.status)}>{item.statusLabel}</span>
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      <div className="flex justify-end">
        <Button variant="danger" onClick={() => { navigate('/'); void logout(); }}><LogOut size={16} /> Se déconnecter</Button>
      </div>
    </PublicPage>
  );
}
