import assert from 'node:assert/strict';
import { test } from 'node:test';
import { leadLocalAlert, neighborHoods, nearestNeighborhood, riskFromCatalog } from './localRisk.ts';
import type { AlertItem, Neighborhood } from '../types.ts';

function hood(id: string, slug: string, name: string, lat: number, lng: number): Neighborhood {
  return {
    id, slug, name, commune: 'Golfe 1', riskLevel: 'ELEVE', riskLabel: 'Élevé',
    latitude: lat, longitude: lng, approximate: false, active: true,
  };
}

const be = hood('be', 'be', 'Bè', 6.1315, 1.232);
const kpota = hood('kpota', 'be-kpota', 'Bè-Kpota', 6.136, 1.229);
const ahligo = hood('ahligo', 'be-ahligo', 'Bè-Ahligo', 6.1328, 1.2342);
const adidogome = hood('adi', 'adidogome', 'Adidogomé', 6.195, 1.155);
const all = [be, kpota, ahligo, adidogome];

test('rattache Bekpota au quartier le plus proche', () => {
  const match = nearestNeighborhood(all, 6.1361, 1.2288);
  assert.equal(match?.neighborhood.slug, 'be-kpota');
});

test('voisinages de Bekpota sans Adidogomé', () => {
  const names = neighborHoods(kpota, all).map((item) => item.slug);
  assert.ok(names.includes('be'));
  assert.ok(names.includes('be-ahligo'));
  assert.ok(!names.includes('adidogome'));
});

function sign(partial: Partial<AlertItem> & Pick<AlertItem, 'id' | 'title' | 'kind' | 'level'>): AlertItem {
  return {
    body: '',
    bodyEwe: null,
    eweNeedsReview: false,
    neighborhoodId: null,
    neighborhoodName: null,
    cityId: null,
    cityName: null,
    startsAt: null,
    endsAt: null,
    rainMmMin: null,
    rainMmMax: null,
    rainSeries: [],
    source: 'Mairie',
    createdAt: '2026-10-16T12:00:00Z',
    ...partial,
  };
}

test('une alerte ville atteint le quartier limitrophe hors ville', () => {
  const beCity = { ...be, cityId: 'lome', cityName: 'Lomé' };
  const kpotaCity = { ...kpota, cityId: 'lome', cityName: 'Lomé', latitude: 6.109, longitude: 1.232 };
  const sud = hood('sud', 'sud-kpota', 'Sud-Kpota', 6.0955, 1.232);
  sud.cityId = 'hors';
  const hoods = [beCity, kpotaCity, sud, adidogome];
  const citySign = sign({
    id: 'ville', title: 'Orage sur Lomé', kind: 'ORAGE', level: 'ELEVE', cityId: 'lome', cityName: 'Lomé',
  });

  const outside = riskFromCatalog(hoods, [citySign], sud.latitude, sud.longitude);
  assert.equal(outside.alerts[0]?.scope, 'NEIGHBOR');
  assert.ok(outside.alerts[0]?.neighborNames.includes('Bè'));
  assert.ok(!outside.neighborNames.includes('Bè'));

  const inside = riskFromCatalog(hoods, [citySign], beCity.latitude, beCity.longitude);
  assert.equal(inside.alerts[0]?.scope, 'SECTOR');

  const away = riskFromCatalog(hoods, [citySign], adidogome.latitude, adidogome.longitude);
  assert.equal(away.alerts.length, 0);
});

test('les noms d’alerte voisin sont ceux du secteur, pas l’anneau de l’usager', () => {
  const beCity = { ...be, cityId: 'lome', cityName: 'Lomé' };
  const kpotaCity = { ...kpota, cityId: 'lome', cityName: 'Lomé', latitude: 6.109, longitude: 1.232 };
  const edge = hood('edge', 'limitrophe', 'Limitrophe', 6.145, 1.232);
  edge.cityId = 'hors';
  const hoods = [beCity, kpotaCity, edge];
  const citySign = sign({
    id: 'ville', title: 'Vigilance', kind: 'VIGILANCE_INONDATION', level: 'CRITIQUE',
    cityId: 'lome', cityName: 'Lomé',
  });
  const risk = riskFromCatalog(hoods, [citySign], edge.latitude, edge.longitude);
  assert.equal(risk.alerts[0]?.scope, 'NEIGHBOR');
  assert.ok(risk.alerts[0]?.neighborNames.includes('Bè-Kpota'));
  assert.ok(!risk.neighborNames.includes('Bè-Kpota'));
});

test('un calme plus récent ne masque pas la vigilance', () => {
  const calm = { alert: sign({ id: 'c', title: 'Retour au calme', kind: 'CALME', level: 'INFO', createdAt: '2026-10-16T18:00:00Z' }) };
  const flood = { alert: sign({ id: 'v', title: 'Vigilance inondation', kind: 'VIGILANCE_INONDATION', level: 'CRITIQUE', createdAt: '2026-10-16T12:00:00Z' }) };
  assert.equal(leadLocalAlert([calm, flood])?.alert.title, 'Vigilance inondation');
});
