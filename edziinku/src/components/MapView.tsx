import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import { useReducedMotion } from 'motion/react';
import { useTheme } from '../theme/ThemeProvider';
import type { Tone } from '../types';

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  tone: Tone;
  kind?: 'report' | 'basin' | 'me';
}

const LOME: [number, number] = [6.1725, 1.2314];

const tiles = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
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

function Focus({ pin, pins, fit }: { pin: MapPin | null; pins: MapPin[]; fit: boolean }) {
  const map = useMap();
  const reduce = useReducedMotion();

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  useEffect(() => {
    if (!fit || pin || pins.length < 2) return;
    map.fitBounds(L.latLngBounds(pins.map((item) => [item.lat, item.lng])), { padding: [40, 40], maxZoom: 14, animate: !reduce });
    // Recentrage seulement quand le nombre de points change.
  }, [map, fit, pins.length]);

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
}: {
  pins: MapPin[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  zoom?: number;
  fit?: boolean;
  interactive?: boolean;
  onPick?: (lat: number, lng: number) => void;
}) {
  const { theme } = useTheme();
  const selected = pins.find((pin) => pin.id === selectedId) ?? null;
  const markers = useMemo(
    () => pins.map((pin) => ({ pin, icon: icon(pin, pin.id === selectedId) })),
    [pins, selectedId],
  );

  return (
    <div className={`map-frame ${className ?? ''}`}>
      <MapContainer
        center={LOME}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={interactive}
        dragging={interactive}
        className="h-full w-full"
        attributionControl
      >
        <TileLayer key={theme} attribution="&copy; OpenStreetMap &copy; CARTO" url={tiles[theme]} />
        {interactive && <ZoomControl position="bottomright" />}
        <Focus pin={selected} pins={pins} fit={fit} />
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
    </div>
  );
}

export function MapLegend({ className }: { className?: string }) {
  const items: [Tone, string][] = [['info', 'Cheville'], ['warn', 'Genou'], ['alert', 'Taille']];
  return (
    <div className={`glass-strong flex items-center gap-3 rounded-2xl px-3 py-2 text-xs font-semibold ${className ?? ''}`}>
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
