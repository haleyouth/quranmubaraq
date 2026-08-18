"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Moon, Sun } from "lucide-react";
import { formatHijri, toHijri } from "@/lib/hijri";
import { MONTH_LABEL, WEEKDAY_LABEL } from "@/lib/admin/schedule";

/**
 * Gregorian date, Hijri date and a live local clock.
 *
 * Rendered only after mount: the server has no access to the viewer's
 * timezone, so painting a time during SSR guarantees a hydration mismatch.
 */
export function DateTimePanel() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) {
    // Reserve the same height to avoid layout shift on hydration
    return <div className="h-[104px] rounded-2xl border-2 border-ink bg-white hard-shadow" />;
  }

  const hijri = toHijri(now);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isDay = now.getHours() >= 6 && now.getHours() < 18;

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {/* Gregorian */}
      <div className="rounded-2xl border-2 border-ink bg-white p-5 hard-shadow">
        <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-ink/55 uppercase">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Gregorian
        </p>
        <p className="font-display mt-2 text-2xl leading-tight text-ink">
          {now.getDate()} {MONTH_LABEL[now.getMonth()]}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-ink/60">
          {WEEKDAY_LABEL[now.getDay()]}day, {now.getFullYear()}
        </p>
      </div>

      {/* Hijri */}
      <div className="rounded-2xl border-2 border-ink bg-green p-5 text-white hard-shadow">
        <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-white/80 uppercase">
          <Moon className="size-3.5" aria-hidden="true" />
          Hijri
        </p>
        <p className="font-display mt-2 text-2xl leading-tight">
          {hijri.day} {hijri.monthName}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-white/80">
          {hijri.year} AH
          <span className="ml-1 text-white/60" title="Tabular calculation — local sighting may differ by a day">
            (approx.)
          </span>
        </p>
      </div>

      {/* Live clock */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-ink p-5 text-cream hard-shadow">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-gold/25 blur-2xl"
        />
        <p className="relative flex items-center gap-2 text-xs font-bold tracking-wider text-cream/65 uppercase">
          {isDay ? (
            <Sun className="size-3.5 text-gold" aria-hidden="true" />
          ) : (
            <Moon className="size-3.5 text-gold" aria-hidden="true" />
          )}
          Local time
        </p>
        <p
          className="font-display relative mt-2 text-3xl leading-none tabular-nums"
          aria-live="off"
        >
          {hh}
          <span className="animate-pulse text-gold">:</span>
          {mm}
          <span className="text-xl text-cream/60">:{ss}</span>
        </p>
        <p className="relative mt-1 truncate text-xs font-semibold text-cream/55">{tz}</p>
      </div>
    </div>
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
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <span className="hidden items-center gap-3 text-sm font-semibold text-ink/65 md:flex">
      <span className="tabular-nums">{time}</span>
      <span aria-hidden="true" className="text-ink/25">
        |
      </span>
      <span title={formatHijri(hijri)}>
        {hijri.day} {hijri.monthName}
      </span>
    </span>
  );
}
