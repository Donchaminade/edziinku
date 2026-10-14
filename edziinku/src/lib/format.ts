import type { Tone } from '../types';

export function waterTone(level: string): Tone {
  if (level === 'TAILLE') return 'alert';
  if (level === 'GENOU') return 'warn';
  return 'info';
}

export function basinTone(status: string): Tone {
  if (status === 'CRITIQUE') return 'alert';
  if (status === 'ELEVE') return 'warn';
  return 'info';
}

export function statusTone(status: string): Tone {
  if (status === 'REJETE') return 'alert';
  if (status === 'A_VERIFIER' || status === 'VIGILANCE') return 'warn';
  if (status === 'VALIDE' || status === 'CLEAR') return 'ok';
  return 'info';
}

export function alertTone(level: string): Tone {
  if (level === 'ELEVE' || level === 'CRITIQUE') return 'alert';
  if (level === 'VIGILANCE') return 'warn';
  return 'info';
}

export function waterPhrase(level: string) {
  if (level === 'CHEVILLE') return 'Eau à la cheville';
  if (level === 'GENOU') return 'Eau au genou';
  if (level === 'TAILLE') return 'Eau à la taille';
  return level;
}

export function ago(iso: string) {
  const delta = Date.now() - new Date(iso).getTime();
  const min = Math.round(delta / 60000);
  if (Number.isNaN(min)) return '';
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 36) return `il y a ${hours} h`;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(iso));
}

export function clock(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function riskTone(level: string): Tone {
  if (level === 'ELEVE' || level === 'CRITIQUE') return 'alert';
  if (level === 'A_SURVEILLER') return 'warn';
  if (level === 'MODERE' || level === 'FAIBLE') return 'ok';
  return 'info';
}

export function alertLevelLabel(level: string) {
  return ({ INFO: 'Info', VIGILANCE: 'Vigilance', ELEVE: 'Risque élevé', CRITIQUE: 'Critique' } as Record<string, string>)[level] ?? level;
}

export function teamStatus(status: string): { label: string; tone: Tone } {
  if (status === 'SUR_PLACE') return { label: 'Sur place', tone: 'ok' };
  if (status === 'EN_ROUTE') return { label: 'En route', tone: 'warn' };
  if (status === 'DISPONIBLE') return { label: 'Disponible', tone: 'info' };
  return { label: status.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase()), tone: 'info' };
}

export function outboxStatus(status: string): { label: string; tone: Tone } {
  if (status === 'SENT' || status === 'DELIVERED') return { label: 'Envoyé', tone: 'ok' };
  if (status === 'FAILED') return { label: 'Échec', tone: 'alert' };
  if (status === 'SKIPPED') return { label: 'Ignoré', tone: 'info' };
  return { label: 'En attente', tone: 'warn' };
}

export function roleLabel(role: string) {
  if (role === 'MAIRIE') return 'Mairie';
  if (role === 'PROTECTION_CIVILE') return 'Protection civile';
  return 'Habitant';
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'E';
}

export function channelLabel(channel: string) {
  return ({ APP: 'Application', WEB: 'Web', WHATSAPP: 'WhatsApp', SMS: 'SMS' } as Record<string, string>)[channel] ?? channel;
}

export function longDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso));
}

export function formatInt(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value);
}

export function maskPhone(phone: string | null) {
  if (!phone) return 'numéro masqué';
  const digits = phone.replace(/\D/g, '');
  return `+${digits.slice(0, 3)} •• •• ${digits.slice(-4, -2)} ${digits.slice(-2)}`;
}
