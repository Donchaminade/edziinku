const KEY = 'edzii-geo-consent';

export type GeoConsent = 'granted' | 'denied' | null;

export function readGeoConsent(): GeoConsent {
  try {
    const value = localStorage.getItem(KEY);
    if (value === 'granted' || value === 'denied') return value;
  } catch {
    /* navigation privée */
  }
  return null;
}

export function writeGeoConsent(value: Exclude<GeoConsent, null>) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* stockage indisponible */
  }
}

export function clearGeoConsent() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export async function geoPermission(): Promise<PermissionState | 'unknown'> {
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state;
  } catch {
    return 'unknown';
  }
}
