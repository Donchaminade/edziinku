import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

/**
 * Charge une ressource de l’API. En cas d’échec, garde la valeur de repli
 * (données de démonstration) et signale la source pour l’affichage.
 */
export function useApi<T>(path: string | null, fallback: T | (() => T)) {
  const [data, setData] = useState<T | null>(null);
  const [source, setSource] = useState<'api' | 'demo' | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return;
    let cancel = false;
    api<T>(path)
      .then((value) => {
        if (cancel) return;
        setData(value);
        setSource('api');
      })
      .catch(() => {
        if (cancel) return;
        setData(typeof fallback === 'function' ? (fallback as () => T)() : fallback);
        setSource('demo');
      });
    return () => { cancel = true; };
    // La valeur de repli est volontairement exclue : elle ne doit pas relancer la requête.
  }, [path, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  return { data, setData, source, loading: data === null, reload };
}
