import type { AlertItem, Basin, Dashboard, Neighborhood, Outbound, ReportItem, Team, TimelineItem, WeatherResponse } from '../types';

export const demoNeighborhoods: Neighborhood[] = [
  { id: 'be', slug: 'be', name: 'Bè', commune: 'Golfe 1', riskLevel: 'ELEVE', riskLabel: 'Risque élevé', latitude: 6.1315, longitude: 1.232, approximate: false, cityId: 'lome', cityName: 'Lomé', urgencyLabel: 'Critique', urgencyColor: '#D21034', urgencyRank: 1 },
  { id: 'be-kpota', slug: 'be-kpota', name: 'Bè-Kpota', commune: 'Golfe 1', riskLevel: 'ELEVE', riskLabel: 'Risque élevé', latitude: 6.136, longitude: 1.229, approximate: true, cityId: 'lome', cityName: 'Lomé', urgencyLabel: 'Critique', urgencyColor: '#D21034', urgencyRank: 1 },
  { id: 'be-ahligo', slug: 'be-ahligo', name: 'Bè-Ahligo', commune: 'Golfe 1', riskLevel: 'ELEVE', riskLabel: 'Risque élevé', latitude: 6.1328, longitude: 1.2342, approximate: true, cityId: 'lome', cityName: 'Lomé', urgencyLabel: 'Critique', urgencyColor: '#D21034', urgencyRank: 1 },
  { id: 'agoe', slug: 'agoe-nyive', name: 'Agoè-Nyivé', commune: 'Agoè-Nyivé 1', riskLevel: 'ELEVE', riskLabel: 'Risque élevé', latitude: 6.228, longitude: 1.178, approximate: false },
  { id: 'zogbedji', slug: 'zogbedji', name: 'Zogbédji', commune: 'Agoè-Nyivé', riskLevel: 'A_SURVEILLER', riskLabel: 'À surveiller', latitude: 6.205, longitude: 1.165, approximate: true },
  { id: 'adakpame', slug: 'adakpame', name: 'Adakpamé', commune: 'Golfe 4', riskLevel: 'A_SURVEILLER', riskLabel: 'À surveiller', latitude: 6.148, longitude: 1.218, approximate: false },
  { id: 'hedzranawoe', slug: 'hedzranawoe', name: 'Hédzranawoé', commune: 'Golfe 2', riskLevel: 'A_SURVEILLER', riskLabel: 'À surveiller', latitude: 6.168, longitude: 1.255, approximate: false },
  { id: 'tokoin', slug: 'tokoin', name: 'Tokoin', commune: 'Golfe 3', riskLevel: 'MODERE', riskLabel: 'Risque modéré', latitude: 6.155, longitude: 1.208, approximate: false },
];

const series = [
  { hour: 18, mm: 4 }, { hour: 19, mm: 12 }, { hour: 20, mm: 22 },
  { hour: 21, mm: 18 }, { hour: 22, mm: 9 }, { hour: 23, mm: 3 },
];

export const demoAlerts: AlertItem[] = [
  {
    id: 'alerte-be', title: 'Forte pluie prévue à Bè',
    body: 'De fortes pluies sont prévues ce soir de 18 h à 23 h (45 à 60 mm). Surélevez vos biens, évitez les caniveaux.',
    bodyEwe: 'Tsi gã adza fiẽ sia tso gaƒoƒo 18 vaseɖe 23 (45–60 mm). Tsiɖɔɖɔ ƒe afɔku le wò kɔƒe me.',
    eweNeedsReview: true, level: 'ELEVE', kind: 'RAIN', neighborhoodId: 'be', neighborhoodName: 'Bè',
    startsAt: '2026-10-14T18:00:00Z', endsAt: '2026-10-14T23:00:00Z', rainMmMin: 45, rainMmMax: 60,
    rainSeries: series, source: 'Open-Meteo', createdAt: '2026-10-14T16:42:00Z',
  },
  {
    id: 'alerte-genou', title: 'Eau signalée au genou', body: 'Bè Ahligo · 3 signalements concordants.',
    bodyEwe: null, eweNeedsReview: true, level: 'VIGILANCE', kind: 'REPORT', neighborhoodId: 'be', neighborhoodName: 'Bè',
    startsAt: null, endsAt: null, rainMmMin: null, rainMmMax: null, rainSeries: [], source: 'Signalements citoyens', createdAt: '2026-10-14T15:10:00Z',
  },
];

