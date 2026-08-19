"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Inline SVG charts — no charting library, so the admin bundle stays small.
 * Each chart is hoverable and ships an accessible table alternative.
 */

/* -------------------------------------------------------------------------- */
/*                                 Line chart                                 */
/* -------------------------------------------------------------------------- */

export function LineChart({
  data,
  labelKey,
  valueKey,
  prefix = "",
  suffix = "",
  caption,
  color = "var(--color-green-deep)",
  fill = "var(--color-green)",
}: {
  data: readonly Record<string, string | number>[];
  labelKey: string;
  valueKey: string;
  prefix?: string;
  suffix?: string;
  caption: string;
  color?: string;
  fill?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId();

  const values = data.map((d) => Number(d[valueKey]));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const W = 640;
  const H = 220;
  const PX = 12;
  const PY = 18;

  const points = values.map((v, i) => {
    const x = PX + (i * (W - PX * 2)) / Math.max(1, values.length - 1);
    const y = H - PY - ((v - min) / range) * (H - PY * 2);
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${points[points.length - 1][0]},${H} L${points[0][0]},${H} Z`;
  const active = hover ?? null;

  return (
    <figure>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-56 w-full touch-none [overflow:hidden]"
          role="img"
          aria-label={caption}
          preserveAspectRatio="none"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fill} stopOpacity="0.35" />
              <stop offset="100%" stopColor={fill} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={PX}
              x2={W - PX}
              y1={PY + f * (H - PY * 2)}
              y2={PY + f * (H - PY * 2)}
              stroke="var(--color-ink)"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          ))}

          <path d={area} fill={`url(#${gradId})`} />
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {points.map(([x, y], i) => (
            <g key={i}>
              {/*
                Wide invisible hit area for comfortable hovering, clamped to
                the chart so the end bands do not spill past the viewBox.
              */}
              {(() => {
                const band = (W - PX * 2) / values.length;
                const left = Math.max(0, x - band / 2);
                const right = Math.min(W, x + band / 2);
                return (
                  <rect
                    x={left}
                    y={0}
                    width={Math.max(0, right - left)}
                    height={H}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                  />
                );
              })()}
              <circle
                cx={x}
                cy={y}
                r={active === i ? 7 : 4}
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="transition-all"
              />
            </g>
          ))}

          {active !== null && (
            <line
              x1={points[active][0]}
              x2={points[active][0]}
              y1={PY}
              y2={H - PY}
              stroke={color}
              strokeOpacity="0.3"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}
        </svg>

        {/* Tooltip */}
        {active !== null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 rounded-lg border-2 border-ink bg-ink px-2.5 py-1.5 text-xs font-bold text-cream shadow-lg"
            style={{
              left: `${(points[active][0] / W) * 100}%`,
              top: `${(points[active][1] / H) * 100 - 18}%`,
            }}
          >
            {String(data[active][labelKey])}: {prefix}
            {Number(data[active][valueKey]).toLocaleString()}
            {suffix}
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-between text-xs font-semibold text-ink/55">
        {data.map((d, i) => (
          <span
            key={i}
            className={cn(
              i % 2 && data.length > 8 ? "hidden sm:inline" : "",
              active === i && "text-green-deep",
            )}
          >
            {String(d[labelKey])}
          </span>
        ))}
      </div>

      <figcaption className="sr-only">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Period</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{String(d[labelKey])}</td>
                <td>{`${prefix}${d[valueKey]}${suffix}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Funnel chart                                */
/* -------------------------------------------------------------------------- */

export function FunnelChart({
  data,
  caption,
}: {
  data: readonly { stage: string; count: number }[];
  caption: string;
}) {
  const max = Math.max(...data.map((d) => d.count));

  return (
    <figure>
      <ul className="space-y-3">
        {data.map((d, i) => {
          const pct = Math.round((d.count / max) * 100);
          const conv = i === 0 ? 100 : Math.round((d.count / data[0].count) * 100);
          const drop = i === 0 ? 0 : data[i - 1].count - d.count;

          return (
            <li key={d.stage} className="group">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-semibold text-ink">{d.stage}</span>
                <span className="text-ink/60">
                  <strong className="text-ink">{d.count}</strong> · {conv}%
                  {drop > 0 && (
                    <span className="ml-2 text-xs text-red-700 opacity-0 transition-opacity group-hover:opacity-100">
                      −{drop}
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-1.5 h-4 overflow-hidden rounded-full border-2 border-ink bg-cream">
                <div
                  className="h-full rounded-r-full bg-green transition-all duration-500 group-hover:bg-green-deep"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Bar chart                                  */
/* -------------------------------------------------------------------------- */

export function BarChart({
  data,
  caption,
  suffix = "%",
}: {
  data: readonly { day: string; value: number }[];
  caption: string;
  suffix?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 100);

  return (
    <figure>
      <div className="flex h-44 items-end justify-between gap-2">
        {data.map((d, i) => (
          <div
            key={d.day}
            className="flex flex-1 cursor-default flex-col items-center gap-2"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span
              className={cn(
                "text-xs font-bold transition-colors",
                hover === i ? "text-green-deep" : "text-ink/55",
              )}
            >
              {d.value}
              {suffix}
            </span>
            <div
              className={cn(
                "w-full rounded-t-lg border-2 border-ink transition-all duration-300",
                hover === i ? "bg-green-deep" : "bg-teal",
              )}
              style={{ height: `${(d.value / max) * 100}%` }}
              title={`${d.day}: ${d.value}${suffix}`}
            />
            <span className="text-xs font-semibold text-ink/60">{d.day}</span>
          </div>
        ))}
      </div>
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Donut chart                                 */
/* -------------------------------------------------------------------------- */

export function DonutChart({
  data,
  caption,
  centerLabel,
  centerValue,
}: {
  data: readonly { label: string; value: number; color: string }[];
  caption: string;
  centerLabel?: string;
  centerValue?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((a, d) => a + d.value, 0) || 1;

  const R = 70;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <figure className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <div className="relative shrink-0">
        <svg viewBox="0 0 180 180" className="size-44" role="img" aria-label={caption}>
          <g transform="rotate(-90 90 90)">
            {data.map((d, i) => {
              const len = (d.value / total) * C;
              const dash = `${len} ${C - len}`;
              const el = (
                <circle
                  key={d.label}
                  cx="90"
                  cy="90"
                  r={R}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={hover === i ? 30 : 24}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  className="cursor-default transition-all duration-200"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                />
              );
              offset += len;
              return el;
            })}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-2xl text-ink">
              {hover !== null
                ? `${Math.round((data[hover].value / total) * 100)}%`
                : (centerValue ?? total)}
            </p>
            <p className="text-xs font-semibold text-ink/55">
              {hover !== null ? data[hover].label : (centerLabel ?? "Total")}
            </p>
          </div>
        </div>
      </div>

      <ul className="space-y-2">
        {data.map((d, i) => (
          <li
            key={d.label}
            className={cn(
              "flex cursor-default items-center gap-2.5 text-sm transition-opacity",
              hover !== null && hover !== i && "opacity-45",
            )}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span
              className="size-3.5 shrink-0 rounded border-2 border-ink"
              style={{ background: d.color }}
            />
            <span className="font-semibold text-ink">{d.label}</span>
            <span className="text-ink/60">{d.value}</span>
          </li>
        ))}
      </ul>

      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}
