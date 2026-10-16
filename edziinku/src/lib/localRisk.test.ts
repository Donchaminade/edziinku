import assert from 'node:assert/strict';
import { test } from 'node:test';
import { neighborHoods, nearestNeighborhood } from './localRisk.ts';
import type { Neighborhood } from '../types.ts';

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
