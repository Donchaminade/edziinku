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
  cityId?: string | null;
  cityName?: string | null;
  region?: string | null;
  urgencyId?: string | null;
  urgencyLabel?: string | null;
  urgencyColor?: string | null;
  urgencyRank?: number | null;
  aliases?: string | null;
  active?: boolean;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  commune: string | null;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  neighborhoodCount: number;
}

export interface UrgencyLevel {
  id: string;
  slug: string;
  label: string;
  color: string;
  rank: number;
  active: boolean;
  neighborhoodCount: number;
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
  cityId?: string | null;
  cityName?: string | null;
  startsAt: string | null;
  endsAt: string | null;
  rainMmMin: number | null;
  rainMmMax: number | null;
  rainSeries: RainPoint[];
  source: string | null;
  createdAt: string;
}

export interface LocalAlert {
  alert: AlertItem;
  scope: 'SECTOR' | 'NEIGHBOR' | string;
  neighborNames: string[];
}

export interface LocalRisk {
  neighborhood: Neighborhood | null;
  distanceM: number | null;
  outOfKnownZone: boolean;
  urgencyLabel: string | null;
  urgencyColor: string | null;
  urgencyRank: number | null;
  riskLevel: string | null;
  alerts: LocalAlert[];
  neighborNames: string[];
  neighborRadiusKm: number;
  matchMaxKm: number;
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

export interface HotspotReport {
  id: string;
  photoUrl: string | null;
  createdAt: string;
  quartier: string;
}

export interface HotspotZone {
  id: string;
  label: string;
  count: number;
  lat: number;
  lng: number;
  reports: HotspotReport[];
  neighborhoodId?: string | null;
  cityName?: string | null;
  urgencyLabel?: string | null;
  urgencyColor?: string | null;
  urgencyRank?: number | null;
}

export interface HotspotResponse {
  days: number;
  zones: HotspotZone[];
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
