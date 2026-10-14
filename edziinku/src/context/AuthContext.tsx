import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, clearSession, saveSession } from '../lib/api';
import type { AuthResponse, Profile, Role, UserCard } from '../types';

interface AuthContextValue {
  user: UserCard | null;
  ready: boolean;
  login: (identifier: string, password: string) => Promise<UserCard>;
  register: (input: { displayName: string; email: string; phone: string; password: string }) => Promise<UserCard>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readUser(): UserCard | null {
  const raw = localStorage.getItem('edzii-user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserCard;
  } catch {
    return null;
  }
}

export function isStaff(role: Role | undefined) {
  return role === 'MAIRIE' || role === 'PROTECTION_CIVILE';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserCard | null>(readUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readUser();
    if (!stored || !localStorage.getItem('edzii-access')) {
      setReady(true);
      return;
    }
    api<Profile>('/api/me')
      .then((profile) => {
        localStorage.setItem('edzii-user', JSON.stringify(profile.user));
        setUser(profile.user);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    ready,
    login: async (identifier, password) => {
      const data = await api<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      saveSession(data.accessToken, data.refreshToken);
      localStorage.setItem('edzii-user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    },
    register: async (input) => {
      const data = await api<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      saveSession(data.accessToken, data.refreshToken);
      localStorage.setItem('edzii-user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    },
    logout: async () => {
      const refreshToken = localStorage.getItem('edzii-refresh');
      try {
        await api('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) });
      } catch {
        /* la session locale est effacée même si l’API ne répond pas */
      }
      clearSession();
      setUser(null);
    },
  }), [ready, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('Auth hors fournisseur');
  return ctx;
}
