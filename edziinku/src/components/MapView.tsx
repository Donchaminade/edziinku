import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import { useReducedMotion } from 'motion/react';
import { useTheme } from '../theme/ThemeProvider';
import type { Tone } from '../types';

export type Basemap = 'satellite' | 'plan';

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  tone: Tone;
  kind?: 'report' | 'basin' | 'me';
}

const LOME: [number, number] = [6.1725, 1.2314];

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
const tiles = {
  satellite: {
    base: `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
    labels: `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`,
    attribution: 'Imagerie &copy; Esri, Maxar, Earthstar Geographics',
  },
  planLight: {
    base: `${ESRI}/World_Street_Map/MapServer/tile/{z}/{y}/{x}`,
    labels: null as string | null,
    attribution: 'Fond &copy; Esri, HERE, Garmin &middot; &copy; contributeurs OpenStreetMap',
  },
  planDark: {
    base: `${ESRI}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    labels: `${ESRI}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
    attribution: 'Fond &copy; Esri, HERE, Garmin &middot; &copy; contributeurs OpenStreetMap',
  },
};

function icon(pin: MapPin, selected: boolean) {
  return L.divIcon({
    className: 'map-pin-wrap',
    html: `<span class="map-pin" data-tone="${pin.tone}" data-kind="${pin.kind ?? 'report'}" data-selected="${selected}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    tooltipAnchor: [0, -12],
  });
}

export interface MapFocus {
  lat: number;
  lng: number;
  zoom?: number;
}

function Focus({ pin, pins, fit, focus }: { pin: MapPin | null; pins: MapPin[]; fit: boolean; focus?: MapFocus | null }) {
  const map = useMap();
  const reduce = useReducedMotion();

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  useEffect(() => {
    if (!focus) return;
    const apply = () => {
      map.invalidateSize();
      map.setView([focus.lat, focus.lng], focus.zoom ?? 15, { animate: false });
      const host = map.getContainer().closest('.map-frame');
      if (host instanceof HTMLElement) {
        const center = map.getCenter();
        host.dataset.center = `${center.lat.toFixed(4)},${center.lng.toFixed(4)},${map.getZoom()}`;
      }
    };
    apply();
    map.whenReady(apply);
    const later = window.setTimeout(apply, 350);
    return () => window.clearTimeout(later);
  }, [map, focus, reduce]);

  useEffect(() => {
    if (focus || !fit || pin || pins.length < 2) return;
    map.fitBounds(L.latLngBounds(pins.map((item) => [item.lat, item.lng])), { padding: [40, 40], maxZoom: 14, animate: !reduce });
  }, [map, fit, pins.length, focus]);

  useEffect(() => {
    if (!pin) return;
    map.flyTo([pin.lat, pin.lng], Math.max(map.getZoom(), 14), { duration: reduce ? 0 : 0.8 });
  }, [map, pin, reduce]);

  return null;
}

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (event) => onPick(event.latlng.lat, event.latlng.lng) });
  return null;
}

export function MapView({
  pins,
  selectedId,
  onSelect,
  className,
  zoom = 12,
  fit = true,
  interactive = true,
  onPick,
  focus,
  defaultBasemap = 'satellite',
  showBasemapControl = true,
}: {
  pins: MapPin[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  zoom?: number;
  fit?: boolean;
  interactive?: boolean;
  onPick?: (lat: number, lng: number) => void;
  focus?: MapFocus | null;
  defaultBasemap?: Basemap;
  showBasemapControl?: boolean;
}) {
  const { theme } = useTheme();
  const [basemap, setBasemap] = useState<Basemap>(defaultBasemap);
  const selected = pins.find((pin) => pin.id === selectedId) ?? null;
  const markers = useMemo(
    () => pins.map((pin) => ({ pin, icon: icon(pin, pin.id === selectedId) })),
    [pins, selectedId],
  );
  const layer = basemap === 'satellite'
    ? tiles.satellite
    : theme === 'dark' ? tiles.planDark : tiles.planLight;

  return (
    <div
      className={`map-frame ${className ?? ''}`}
      data-basemap={basemap}
      data-focus={focus ? `${focus.lat},${focus.lng},${focus.zoom ?? zoom}` : undefined}
    >
      <MapContainer
        key={focus ? `${focus.lat.toFixed(5)},${focus.lng.toFixed(5)},${focus.zoom ?? zoom}` : 'lome'}
        center={focus ? [focus.lat, focus.lng] : LOME}
        zoom={focus?.zoom ?? zoom}
        zoomControl={false}
        scrollWheelZoom={interactive}
        dragging={interactive}
        className="h-full w-full"
        attributionControl
      >
        <TileLayer
          key={`${basemap}-${theme}-base`}
          className={basemap === 'satellite' ? 'map-sat' : 'map-base'}
          attribution={layer.attribution}
          url={layer.base}
          maxNativeZoom={basemap === 'satellite' ? 19 : theme === 'dark' ? 16 : 19}
          maxZoom={19}
        />
        {layer.labels && (
          <TileLayer
            key={`${basemap}-${theme}-labels`}
            className="map-labels"
            url={layer.labels}
            maxNativeZoom={basemap === 'satellite' ? 19 : 16}
            maxZoom={19}
          />
        )}
        {interactive && <ZoomControl position="bottomright" />}
        <Focus pin={selected} pins={pins} fit={fit} focus={focus} />
        {onPick && <ClickToPlace onPick={onPick} />}
        {markers.map(({ pin, icon: markerIcon }) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={markerIcon}
            zIndexOffset={pin.id === selectedId ? 1000 : 0}
            eventHandlers={{ click: () => onSelect?.(pin.id) }}
            keyboard
            title={pin.label}
          >
            <Tooltip direction="top">{pin.label}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
      {showBasemapControl && (
        <div className="map-basemap" role="group" aria-label="Fond de carte">
          <button
            type="button"
            data-on={basemap === 'satellite'}
            aria-pressed={basemap === 'satellite'}
            onClick={() => setBasemap('satellite')}
          >
            Satellite
          </button>
          <button
            type="button"
            data-on={basemap === 'plan'}
            aria-pressed={basemap === 'plan'}
            onClick={() => setBasemap('plan')}
          >
            Plan
          </button>
        </div>
      )}
    </div>
  );
}

export function MapLegend({ className }: { className?: string }) {
  const items: [Tone, string][] = [['info', 'Cheville'], ['warn', 'Genou'], ['alert', 'Taille']];
  return (
    <div className={`overlay-panel flex items-center gap-3 rounded-2xl px-3 py-2 text-xs font-semibold ${className ?? ''}`}>
      {items.map(([tone, label]) => (
        <span key={tone} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: tone === 'info' ? 'var(--cyan)' : tone === 'warn' ? 'var(--warn)' : 'var(--alert)' }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}