export const demoReports: ReportItem[] = [
  report('EN-0318', 'Bè Ahligo, près du marché', 'be', 'Bè', 'Golfe 1', 6.1328, 1.2342, 'GENOU', 'Genou', 'Le caniveau devant le marché est bouché, l’eau entre dans les cours.', 'VALIDE', 'Validé', 'APP', 3, '2026-10-14T16:40:00Z'),
  report('EN-0320', 'Agoè Kitidjan, rue pavée', 'agoe', 'Agoè-Nyivé', 'Agoè-Nyivé 1', 6.226, 1.181, 'TAILLE', 'Taille', 'La rue est coupée.', 'VALIDE', 'Validé', 'WHATSAPP', 5, '2026-10-14T16:20:00Z'),
  report('EN-0325', 'Bassin Léo 2000, débordement', 'be', 'Bè', 'Golfe 1', 6.16, 1.27, 'GENOU', 'Genou', 'Le bassin déborde sur la voie.', 'VALIDE', 'Validé', 'WHATSAPP', 7, '2026-10-14T16:22:00Z'),
  report('EN-0327', 'Bè Ahligo', 'be', 'Bè', 'Golfe 1', 6.1332, 1.2338, 'GENOU', 'Genou', 'Le caniveau devant le marché est bouché, l’eau entre dans les cours.', 'A_VERIFIER', 'À vérifier', 'WHATSAPP', 0, '2026-10-14T16:57:00Z'),
  report('EN-0331', 'Zogbédji', 'zogbedji', 'Zogbédji', 'Agoè-Nyivé', 6.2055, 1.166, 'CHEVILLE', 'Cheville', 'Rue secondaire inondée.', 'A_VERIFIER', 'À vérifier', 'WHATSAPP', 0, '2026-10-14T17:20:00Z'),
];

export const demoBasins: Basin[] = [
  { id: 'b1', name: 'Bassin Léo 2000', commune: 'Golfe 7', obstructionPct: 92, status: 'CRITIQUE', statusLabel: 'Critique', latitude: 6.16, longitude: 1.27 },
  { id: 'b2', name: 'Bassin Gbézè', commune: 'Agoè-Nyivé', obstructionPct: 88, status: 'CRITIQUE', statusLabel: 'Critique', latitude: 6.21, longitude: 1.19 },
  { id: 'b3', name: 'Bassin marché Hédzranawoé', commune: 'Golfe 2', obstructionPct: 71, status: 'ELEVE', statusLabel: 'Élevé', latitude: 6.17, longitude: 1.25 },
  { id: 'b4', name: 'Bassin Caméléon', commune: 'Golfe', obstructionPct: 66, status: 'ELEVE', statusLabel: 'Élevé', latitude: 6.145, longitude: 1.24 },
  { id: 'b5', name: 'Bassin Avédji 2', commune: 'Agoè-Nyivé', obstructionPct: 41, status: 'SURVEILLE', statusLabel: 'Surveillé', latitude: 6.24, longitude: 1.2 },
  { id: 'b6', name: 'Bassin Ségbé', commune: 'Golfe', obstructionPct: 35, status: 'SURVEILLE', statusLabel: 'Surveillé', latitude: 6.185, longitude: 1.28 },
];

