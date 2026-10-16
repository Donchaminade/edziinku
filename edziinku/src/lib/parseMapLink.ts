export interface ParsedCoords {
  latitude: number;
  longitude: number;
  source: 'pair' | 'geo' | 'at' | 'osm' | 'query';
}

const BARE = /^\s*([+-]?\d+(?:\.\d+)?)\s*[,;\s]\s*([+-]?\d+(?:\.\d+)?)\s*$/;
const GEO = /^geo:([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)/i;
const AT = /@([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)/;
const OSM_HASH = /#map=\d+\/([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)/;
const PAIR = /([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)/;

export function validLatLng(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= -90 && lat <= 90
    && lng >= -180 && lng <= 180
    && !(lat === 0 && lng === 0);
}

export function looksLikeUnresolvedShortlink(raw: string) {
  const lower = raw.toLowerCase();
  return lower.includes('maps.app.goo.gl') || lower.includes('goo.gl/maps');
}

export function parseMapLink(raw: string): ParsedCoords | null {
  const text = raw.trim();
  if (!text) return null;

  const geo = text.match(GEO);
  if (geo) return coords(geo[1], geo[2], 'geo');

  const bare = text.match(BARE);
  if (bare && !looksLikeUrl(text)) return coords(bare[1], bare[2], 'pair');

  const decoded = safeDecode(text);
  const at = decoded.match(AT);
  if (at) return coords(at[1], at[2], 'at');

  const osm = decoded.match(OSM_HASH);
  if (osm) return coords(osm[1], osm[2], 'osm');

  return fromQuery(decoded);
}

function fromQuery(text: string): ParsedCoords | null {
  const query = queryOf(text);
  if (!query) return null;
  let lat: string | null = null;
  let lng: string | null = null;
  for (const part of query.split('&')) {
    const eq = part.indexOf('=');
    if (eq < 1) continue;
    const key = safeDecode(part.slice(0, eq)).toLowerCase();
    const value = safeDecode(part.slice(eq + 1));
    if (key === 'mlat') lat = value;
    else if (key === 'mlon' || key === 'mlng') lng = value;
    else if (['ll', 'sll', 'center', 'q', 'query', 'daddr', 'saddr'].includes(key)) {
      const pair = pairIn(value);
      if (pair) return pair;
    }
  }
  if (lat && lng) return coords(lat, lng, 'query');
  return null;
}

function pairIn(value: string): ParsedCoords | null {
  const match = value.replace('loc:', '').match(PAIR);
  return match ? coords(match[1], match[2], 'query') : null;
}

function coords(latRaw: string, lngRaw: string, source: ParsedCoords['source']): ParsedCoords | null {
  const latitude = Number(latRaw);
  const longitude = Number(lngRaw);
  if (!validLatLng(latitude, longitude)) return null;
  return { latitude, longitude, source };
}

function looksLikeUrl(text: string) {
  const lower = text.toLowerCase();
  return lower.startsWith('http://') || lower.startsWith('https://') || lower.includes('maps.');
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function queryOf(text: string) {
  try {
    const href = text.includes('://') || text.startsWith('geo:') ? text : `https://${text}`;
    return new URL(href).search.replace(/^\?/, '') || null;
  } catch {
    const q = text.indexOf('?');
    return q >= 0 ? text.slice(q + 1) : null;
  }
}
