export type ThemeName = 'dark' | 'light';
export type Role = 'CITOYEN' | 'MAIRIE' | 'PROTECTION_CIVILE';
export type WaterLevel = 'CHEVILLE' | 'GENOU' | 'TAILLE';
export type ReportStatus = 'A_VERIFIER' | 'VALIDE' | 'REJETE' | 'DOUBLON';
export type Tone = 'alert' | 'warn' | 'info' | 'ok';

export interface UserCard {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  role: Role;
  theme: ThemeName;
  language: string;
  verified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserCard;
}

export interface Neighborhood {
  id: string;
  slug: string;
  name: string;
  commune: string;
  riskLevel: string;
  riskLabel: string;
  latitude: number;
  longitude: number;
  approximate: boolean;
}

export interface RainPoint {
  hour: number;
  mm: number;
}

export interface AlertItem {
  id: string;
  title: string;
  body: string;
  bodyEwe: string | null;
  eweNeedsReview: boolean;
  level: string;
  kind: string;
  neighborhoodId: string | null;
  neighborhoodName: string | null;
  startsAt: string | null;
  endsAt: string | null;
  rainMmMin: number | null;
  rainMmMax: number | null;
  rainSeries: RainPoint[];
  source: string | null;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reference: string;
  placeLabel: string;
  neighborhoodId: string | null;
  neighborhoodName: string | null;
  commune: string | null;
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  waterLevel: WaterLevel;
  waterLevelLabel: string;
  comment: string | null;
  status: ReportStatus;
  statusLabel: string;
  channel: string;
  confirmations: number;
  tags: string[];
  photoUrl: string | null;
  createdAt: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface Basin {
  id: string;
  name: string;
  commune: string;
  obstructionPct: number;
  status: string;
  statusLabel: string;
  latitude: number;
  longitude: number;
}

export interface WeatherDay {
  date: string;
  label: string;
  precipitationMm: number;
  forecast: boolean;
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  source: string;
  demo: boolean;
  days: WeatherDay[];
}

export interface HourlyResponse {
  source: string;
  demo: boolean;
  hours: RainPoint[];
}

export interface Dashboard {
  demo: boolean;
  alertsSentToday: number;
  reports24h: number;
  reportsTrend: string;
  activeBlackSpots: number;
  criticalBlackSpots: number;
  drainsToClear: number;
  plannedThisWeek: number;
  vigilanceLabel: string;
  vigilanceWindow: string;
  vigilanceNeighborhood: string;
  liveReports: number;
  pendingReports: number;
}

export interface TimelineItem {
  id: string;
  occurredAt: string;
  title: string;
  detail: string | null;
  kind: string;
}

export interface Team {
  id: string;
  name: string;
  zone: string | null;
  status: string;
  assignment: string | null;
}

export interface Outbound {
  id: string;
  recipient: string;
  body: string;
  status: string;
  createdAt: string;
}

export interface Preference {
  pushEnabled: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  nightAlerts: boolean;
  alertLanguage: string;
}

export interface Profile {
  user: UserCard;
  preferences: Preference;
  neighborhoods: Neighborhood[];
}