export const demoWeather: WeatherResponse = {
  latitude: 6.1725,
  longitude: 1.2314,
  source: 'demo',
  demo: true,
  days: [
    { date: '2026-10-08', label: 'Mer', precipitationMm: 4, forecast: false },
    { date: '2026-10-09', label: 'Jeu', precipitationMm: 12, forecast: false },
    { date: '2026-10-10', label: 'Ven', precipitationMm: 38, forecast: false },
    { date: '2026-10-11', label: 'Sam', precipitationMm: 71, forecast: false },
    { date: '2026-10-12', label: 'Dim', precipitationMm: 22, forecast: true },
    { date: '2026-10-13', label: 'Lun', precipitationMm: 96, forecast: true },
    { date: '2026-10-14', label: 'Mar', precipitationMm: 58, forecast: true },
  ],
};

export const demoDashboard: Dashboard = {
  demo: true,
  alertsSentToday: 12480,
  reports24h: 327,
  reportsTrend: '3× la veille',
  activeBlackSpots: 14,
  criticalBlackSpots: 5,
  drainsToClear: 38,
  plannedThisWeek: 9,
  vigilanceLabel: 'Vigilance forte pluie',
  vigilanceWindow: '18 h – 23 h',
  vigilanceNeighborhood: 'Bè',
  liveReports: demoReports.length,
  pendingReports: 2,
};

export const demoTimeline: TimelineItem[] = [
  { id: 't1', occurredAt: '2026-10-14T17:57:00Z', title: 'Signalement EN-0327 reçu', detail: 'Bè Ahligo · eau au genou', kind: 'REPORT' },
  { id: 't2', occurredAt: '2026-10-14T17:30:00Z', title: 'Équipe terrain 3 envoyée', detail: 'Bassin Léo 2000', kind: 'TEAM' },
  { id: 't3', occurredAt: '2026-10-14T16:42:00Z', title: 'Alerte forte pluie envoyée', detail: 'Bè, Agoè-Nyivé · FR + éwé', kind: 'ALERT' },
  { id: 't4', occurredAt: '2026-10-14T14:05:00Z', title: 'Curage planifié', detail: 'Bassin Gbézè · jeudi', kind: 'BASIN' },
  { id: 't5', occurredAt: '2026-10-14T09:12:00Z', title: 'Prévision mise à jour', detail: 'Open-Meteo · 45–60 mm ce soir', kind: 'WEATHER' },
];

export const demoTeams: Team[] = [
  { id: 'e3', name: 'Équipe terrain 3', zone: 'Bassin Léo 2000', status: 'SUR_PLACE', assignment: 'Débordement en cours' },
  { id: 'e1', name: 'Équipe terrain 1', zone: 'Bè', status: 'EN_ROUTE', assignment: 'Caniveaux du marché' },
  { id: 'e2', name: 'Équipe terrain 2', zone: 'Agoè-Nyivé', status: 'DISPONIBLE', assignment: null },
];

export const demoOutbox: Outbound[] = [
  { id: 'o1', recipient: '+22890000001', body: 'Edzii-Nku · Forte pluie prévue à Bè ce soir (18 h – 23 h). Surélevez vos biens, évitez les caniveaux.', status: 'FAILED', createdAt: '2026-10-14T16:43:00Z' },
  { id: 'o2', recipient: '+22890000002', body: 'Edzii-Nku · Signalement EN-0327 reçu. La mairie le vérifie. Merci.', status: 'QUEUED', createdAt: '2026-10-14T17:58:00Z' },
];

function report(
  reference: string,
  place: string,
  neighborhoodId: string,
  neighborhoodName: string,
  commune: string,
  latitude: number,
  longitude: number,
  waterLevel: ReportItem['waterLevel'],
  waterLevelLabel: string,
  comment: string,
  status: ReportItem['status'],
  statusLabel: string,
  channel: string,
  confirmations: number,
  createdAt: string,
): ReportItem {
  return {
    id: reference, reference, placeLabel: place, neighborhoodId, neighborhoodName, commune,
    latitude, longitude, accuracyM: 8, waterLevel, waterLevelLabel, comment, status, statusLabel,
    channel, confirmations, tags: ['Caniveau bouché'], photoUrl: null, createdAt,
  };
}
