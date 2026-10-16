import { useEffect, useState } from 'react';
import { api } from './api';
import type { HotspotResponse } from '../types';

export type HotspotStatus = 'loading' | 'ok' | 'empty' | 'error';

/**
 * Charge le top des zones signalées. En cas d’échec API : état vide,
 * jamais de jeu de démo inventé.
 */
export function useHotspots(days = 7, limit = 200) {
  const [data, setData] = useState<HotspotResponse>({ days, zones: [] });
  const [status, setStatus] = useState<HotspotStatus>('loading');

  useEffect(() => {
    let cancel = false;
    setStatus('loading');
    api<HotspotResponse>(`/api/reports/hotspots?days=${days}&limit=${limit}`)
      .then((value) => {
        if (cancel) return;
        const zones = Array.isArray(value.zones) ? value.zones : [];
        setData({ days: value.days ?? days, zones });
        setStatus(zones.length ? 'ok' : 'empty');
      })
      .catch(() => {
        if (cancel) return;
        setData({ days, zones: [] });
        setStatus('error');
      });
    return () => { cancel = true; };
  }, [days, limit]);

  return { data, status, loading: status === 'loading', zones: data.zones };
}
