const ACCESS = 'edzii-access';
const REFRESH = 'edzii-refresh';

export const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function raw(path: string, init: RequestInit, token: string | null) {
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(`${apiBase}${path}`, { ...init, headers });
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response = await raw(path, init, localStorage.getItem(ACCESS));
  if (response.status === 401 && localStorage.getItem(REFRESH) && !path.startsWith('/api/auth/')) {
    const renewed = await refresh();
    if (renewed) response = await raw(path, init, localStorage.getItem(ACCESS));
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  const data = text ? JSON.parse(text) as { error?: string } : {};
  if (!response.ok) throw new ApiError(response.status, data.error || 'La requête a échoué');
  return data as T;
}

export async function refresh() {
  const refreshToken = localStorage.getItem(REFRESH);
  if (!refreshToken) return false;
  const response = await fetch(`${apiBase}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem('edzii-user');
    return false;
  }
  const data = await response.json() as { accessToken: string; refreshToken: string; user: unknown };
  localStorage.setItem(ACCESS, data.accessToken);
  localStorage.setItem(REFRESH, data.refreshToken);
  localStorage.setItem('edzii-user', JSON.stringify(data.user));
  return true;
}

export function mediaUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${apiBase}${path}`;
}

export function saveSession(access: string, refreshToken: string) {
  localStorage.setItem(ACCESS, access);
  localStorage.setItem(REFRESH, refreshToken);
}

export function clearSession() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  localStorage.removeItem('edzii-user');
}

export function sessionToken() {
  return localStorage.getItem(ACCESS);
}
