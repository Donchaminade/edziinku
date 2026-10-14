import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Building2, Eye, EyeOff, KeyRound, Mail, Phone, ShieldHalf, TriangleAlert, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Photo, PhotoCredit } from '../../components/Hero';
import { useDocumentTitle } from '../../components/layout/common';
import { PublicPage } from '../../components/layout/PublicLayout';
import { Button } from '../../components/ui/Button';
import { Field, Segmented, TextInput } from '../../components/ui/Form';
import { ease } from '../../components/ui/motion';
import { isStaff, useAuth } from '../../context/AuthContext';
import { photos } from '../../data/photos';
import { api, ApiError } from '../../lib/api';
import { roleLabel } from '../../lib/format';
import { useTheme } from '../../theme/ThemeProvider';

const demoAccounts = [
  { id: 'afi@edzii.local', label: 'Habitant', icon: UserRound },
  { id: 'mairie@edzii.local', label: 'Mairie', icon: Building2 },
  { id: 'pc@edzii.local', label: 'Protection civile', icon: ShieldHalf },
];
const DEMO_PASSWORD = 'Demo-Edzii-2026';

export function AuthPage() {
  const { login, register, user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<'login' | 'register'>(params.get('mode') === 'inscription' ? 'register' : 'login');
  const [identifier, setIdentifier] = useState(params.get('suite') === 'admin' ? 'mairie@edzii.local' : 'afi@edzii.local');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);
  useDocumentTitle(mode === 'login' ? 'Connexion' : 'Créer un compte');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const account = mode === 'login'
        ? await login(identifier, password)
        : await register({ displayName: name, email: identifier, phone, password });
      await api('/api/me/theme', { method: 'PUT', body: JSON.stringify({ theme }) }).catch(() => undefined);
      navigate(isStaff(account.role) ? '/admin' : '/profil');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible : le serveur ne répond pas. Réessayez dans un instant.');
      setShake((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicPage>
      <div className="grid overflow-hidden rounded-[34px] border border-line lg:min-h-[680px] lg:grid-cols-[1.05fr_1fr]" style={{ background: 'var(--surface)' }}>
        <div className="relative isolate min-h-[220px] overflow-hidden lg:min-h-0">
          <Photo photo={photos.plage} className="hero-photo" priority sizes="(min-width: 1024px) 50vw, 100vw" />
          <div className="hero-veil" />
          <div className="relative z-[3] flex h-full flex-col justify-end gap-3 p-5 pt-28 md:p-10">
            <span className="t-eyebrow">Espace Edzii-Nku</span>
            <h1 className="t-h1 max-w-md">Un compte pour le quartier, la mairie et le terrain</h1>
            <p className="t-lead hidden max-w-md lg:block">Les habitants suivent leurs quartiers. Les équipes retrouvent leur tableau de bord.</p>
            <PhotoCredit photo={photos.plage} />
          </div>
        </div>

        <div className="flex items-center p-4 sm:p-8 lg:p-12">
          <motion.form
            key={shake}
            onSubmit={submit}
            className="mx-auto flex w-full max-w-md flex-col gap-5"
            animate={shake && !reduce ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
            transition={{ duration: 0.45 }}
          >
            <div className="flex flex-col gap-1">
              <h2 className="t-h2">{mode === 'login' ? 'Bon retour' : 'Créer un compte'}</h2>
              <p className="text-sm text-muted">{mode === 'login' ? 'Connectez-vous pour continuer.' : 'Quelques informations suffisent.'}</p>
            </div>

            {user && (
              <div className="note" data-tone="info">
                <UserRound size={16} />
                <span className="flex-1">Session ouverte : <strong>{user.displayName}</strong> ({roleLabel(user.role)}).</span>
                <button type="button" className="font-semibold underline" onClick={() => { void logout(); }}>Quitter</button>
              </div>
            )}

            <Segmented
              label="Mode"
              value={mode}
              onChange={(next) => { setMode(next); setError(null); if (next === 'register') { setIdentifier(''); setPassword(''); } }}
              className="w-full"
              options={[{ value: 'login', label: 'Connexion' }, { value: 'register', label: 'Inscription' }]}
            />

            <AnimatePresence initial={false}>
              {mode === 'register' && (
                <motion.div key="name" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
                  <Field label="Nom complet" htmlFor="name">
                    <TextInput id="name" icon={<UserRound size={17} />} required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Afi Mensah" />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            <Field label={mode === 'login' ? 'E-mail ou téléphone' : 'E-mail'} htmlFor="identifier">
              <TextInput id="identifier" icon={<Mail size={17} />} required value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" placeholder="vous@exemple.tg" />
            </Field>

            <AnimatePresence initial={false}>
              {mode === 'register' && (
                <motion.div key="phone" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
                  <Field label="Téléphone" htmlFor="phone" hint="Pour les alertes WhatsApp et SMS.">
                    <TextInput id="phone" icon={<Phone size={17} />} value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" placeholder="+228 90 00 00 00" />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            <Field label="Mot de passe" htmlFor="password" hint={mode === 'register' ? '8 caractères minimum.' : undefined}>
              <TextInput
                id="password"
                icon={<KeyRound size={17} />}
                required
                type={show ? 'text' : 'password'}
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                trailing={(
                  <button type="button" className="-mr-2 grid h-11 w-11 shrink-0 place-items-center text-muted" onClick={() => setShow((state) => !state)} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              />
            </Field>

            <AnimatePresence>
              {error && (
                <motion.p className="note" data-tone="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert">
                  <TriangleAlert size={16} /> {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" variant="primary" size="lg" block loading={busy}>
              {busy ? 'Patientez…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'} {!busy && <ArrowRight size={18} />}
            </Button>

            {mode === 'login' && (
              <div className="flex flex-col gap-2.5 rounded-2xl border border-dashed border-line-strong p-4">
                <p className="text-xs font-semibold text-muted">Comptes de démonstration</p>
                <div className="grid grid-cols-3 gap-2">
                  {demoAccounts.map((account) => {
                    const on = identifier === account.id;
                    return (
                      <motion.button
                        key={account.id}
                        type="button"
                        className="chip flex-col !gap-1 !rounded-2xl !px-2 py-2 text-[11.5px]"
                        data-on={on}
                        onClick={() => { setIdentifier(account.id); setPassword(DEMO_PASSWORD); setError(null); }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <account.icon size={17} />
                        <span className="max-w-full truncate">{account.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <p className="text-[11.5px] text-muted">Mot de passe : <span className="t-num font-semibold text-text2">{DEMO_PASSWORD}</span></p>
              </div>
            )}
          </motion.form>
        </div>
      </div>
    </PublicPage>
  );
}
