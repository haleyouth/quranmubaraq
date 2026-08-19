"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import {
  HIJRI_MONTHS,
  formatHijri,
  fromHijri,
  hijriMonthLength,
  toHijri,
} from "@/lib/hijri";
import {
  MONTH_LABEL, addDays, sessionsForRange, ymd, type ClassSession,
} from "@/lib/admin/schedule";
import { cn } from "@/lib/utils";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Date and time panel.
 *
 * Renders only after mount: the server has no access to the viewer's clock or
 * timezone, so painting a date during SSR guarantees a hydration mismatch —
 * and with `output: "export"` the HTML is built long before it is viewed.
 */
export function DateTimePanel({
  /** Narrows the day counts to one person's classes. */
  filter,
}: {
  filter?: (s: ClassSession) => boolean;
} = {}) {
  const [now, setNow] = useState<Date | null>(null);
  const [tab, setTab] = useState<"gregorian" | "hijri">("gregorian");
  const [monthCursor, setMonthCursor] = useState(0);

  useEffect(() => {
    setNow(new Date());
    // 200ms so the analogue second hand sweeps rather than stutters
    const id = window.setInterval(() => setNow(new Date()), 200);
    return () => window.clearInterval(id);
  }, []);

  if (!now) {
    return (
      <div className="grid items-start gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="h-[420px] animate-pulse rounded-2xl border-2 border-ink bg-white" />
        <div className="h-[420px] animate-pulse rounded-2xl border-2 border-ink bg-white" />
      </div>
    );
  }

  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-[1.7fr_1fr]">
      <CalendarCard
        now={now}
        tab={tab}
        setTab={setTab}
        monthCursor={monthCursor}
        setMonthCursor={setMonthCursor}
        filter={filter}
      />
      <PremiumClock now={now} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Switchable full calendar                          */
/* -------------------------------------------------------------------------- */

function CalendarCard({
  now,
  tab,
  setTab,
  monthCursor,
  setMonthCursor,
  filter,
}: {
  now: Date;
  tab: "gregorian" | "hijri";
  setTab: (t: "gregorian" | "hijri") => void;
  monthCursor: number;
  setMonthCursor: (n: number) => void;
  filter?: (s: ClassSession) => boolean;
}) {
  const hijriToday = toHijri(now);
  const todayKey = ymd(now);

  // Both calendars are laid out as Gregorian day cells; only the header,
  // the numbering and the month boundaries differ between tabs.
  const byDay = useMemo(() => {
    const from = addDays(now, -75);
    const to = addDays(now, 75);
    const all = sessionsForRange(from, to, now);
    const mine = filter ? all.filter(filter) : all;
    const map = new Map<string, number>();
    for (const s2 of mine) map.set(s2.date, (map.get(s2.date) ?? 0) + 1);
    return map;
  }, [now, filter]);

  const { cells, heading, subheading } = useMemo(() => {
    if (tab === "gregorian") {
      const anchor = new Date(now.getFullYear(), now.getMonth() + monthCursor, 1);
      const lead = (anchor.getDay() + 6) % 7;
      const start = addDays(anchor, -lead);
      const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
      return {
        cells: days.map((d) => ({
          date: d,
          primary: d.getDate(),
          secondary: toHijri(d).day,
          inMonth: d.getMonth() === anchor.getMonth(),
        })),
        heading: `${MONTH_LABEL[anchor.getMonth()]} ${anchor.getFullYear()}`,
        subheading: (() => {
          const a = toHijri(anchor);
          const b = toHijri(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0));
          return a.monthName === b.monthName
            ? `${a.monthName} ${a.year} AH`
            : `${a.monthName} – ${b.monthName} ${b.year} AH`;
        })(),
      };
    }

    // Hijri tab: walk the Hijri month, converting each day back to Gregorian
    let hy = hijriToday.year;
    let hm = hijriToday.month + monthCursor;
    while (hm > 12) { hm -= 12; hy += 1; }
    while (hm < 1) { hm += 12; hy -= 1; }

    const len = hijriMonthLength(hy, hm);
    const first = fromHijri(hy, hm, 1);
    const lead = (first.getDay() + 6) % 7;

    const days: {
      date: Date; primary: number; secondary: number; inMonth: boolean;
    }[] = [];

    for (let i = 0; i < lead; i++) {
      const d = addDays(first, i - lead);
      days.push({ date: d, primary: toHijri(d).day, secondary: d.getDate(), inMonth: false });
    }
    for (let i = 0; i < len; i++) {
      const d = fromHijri(hy, hm, i + 1);
      days.push({ date: d, primary: i + 1, secondary: d.getDate(), inMonth: true });
    }
    while (days.length < 42) {
      const d = addDays(days[days.length - 1].date, 1);
      days.push({ date: d, primary: toHijri(d).day, secondary: d.getDate(), inMonth: false });
    }

    return {
      cells: days.slice(0, 42),
      heading: `${HIJRI_MONTHS[hm - 1]} ${hy} AH`,
      subheading: `${MONTH_LABEL[first.getMonth()]} ${first.getFullYear()}`,
    };
  }, [tab, monthCursor, now, hijriToday.year, hijriToday.month]);

  return (
    <section className="rounded-2xl border-2 border-ink bg-white hard-shadow">
      {/* Today summary */}
      <header className="grid grid-cols-2 gap-2 border-b-2 border-ink/12 p-3">
        <div className="flex items-center gap-2 rounded-xl border-2 border-ink bg-cream px-2.5 py-2 sm:gap-2.5 sm:px-3">
          <CalendarDays className="hidden size-4 shrink-0 text-ink/50 sm:block" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-display truncate text-sm leading-tight text-ink sm:text-base">
              {now.getDate()} {MONTH_LABEL[now.getMonth()]} {now.getFullYear()}
            </p>
            <p className="truncate text-xs font-semibold text-ink/55">
              {now.toLocaleDateString("en-GB", { weekday: "long" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border-2 border-ink bg-green px-2.5 py-2 text-white sm:gap-2.5 sm:px-3">
          <Moon className="hidden size-4 shrink-0 text-white/70 sm:block" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-display truncate text-sm leading-tight sm:text-base">
              {hijriToday.day} {hijriToday.monthName} {hijriToday.year} AH
            </p>
            <p
              className="truncate text-xs font-semibold text-white/70"
              title="Tabular calculation — local moon sighting may differ by a day"
            >
              Hijri (approx.)
            </p>
          </div>
        </div>
      </header>

      {/* Tabs + month navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink/12 px-3 py-2">
        <div
          role="tablist"
          aria-label="Calendar system"
          className="inline-flex gap-1 rounded-full border-2 border-ink bg-cream p-1"
        >
          {(["gregorian", "hijri"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => { setTab(t); setMonthCursor(0); }}
              className={cn(
                "min-h-10 cursor-pointer rounded-full px-4 text-sm font-bold capitalize transition-colors sm:min-h-8",
                tab === t ? "bg-green-deep text-white" : "text-ink hover:bg-cream-deep",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthCursor(monthCursor - 1)}
            aria-label="Previous month"
            className="grid size-10 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep sm:size-8"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setMonthCursor(0)}
            className="min-h-10 cursor-pointer rounded-full border-2 border-ink bg-white px-3 text-sm font-bold transition-colors hover:bg-cream-deep sm:min-h-8"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMonthCursor(monthCursor + 1)}
            aria-label="Next month"
            className="grid size-10 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep sm:size-8"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="p-3">
        <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
          <h3 className="font-display text-base text-ink">{heading}</h3>
          <p className="text-xs text-ink/50">{subheading}</p>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {DOW.map((d) => (
            <div
              key={d}
              className="pb-1 text-center text-[10px] font-bold tracking-wider text-ink/50 uppercase"
            >
              <span className="sm:hidden">{d[0]}</span>
              <span className="hidden sm:inline">{d}</span>
            </div>
          ))}

          {cells.map((c, i) => {
            const key = ymd(c.date);
            const isToday = key === todayKey;
            const isFriday = c.date.getDay() === 5;
            const classes = byDay.get(key) ?? 0;
            const isPast = c.date < new Date(todayKey);

            return (
              <div
                key={i}
                aria-current={isToday ? "date" : undefined}
                title={
                  classes > 0
                    ? `${c.date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} — ${classes} class${classes === 1 ? "" : "es"}`
                    : undefined
                }
                className={cn(
                  "relative flex aspect-square max-h-14 min-h-11 flex-col items-center justify-center gap-0 rounded-lg border-2 pb-1 transition-colors sm:aspect-auto sm:h-12 sm:pb-0",
                  c.inMonth ? "bg-white" : "bg-cream-deep/30",
                  isToday
                    ? "border-green-deep bg-green-deep text-white ring-2 ring-green-deep/25"
                    : isFriday && c.inMonth
                      ? "border-teal/40 bg-teal/10"
                      : "border-ink/10",
                )}
              >
                <span
                  className={cn(
                    "font-display text-base leading-none sm:text-lg",
                    isToday ? "text-white" : c.inMonth ? "text-ink" : "text-ink/30",
                  )}
                >
                  {c.primary}
                </span>
                <span
                  className={cn(
                    "mt-0.5 text-[10px] leading-none font-semibold sm:text-[11px]",
                    isToday ? "text-white/75" : c.inMonth ? "text-ink/45" : "text-ink/25",
                  )}
                >
                  {c.secondary}
                </span>

                {classes > 0 && c.inMonth && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute bottom-0.5 inline-flex items-center justify-center rounded-full leading-none",
                      // Phones: a dot, since a digit at this size is unreadable
                      "size-1 sm:top-1 sm:right-1 sm:bottom-auto sm:size-auto sm:h-4 sm:min-w-4 sm:px-1 sm:text-[9px] sm:font-bold",
                      isToday
                        ? "bg-white text-green-deep"
                        : isPast
                          ? "bg-ink/30 text-ink/60 sm:bg-ink/15"
                          : "bg-green text-white",
                    )}
                  >
                    <span className="hidden sm:inline">{classes}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink/55">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded border-2 border-green-deep bg-green-deep" />
            Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded border-2 border-teal/40 bg-teal/10" />
            Jumu&rsquo;ah
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-green px-1 text-[8px] font-bold text-white">
              3
            </span>
            Classes that day
          </span>
          <span>
            Large number: {tab === "gregorian" ? "Gregorian" : "Hijri"} · small:{" "}
            {tab === "gregorian" ? "Hijri" : "Gregorian"}
          </span>
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Premium clock                                */
/* -------------------------------------------------------------------------- */

function PremiumClock({ now }: { now: Date }) {
  const h = now.getHours();
  const m = now.getMinutes();
  const sec = now.getSeconds();
  const isDay = h >= 6 && h < 18;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hijri = toHijri(now);

  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");

  // Smooth sweep rather than a tick, so the hands never look frozen
  const ms = now.getMilliseconds();
  const secDeg = (sec + ms / 1000) * 6;
  const minDeg = m * 6 + sec * 0.1;
  const hourDeg = (h % 12) * 30 + m * 0.5;

  const CIRC = 2 * Math.PI * 88;

  return (
    <section className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-ink px-4 py-4 text-cream hard-shadow">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-gold/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-20 size-52 rounded-full bg-green/15 blur-3xl"
      />

      <div className="relative flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-cream/75 uppercase">
          {isDay ? (
            <Sun className="size-3.5 text-gold" aria-hidden="true" />
          ) : (
            <Moon className="size-3.5 text-gold" aria-hidden="true" />
          )}
          Local time
        </p>
        <p className="text-[11px] font-semibold text-cream/40">{isDay ? "Day" : "Night"}</p>
      </div>

      {/* Analogue face — fills the panel, capped so it never dominates */}
      <div className="relative mx-auto flex min-h-0 w-full flex-1 items-center justify-center py-2">
        <svg
          viewBox="0 0 200 200"
          className="aspect-square h-full max-h-[17rem] w-auto max-w-full"
          role="img"
          aria-label={`Clock showing ${hh}:${mm}:${ss}`}
        >
          <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.5" />
          <circle
            cx="100" cy="100" r="88" fill="none"
            stroke="var(--color-gold)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${((sec + ms / 1000) / 60) * CIRC} ${CIRC}`}
            transform="rotate(-90 100 100)"
          />

          {Array.from({ length: 60 }, (_, i) => {
            const a = (i * 6 * Math.PI) / 180;
            const major = i % 5 === 0;
            const r1 = major ? 68 : 74;
            return (
              <line
                key={i}
                x1={100 + r1 * Math.sin(a)} y1={100 - r1 * Math.cos(a)}
                x2={100 + 79 * Math.sin(a)} y2={100 - 79 * Math.cos(a)}
                stroke="currentColor"
                strokeOpacity={major ? 0.75 : 0.3}
                strokeWidth={major ? 4 : 1.6}
                strokeLinecap="round"
              />
            );
          })}

          {[12, 3, 6, 9].map((n, i) => {
            const a = (i * 90 * Math.PI) / 180;
            return (
              <text
                key={n}
                x={100 + 54 * Math.sin(a)}
                y={100 - 54 * Math.cos(a) + 5}
                textAnchor="middle"
                className="font-display"
                fill="currentColor"
                fillOpacity="0.75"
                fontSize="17"
                fontWeight="700"
              >
                {n}
              </text>
            );
          })}

          <line x1="100" y1="108" x2="100" y2="50" stroke="currentColor" strokeWidth="9" strokeLinecap="round"
                transform={`rotate(${hourDeg} 100 100)`} />
          <line x1="100" y1="110" x2="100" y2="32" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                transform={`rotate(${minDeg} 100 100)`} />
          <line x1="100" y1="116" x2="100" y2="26" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round"
                transform={`rotate(${secDeg} 100 100)`} />
          <circle cx="100" cy="100" r="7" fill="var(--color-gold)" />
          <circle cx="100" cy="100" r="2" fill="var(--color-ink)" />
        </svg>
      </div>

      {/* Digital readout */}
      <p className="font-display relative text-center text-4xl leading-none font-extrabold tabular-nums">
        {hh}
        <span className="animate-pulse text-gold">:</span>
        {mm}
        <span className="text-xl font-bold text-cream/60">:{ss}</span>
      </p>

      <p className="relative mt-1.5 truncate text-center text-xs font-semibold text-cream/55">
        {tz}
      </p>
      <p className="relative text-center text-xs font-semibold text-gold/90">
        {hijri.day} {hijri.monthName} {hijri.year} AH
      </p>
    </section>
  );
}

/** Compact single-line variant for the portal top bar. */
export function InlineClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) return null;

  const hijri = toHijri(now);
  // Seconds included; tabular-nums stops the width jittering each tick
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <span className="hidden items-center gap-3 text-sm font-semibold text-ink/65 md:flex">
      <span className="tabular-nums">{time}</span>
      <span aria-hidden="true" className="text-ink/25">|</span>
      <span title={formatHijri(hijri)}>
        {hijri.day} {hijri.monthName}
      </span>
    </span>
  );
}
