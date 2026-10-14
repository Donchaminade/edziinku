import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from './api';
import { demoAlerts, demoBasins, demoNeighborhoods, demoReports, demoWeather } from '../data/demo';
import type { AlertItem, Basin, HourlyResponse, Neighborhood, Page, ReportItem, WeatherResponse } from '../types';

export interface Catalog {
  loading: boolean;
  source: 'api' | 'demo';
  neighborhoods: Neighborhood[];
  alerts: AlertItem[];
  reports: ReportItem[];
  basins: Basin[];
  weather: WeatherResponse;
  hourly: HourlyResponse;
  reload: () => void;
}

export function useCatalog(): Catalog {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<Omit<Catalog, 'reload'>>({
    loading: true,
    source: 'demo',
    neighborhoods: [],
    alerts: [],
    reports: [],
    basins: [],
    weather: demoWeather,
    hourly: { source: 'demo', demo: true, hours: demoAlerts[0]?.rainSeries ?? [] },
  });

  useEffect(() => {
    let cancel = false;
    setState((current) => ({ ...current, loading: true }));
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
        if (cancel) return;
        setState({
          loading: false,
          source: 'api',
          neighborhoods,
          alerts,
          reports: reports.items,
          basins,
          weather,
          hourly,
        });
      } catch {
        if (cancel) return;
        setState({
          loading: false,
          source: 'demo',
          neighborhoods: demoNeighborhoods,
          alerts: demoAlerts,
          reports: demoReports,
          basins: demoBasins,
          weather: demoWeather,
          hourly: { source: 'demo', demo: true, hours: demoAlerts[0]?.rainSeries ?? [] },
        });
      }
    })();
    return () => {
      cancel = true;
    };
  }, [tick]);

  return { ...state, reload: () => setTick((value) => value + 1) };
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
