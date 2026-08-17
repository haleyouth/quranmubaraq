"use client";

/**
 * Lightweight inline SVG charts — no charting library, so the admin bundle
 * stays small. Each chart ships an accessible table alternative.
 */

export function LineChart({
  data,
  labelKey,
  valueKey,
  prefix = "",
  suffix = "",
  caption,
}: {
  data: readonly Record<string, string | number>[];
  labelKey: string;
  valueKey: string;
  prefix?: string;
  suffix?: string;
  caption: string;
}) {
  const values = data.map((d) => Number(d[valueKey]));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const W = 640;
  const H = 200;
  const P = 8;

  const points = values.map((v, i) => {
    const x = P + (i * (W - P * 2)) / Math.max(1, values.length - 1);
    const y = H - P - ((v - min) / range) * (H - P * 2);
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${points[points.length - 1][0]},${H} L${points[0][0]},${H} Z`;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-48 w-full"
        role="img"
        aria-label={caption}
        preserveAspectRatio="none"
      >
        <path d={area} fill="var(--color-green)" fillOpacity="0.2" />
        <path
          d={line}
          fill="none"
          stroke="var(--color-green-deep)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="4"
            fill="var(--color-green-deep)"
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>

      <div className="mt-2 flex justify-between text-xs font-semibold text-ink/55">
        {data.map((d, i) => (
          <span key={i} className={i % 2 && data.length > 8 ? "hidden sm:inline" : ""}>
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
          return (
            <li key={d.stage}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-semibold text-ink">{d.stage}</span>
                <span className="text-ink/60">
                  <strong className="text-ink">{d.count}</strong> · {conv}%
                </span>
              </div>
              <div className="mt-1.5 h-4 overflow-hidden rounded-full border-2 border-ink bg-cream">
                <div
                  className="h-full rounded-r-full bg-green"
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

export function BarChart({
  data,
  caption,
}: {
  data: readonly { day: string; value: number }[];
  caption: string;
}) {
  return (
    <figure>
      <div className="flex h-40 items-end justify-between gap-2">
        {data.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-bold text-ink/60">{d.value}%</span>
            <div
              className="w-full rounded-t-lg border-2 border-ink bg-teal"
              style={{ height: `${d.value}%` }}
              title={`${d.day}: ${d.value}%`}
            />
            <span className="text-xs font-semibold text-ink/60">{d.day}</span>
          </div>
        ))}
      </div>
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}
