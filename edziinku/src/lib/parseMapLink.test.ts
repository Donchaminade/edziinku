import assert from 'node:assert/strict';
import { test } from 'node:test';
import { looksLikeUnresolvedShortlink, parseMapLink } from './parseMapLink.ts';

test('paire collée', () => {
  const coords = parseMapLink('6.13280, 1.23420');
  assert.ok(coords);
  assert.equal(coords.latitude, 6.1328);
  assert.equal(coords.longitude, 1.2342);
});

test('geo URI', () => {
  const coords = parseMapLink('geo:6.136,-1.22?z=18');
  assert.ok(coords);
  assert.equal(coords.latitude, 6.136);
  assert.equal(coords.longitude, -1.22);
});

test('Google @lat,lng', () => {
  const coords = parseMapLink('https://www.google.com/maps/place/Lomé/@6.1360,1.2290,17z');
  assert.ok(coords);
  assert.equal(coords?.latitude, 6.136);
  assert.equal(coords?.longitude, 1.229);
});

test('OSM hash', () => {
  const coords = parseMapLink('https://www.openstreetmap.org/#map=17/6.1328/1.2342');
  assert.ok(coords);
  assert.equal(coords?.latitude, 6.1328);
  assert.equal(coords?.longitude, 1.2342);
});

test('Apple Maps ll', () => {
  const coords = parseMapLink('https://maps.apple.com/?ll=6.1328,1.2342&z=16');
  assert.ok(coords);
  assert.equal(coords?.latitude, 6.1328);
});

test('shortlink non résolu', () => {
  assert.equal(parseMapLink('https://maps.app.goo.gl/abc123'), null);
  assert.equal(looksLikeUnresolvedShortlink('https://maps.app.goo.gl/abc123'), true);
});
