"use client";

/**
 * The reassurance panel beside the sign-in form.
 *
 * Deliberately says nothing about what each role can see: the login page is
 * public, and enumerating the portals tells an attacker which accounts are
 * worth targeting. A live clock, both calendars and the ayah of the day are
 * useful to the person signing in and reveal nothing.
 *
 * Everything time-based is computed after mount. The page is a static export
 * built long before it is viewed, so rendering a date during the build would
 * both go stale and mismatch on hydration.
 */

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { HIJRI_MONTHS, fromHijri, toHijri } from "@/lib/hijri";
import { ayahOfTheDay, fetchAyahOfTheDay, type Ayah } from "@/lib/ayah";
import { MONTH_LABEL, WEEKDAY_LABEL, addDays, startOfMonth, ymd } from "@/lib/admin/schedule";

export function LoginAside() {
  const [now, setNow] = useState<Date | null>(null);
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [tab, setTab] = useState<"gregorian" | "hijri">("gregorian");

  // Tick every second so the clock is genuinely live, not a frozen stamp.
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Show the bundled verse immediately, then upgrade to the API's copy.
  useEffect(() => {
    setAyah(ayahOfTheDay());
    let cancelled = false;
    fetchAyahOfTheDay()
      .then((a) => {
        if (!cancelled) setAyah(a);
      })
      .catch(() => {
        /* the bundled verse is already showing */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hijri = now ? toHijri(now) : null;

  /**
   * Six-week grid, Monday first.
   *
   * Both tabs lay out real Gregorian days — only the month boundary and the
   * number printed in each cell differ, so switching tabs never moves a date
   * onto the wrong weekday.
   */
  const { cells, heading } = useMemo(() => {
    if (!now) return { cells: [] as Date[], heading: "" };

    if (tab === "hijri") {
      const h = toHijri(now);
      const first = fromHijri(h.year, h.month, 1);
      const lead = (first.getDay() + 6) % 7;
      const gridStart = addDays(first, -lead);
      return {
        cells: Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)),
        heading: `${HIJRI_MONTHS[h.month - 1]} ${h.year} AH`,
      };
    }

    const first = startOfMonth(now);
    const lead = (first.getDay() + 6) % 7;
    const gridStart = addDays(first, -lead);
    return {
      cells: Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)),
      heading: `${MONTH_LABEL[now.getMonth()]} ${now.getFullYear()}`,
    };
  }, [now, tab]);

  /** The Hijri month currently on show, for deciding what is "outside". */
  const hijriCursor = now ? toHijri(now) : null;

  /** Number to print in a cell, and whether it belongs to the shown month. */
  function cellInfo(d: Date) {
    if (tab === "hijri") {
      const h = toHijri(d);
      return {
        label: h.day,
        outside: !hijriCursor || h.month !== hijriCursor.month || h.year !== hijriCursor.year,
      };
    }
    return { label: d.getDate(), outside: d.getMonth() !== thisMonth };
  }

  const todayKey = now ? ymd(now) : "";
  const thisMonth = now ? now.getMonth() : -1;

  const time = now
    ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";

  return (
    <div className="islamic-pattern-strong flex items-center justify-center border-t-4 border-ink bg-ink px-6 py-14 lg:border-t-0 lg:border-l-4">
      <div className="w-full max-w-md">
        {/* Clock */}
        <div className="rounded-2xl border-2 border-cream/20 bg-cream/5 px-5 py-4">
          <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-cream/60 uppercase">
            <Clock className="size-3.5" aria-hidden="true" />
            Local time
          </p>
          <p
            className="font-display mt-1 text-4xl tabular-nums text-cream sm:text-5xl"
            /* The seconds change every tick; announcing each one would flood
               a screen reader, so the clock is decorative here. */
            aria-hidden="true"
          >
            {time}
          </p>
          <p className="mt-1.5 text-sm text-cream/70">
            {now
              ? now.toLocaleDateString([], {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : " "}
          </p>
          {hijri && (
            <p className="text-sm font-semibold text-gold">
              {hijri.day} {HIJRI_MONTHS[hijri.month - 1]} {hijri.year} AH
            </p>
          )}
        </div>

        {/* Calendar */}
        <div className="mt-4 rounded-2xl border-2 border-cream/20 bg-cream/5 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-cream/60 uppercase">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {heading || "Calendar"}
            </p>

            <div role="tablist" aria-label="Calendar system" className="flex gap-1">
              {(["gregorian", "hijri"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`cursor-pointer rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors ${
                    tab === t
                      ? "border-gold bg-gold text-ink"
                      : "border-cream/25 text-cream/70 hover:text-cream"
                  }`}
                >
                  {t === "gregorian" ? "Gregorian" : "Hijri"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <span key={d} className="text-[0.65rem] font-bold text-cream/45">
                {WEEKDAY_LABEL[d][0]}
              </span>
            ))}

            {cells.map((d) => {
              const key = ymd(d);
              const isToday = key === todayKey;
              const { label, outside } = cellInfo(d);
              return (
                <span
                  key={key}
                  aria-current={isToday ? "date" : undefined}
                  className={`grid h-7 place-items-center rounded-md text-xs tabular-nums transition-colors ${
                    isToday
                      ? "border-2 border-gold bg-gold font-bold text-ink"
                      : outside
                        ? "text-cream/25"
                        : "text-cream/75"
                  }`}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Ayah of the day */}
        <div className="mt-4 rounded-2xl border-2 border-cream/20 bg-cream/5 px-5 py-4">
          <p className="text-xs font-bold tracking-wide text-cream/60 uppercase">
            Ayah of the day
          </p>
          {ayah ? (
            <>
              <p
                dir="rtl"
                lang="ar"
                className="mt-2 text-right text-xl leading-loose text-cream"
              >
                {ayah.arabic}
              </p>
              <p className="mt-2 text-sm text-cream/70 italic">
                &ldquo;{ayah.english}&rdquo;
              </p>
              <p className="mt-1.5 text-xs font-bold text-gold">
                {ayah.surahEnglish} {ayah.surahNumber}:{ayah.numberInSurah}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-cream/50">Loading&hellip;</p>
          )}
        </div>
      </div>
    </div>
  );
}
