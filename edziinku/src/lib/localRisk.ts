import type { AlertItem, LocalRisk, Neighborhood } from '../types';

export const MATCH_MAX_KM = 3;
export const NEIGHBOR_RADIUS_KM = 2;
export const GPS_ACCEPT_M = 15;
export const GPS_TARGET_M = 5;

const EARTH_M = 6_371_000;

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const dPhi = (lat2 - lat1) * Math.PI / 180;
  const dLambda = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return 2 * EARTH_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function usable(hood: Neighborhood) {
  return hood.active !== false && hood.slug !== 'non-localise'
    && Number.isFinite(hood.latitude) && Number.isFinite(hood.longitude);
}

export function nearestNeighborhood(hoods: Neighborhood[], lat: number, lng: number, maxKm = MATCH_MAX_KM) {
  let best: { neighborhood: Neighborhood; meters: number } | null = null;
  for (const hood of hoods) {
    if (!usable(hood)) continue;
    const meters = haversineMeters(lat, lng, hood.latitude, hood.longitude);
    if (!best || meters < best.meters) best = { neighborhood: hood, meters };
  }
  if (!best || best.meters > maxKm * 1000) return null;
  return best;
}

export function neighborHoods(origin: Neighborhood, all: Neighborhood[], radiusKm = NEIGHBOR_RADIUS_KM) {
  const max = radiusKm * 1000;
  return all
    .filter((hood) => usable(hood) && hood.id !== origin.id
      && haversineMeters(origin.latitude, origin.longitude, hood.latitude, hood.longitude) <= max)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

function alertActive(alert: AlertItem, now: number, treatAsLive: boolean) {
  if (treatAsLive) return true;
  if (alert.endsAt && new Date(alert.endsAt).getTime() <= now) return false;
  if (alert.startsAt && new Date(alert.startsAt).getTime() > now) return false;
  return true;
}

const WEATHER_KINDS = new Set(['ORAGE', 'FORTE_PLUIE', 'VIGILANCE_INONDATION', 'CALME', 'RAIN']);

const LEVEL_RANK: Record<string, number> = { CRITIQUE: 4, ELEVE: 3, VIGILANCE: 2, INFO: 1 };

const KIND_RANK: Record<string, number> = {
  VIGILANCE_INONDATION: 4,
  ORAGE: 3,
  FORTE_PLUIE: 2,
  RAIN: 1,
};

function weatherRank(alert: AlertItem) {
  const level = LEVEL_RANK[alert.level] ?? 0;
  if (alert.kind === 'CALME') return level;
  return (KIND_RANK[alert.kind] ?? 0) * 100 + level;
}

/** Signe météo le plus grave encore actif. Un calme plus récent ne masque pas une vigilance. */
export function leadLocalAlert<T extends { alert: AlertItem }>(alerts: T[]): T | undefined {
  const weather = alerts.filter((item) => WEATHER_KINDS.has(item.alert.kind));
  const hazards = weather.filter((item) => item.alert.kind !== 'CALME');
  const pool = hazards.length > 0 ? hazards : weather;
  return pool.reduce<T | undefined>((best, item) => {
    if (!best || weatherRank(item.alert) > weatherRank(best.alert)) return item;
    return best;
  }, undefined);
}

function alertScope(alert: AlertItem, here: Neighborhood, all: Neighborhood[]): 'SECTOR' | 'NEIGHBOR' | null {
  if (!alert.neighborhoodId && !alert.cityId) return 'SECTOR';
  if (alert.neighborhoodId === here.id) return 'SECTOR';
  if (alert.cityId && here.cityId && alert.cityId === here.cityId) return 'SECTOR';
  const origin = all.find((hood) => hood.id === alert.neighborhoodId);
  if (origin && neighborHoods(origin, all).some((hood) => hood.id === here.id)) return 'NEIGHBOR';
  if (!alert.neighborhoodId && alert.cityId && cityReaches(alert.cityId, here, all)) return 'NEIGHBOR';
  return null;
}

/** Quartiers hors ville dont le centroïde est à moins de 2 km d’un quartier de la ville. */
function cityReaches(cityId: string, here: Neighborhood, all: Neighborhood[]) {
  return all.some((hood) => usable(hood) && hood.cityId === cityId
    && neighborHoods(hood, all).some((near) => near.id === here.id));
}

/**
 * Quartiers touchés par le signe (secteur, puis voisinages à 2 km), sauf le quartier de l’usager.
 * Une ville sans quartier cible diffuse à tous ses quartiers, comme le serveur.
 */
function reachedNames(alert: AlertItem, here: Neighborhood, all: Neighborhood[]) {
  const seen = new Set<string>();
  const sector: Neighborhood[] = [];
  const take = (hood: Neighborhood | undefined) => {
    if (!hood || !usable(hood) || seen.has(hood.id)) return;
    seen.add(hood.id);
    sector.push(hood);
  };
  if (alert.neighborhoodId) {
    take(all.find((hood) => hood.id === alert.neighborhoodId));
  } else if (alert.cityId) {
    for (const hood of all) {
      if (hood.cityId === alert.cityId) take(hood);
    }
  }
  const names: string[] = [];
  const named = new Set<string>();
  const push = (name: string) => {
    if (!name || name === here.name || named.has(name)) return;
    named.add(name);
    names.push(name);
  };
  for (const hood of sector) push(hood.name);
  for (const origin of sector) {
    for (const neighbor of neighborHoods(origin, all)) push(neighbor.name);
  }
  return names;
}

export function riskFromCatalog(
  hoods: Neighborhood[],
  alerts: AlertItem[],
  lat: number,
  lng: number,
  treatAlertsAsLive = false,
): LocalRisk {
  const match = nearestNeighborhood(hoods, lat, lng);
  if (!match) {
    return {
      neighborhood: null,
      distanceM: null,
      outOfKnownZone: true,
      urgencyLabel: null,
      urgencyColor: null,
      urgencyRank: null,
      riskLevel: null,
      alerts: [],
      neighborNames: [],
      neighborRadiusKm: NEIGHBOR_RADIUS_KM,
      matchMaxKm: MATCH_MAX_KM,
    };
  }
  const here = match.neighborhood;
  const neighbors = neighborHoods(here, hoods);
  const now = Date.now();
  const localAlerts = alerts.flatMap((alert) => {
    if (!alertActive(alert, now, treatAlertsAsLive)) return [];
    const scope = alertScope(alert, here, hoods);
    if (!scope) return [];
    return [{
      alert,
      scope,
      neighborNames: reachedNames(alert, here, hoods),
    }];
  });
  return {
    neighborhood: here,
    distanceM: match.meters,
    outOfKnownZone: false,
    urgencyLabel: here.urgencyLabel ?? here.riskLabel,
    urgencyColor: here.urgencyColor ?? null,
    urgencyRank: here.urgencyRank ?? null,
    riskLevel: here.riskLevel,
    alerts: localAlerts,
    neighborNames: neighbors.map((hood) => hood.name),
    neighborRadiusKm: NEIGHBOR_RADIUS_KM,
    matchMaxKm: MATCH_MAX_KM,
  };
}
