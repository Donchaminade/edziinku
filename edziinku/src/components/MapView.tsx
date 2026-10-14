import { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { useReducedMotion } from 'framer-motion';

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  tone: 'alert' | 'warn' | 'info' | 'ok';
}

function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function toneColor(tone: MapPin['tone']) {
  if (tone === 'alert') return token('--alert-solid');
  if (tone === 'warn') return token('--amber-solid');
  if (tone === 'ok') return token('--ok');
  return token('--cyan');
}

function Focus({ pin }: { pin: MapPin | null }) {
  const map = useMap();
  const reduce = useReducedMotion();
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 180);
    return () => window.clearTimeout(timer);
  }, [map]);
  useEffect(() => {
    if (!pin) return;
    map.flyTo([pin.lat, pin.lng], 14, { duration: reduce ? 0 : 0.7 });
  }, [map, pin, reduce]);
  return null;
}

export function MapView({
  pins,
  selectedId,
  onSelect,
  className,
}: {
  pins: MapPin[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const selected = pins.find((pin) => pin.id === selectedId) ?? null;
  return (
    <div className={`map-frame ${className ?? ''}`}>
      <MapContainer center={[6.1725, 1.2314]} zoom={12} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Focus pin={selected} />
        {pins.map((pin) => (
          <CircleMarker
            key={pin.id}
            center={[pin.lat, pin.lng]}
            radius={selectedId === pin.id ? 12 : 8}
            pathOptions={{
              color: token('--map-text'),
              weight: 2,
              fillColor: toneColor(pin.tone),
              fillOpacity: 0.95,
            }}
            eventHandlers={{ click: () => onSelect?.(pin.id) }}
          >
            <Tooltip>{pin.label}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
