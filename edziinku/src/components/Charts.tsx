import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { ease } from './ui/motion';

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  /** Barre « prévision » : contour et aplat léger plutôt que plein. */
  muted?: boolean;
}

/** Histogramme de pluie, avec infobulle au survol ou au toucher. */
export function BarChart({ data, unit = 'mm', height = 180 }: { data: BarDatum[]; unit?: string; height?: number }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...data.map((item) => item.value), 1);
  const ticks = [0, 0.5, 1].map((ratio) => Math.round(max * ratio));

  return (
    <div className="relative" style={{ height }}>
      <div className="absolute inset-x-0 top-0 bottom-7 flex flex-col justify-between" aria-hidden>
        {ticks.slice().reverse().map((tick) => (
          <div key={tick} className="flex items-center gap-2">
            <span className="t-num w-7 text-right text-[10px] text-muted">{tick}</span>
            <span className="h-px flex-1" style={{ background: 'var(--chart-grid)' }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-y-0 right-0 left-9 flex items-end gap-1.5 sm:gap-2.5" role="list">
        {data.map((item, index) => {
          const pct = Math.max(3, (item.value / max) * 100);
          const on = hover === item.key;
          return (
            <div
              key={item.key}
              role="listitem"
              aria-label={`${item.label} : ${item.value} ${unit}${item.muted ? ' (prévision)' : ''}`}
              className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              onPointerEnter={() => setHover(item.key)}
              onPointerLeave={() => setHover(null)}
            >
              <div className="relative flex w-full flex-1 items-end">
                <motion.div
                  className="w-full rounded-t-[8px] rounded-b-[3px]"
                  style={{
                    background: item.muted ? 'var(--accent-soft)' : 'var(--water)',
                    boxShadow: item.muted ? 'inset 0 0 0 1.5px var(--cyan)' : undefined,
                    opacity: hover && !on ? 0.55 : 1,
                  }}
                  initial={reduce ? false : { height: 0 }}
                  whileInView={{ height: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: index * 0.05, ease }}
                />
                {on && (
                  <motion.span
                    className="glass-strong t-num absolute left-1/2 z-10 -translate-x-1/2 rounded-lg px-2 py-1 text-xs font-semibold whitespace-nowrap"
                    style={{ bottom: `calc(${pct}% + 6px)` }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {item.value} {unit}
                  </motion.span>
                )}
              </div>
              <span className="h-5 truncate text-[11px] font-medium text-muted">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Courbe horaire en aplat translucide (pas de dégradé). */
export function AreaChart({ points, height = 140 }: { points: { x: string; y: number }[]; height?: number }) {
  const reduce = useReducedMotion();
  if (points.length < 2) return null;
  const width = 320;
  const max = Math.max(...points.map((point) => point.y), 1);
  const step = width / (points.length - 1);
  const coords = points.map((point, index) => [index * step, height - 18 - (point.y / max) * (height - 34)] as const);
  const line = coords.map(([x, y], index) => {
    if (index === 0) return `M${x},${y}`;
    const [px, py] = coords[index - 1];
    const cx = (px + x) / 2;
    return `C${cx},${py} ${cx},${y} ${x},${y}`;
  }).join(' ');
  const area = `${line} L${width},${height - 18} L0,${height - 18} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} role="img" aria-label="Pluie heure par heure">
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line key={ratio} x1="0" x2={width} y1={(height - 18) * ratio} y2={(height - 18) * ratio} stroke="var(--chart-grid)" />
      ))}
      <motion.path
        d={area}
        fill="var(--cyan)"
        fillOpacity={0.12}
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--cyan)"
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease }}
      />
      {coords.map(([x, y], index) => (
        <g key={points[index].x}>
          <circle cx={x} cy={y} r={3.5} fill="var(--surface-solid)" stroke="var(--cyan)" strokeWidth={2} />
          <text x={x} y={height - 3} textAnchor={index === 0 ? 'start' : index === coords.length - 1 ? 'end' : 'middle'} fontSize="10" fill="var(--muted)">
            {points[index].x}
          </text>
        </g>
      ))}
    </svg>
  );
}

export interface DonutSegment { key: string; label: string; value: number; color: string }

export function Donut({ segments, size = 148, label }: { segments: DonutSegment[]; size?: number; label: string }) {
  const reduce = useReducedMotion();
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 132 132" width={size} height={size} className="-rotate-90" role="img" aria-label={label}>
          <circle cx="66" cy="66" r={radius} fill="none" stroke="var(--bg-3)" strokeWidth="14" />
          {segments.map((segment, index) => {
            const length = (segment.value / total) * circumference;
            const dash = `${Math.max(0, length - 3)} ${circumference}`;
            const node = (
              <motion.circle
                key={segment.key}
                cx="66"
                cy="66"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDashoffset={-offset}
                initial={reduce ? { strokeDasharray: dash } : { strokeDasharray: `0 ${circumference}` }}
                whileInView={{ strokeDasharray: dash }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: index * 0.12, ease }}
              />
            );
            offset += length;
            return segment.value ? node : null;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="t-num text-2xl font-semibold">{segments.reduce((sum, segment) => sum + segment.value, 0)}</p>
            <p className="text-[11px] text-muted">au total</p>
          </div>
        </div>
      </div>
      <ul className="grid w-full gap-2">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: segment.color }} />
              <span className="truncate text-text2">{segment.label}</span>
            </span>
            <span className="t-num font-semibold">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
