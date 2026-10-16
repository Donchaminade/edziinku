import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import { geoPermission, readGeoConsent, writeGeoConsent } from './geoConsent';
import { GPS_ACCEPT_M, GPS_TARGET_M, riskFromCatalog } from './localRisk';
import { useLive } from './useCatalog';
import type { LocalRisk } from '../types';

export type RiskStatus = 'idle' | 'prompt' | 'locating' | 'ready' | 'denied' | 'error';

export function useLocalRisk() {
  const live = useLive();
  const [status, setStatus] = useState<RiskStatus>('prompt');
  const [risk, setRisk] = useState<LocalRisk | null>(null);
  const [accuracyM, setAccuracyM] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const applyPosition = useCallback(async (lat: number, lng: number, accuracy?: number | null) => {
    setAccuracyM(accuracy ?? null);
    try {
      const remote = await api<LocalRisk>(`/api/geo/risk?lat=${lat}&lng=${lng}`);
      setRisk(remote);
      setStatus('ready');
      setMessage(remote.outOfKnownZone
        ? `Hors zone connue (plus de ${remote.matchMaxKm} km d’un quartier suivi).`
        : null);
    } catch {
      const local = riskFromCatalog(live.neighborhoods, live.alerts, lat, lng, live.source === 'demo');
      setRisk(local);
      setStatus('ready');
      setMessage(local.outOfKnownZone
        ? `Hors zone connue (plus de ${local.matchMaxKm} km d’un quartier suivi).`
        : null);
    }
  }, [live.alerts, live.neighborhoods, live.source]);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setMessage('La géolocalisation n’est pas disponible sur cet appareil.');
      return;
    }
    setStatus('locating');
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        writeGeoConsent('granted');
        void applyPosition(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          writeGeoConsent('denied');
          setStatus('denied');
          setRisk(null);
          setMessage('Activez la position pour voir le risque près de chez vous.');
          return;
        }
        setStatus('error');
        setMessage(error.code === error.POSITION_UNAVAILABLE
          ? 'Position indisponible. Réessayez à l’extérieur.'
          : 'Impossible d’obtenir la position. Réessayez.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [applyPosition]);

  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    let cancel = false;
    (async () => {
      const stored = readGeoConsent();
      const permission = await geoPermission();
      if (cancel) return;
      if (permission === 'denied' || stored === 'denied') {
        if (permission === 'denied') writeGeoConsent('denied');
        setStatus('denied');
        setMessage('Activez la position pour voir le risque près de chez vous.');
        return;
      }
      if (stored === 'granted') {
        request();
        return;
      }
      setStatus('prompt');
    })();
    return () => { cancel = true; };
  }, [request]);

  return { status, risk, accuracyM, message, request, applyPosition };
}

export function gpsAccuracyHint(accuracy: number) {
  if (accuracy <= GPS_TARGET_M) return `Précision ± ${Math.round(accuracy)} m — point exact.`;
  if (accuracy <= GPS_ACCEPT_M) return `Précision ± ${Math.round(accuracy)} m — acceptable.`;
  return `Précision ± ${Math.round(accuracy)} m — trop flou. Rapprochez-vous ou allez à l’extérieur.`;
}

export { GPS_ACCEPT_M, GPS_TARGET_M };
