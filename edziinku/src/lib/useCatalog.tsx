import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import { demoAlerts, demoBasins, demoNeighborhoods, demoReports, demoWeather } from '../data/demo';
import type { AlertItem, Basin, HourlyResponse, Neighborhood, Page, ReportItem, WeatherResponse } from '../types';

export interface Catalog {
  loading: boolean;
  /** « api » : données réelles ; « demo » : jeu de démonstration en attendant (ou à défaut de) l’API. */
  source: 'api' | 'demo';
  /** Vrai tant que l’API n’a ni répondu ni échoué (démarrage à froid de l’hébergeur). */
  waking: boolean;
  neighborhoods: Neighborhood[];
  alerts: AlertItem[];
  reports: ReportItem[];
  basins: Basin[];
  weather: WeatherResponse;
  hourly: HourlyResponse;
  reload: () => void;
}

type State = Omit<Catalog, 'reload'>;

/** Délai au-delà duquel on affiche la démo, sans abandonner la requête en cours. */
const WAKE_TIMEOUT = 8000;

const demoState: State = {
  loading: false,
  source: 'demo',
  waking: false,
  neighborhoods: demoNeighborhoods,
  alerts: demoAlerts,
  reports: demoReports,
  basins: demoBasins,
  weather: demoWeather,
  hourly: { source: 'demo', demo: true, hours: demoAlerts[0]?.rainSeries ?? [] },
};

export function useCatalog(): Catalog {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<State>({
    ...demoState,
    loading: true,
    neighborhoods: [],
    alerts: [],
    reports: [],
    basins: [],
  });

  useEffect(() => {
    let cancel = false;
    let settled = false;
    setState((current) => ({ ...current, loading: current.source !== 'api' }));
    const timer = window.setTimeout(() => {
      if (!cancel && !settled) setState({ ...demoState, waking: true });
    }, WAKE_TIMEOUT);

    (async () => {
      try {
        const [neighborhoods, alerts, reports, basins, weather, hourly] = await Promise.all([
          api<Neighborhood[]>('/api/neighborhoods'),
          api<AlertItem[]>('/api/alerts'),
          api<Page<ReportItem>>('/api/reports?size=50'),
          api<Basin[]>('/api/basins'),
          api<WeatherResponse>('/api/weather/daily'),
          api<HourlyResponse>('/api/weather/hourly'),
        ]);
        settled = true;
        if (cancel) return;
        setState({
          loading: false,
          source: 'api',
          waking: false,
          neighborhoods,
          alerts,
          reports: reports.items,
          basins,
          weather,
          hourly,
        });
      } catch {
        settled = true;
        if (cancel) return;
        setState(demoState);
      } finally {
        window.clearTimeout(timer);
      }
    })();

    return () => {
      cancel = true;
      window.clearTimeout(timer);
    };
  }, [tick]);

  return useMemo(() => ({ ...state, reload: () => setTick((value) => value + 1) }), [state]);
}

const CatalogContext = createContext<Catalog | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const catalog = useCatalog();
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useLive() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('Catalogue hors fournisseur');
  return ctx;
}
