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

function alertScope(alert: AlertItem, here: Neighborhood, all: Neighborhood[]): 'SECTOR' | 'NEIGHBOR' | null {
  if (!alert.neighborhoodId && !alert.cityId) return 'SECTOR';
  if (alert.neighborhoodId === here.id) return 'SECTOR';
  if (alert.cityId && here.cityId && alert.cityId === here.cityId) return 'SECTOR';
  const origin = all.find((hood) => hood.id === alert.neighborhoodId);
  if (origin && neighborHoods(origin, all).some((hood) => hood.id === here.id)) return 'NEIGHBOR';
  return null;
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
      neighborNames: neighbors.map((hood) => hood.name),
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
