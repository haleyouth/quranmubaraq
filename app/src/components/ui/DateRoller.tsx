"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ITEM_H = 44; // px per row; must match the h-11 items below

/**
 * Date-of-birth roller.
 *
 * Three scroll columns (day / month / year) that snap to the nearest value.
 * Chosen over a calendar grid because entering a birth date means paging back
 * years, which a month grid handles badly.
 *
 * Accessibility: each column is a listbox of real buttons. Arrow keys move by
 * one, Page Up/Down by five, Home/End jump to the ends, and decade buttons
 * skip whole ranges — scroll snapping is an enhancement, not the only way in.
 */
export function DateRoller({
  value,
  onChange,
  minAge = 3,
  maxAge = 90,
  label = "Date of birth",
  hint,
  required,
  error,
  name,
}: {
  /** ISO yyyy-mm-dd, or "" when unset. */
  value: string;
  onChange: (iso: string) => void;
  minAge?: number;
  maxAge?: number;
  label?: string;
  /** Explains why the date is needed, shown under the control. */
  hint?: string;
  required?: boolean;
  error?: string;
  name?: string;
}) {
  const [thisYear, setThisYear] = useState<number | null>(null);

  // The year range depends on today, which the server cannot know
  useEffect(() => setThisYear(new Date().getFullYear()), []);

  const parsed = useMemo(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return m
      ? { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) }
      : null;
  }, [value]);

  if (!thisYear) {
    return <div className="h-[240px] animate-pulse rounded-xl border-2 border-ink/20 bg-cream" />;
  }

  const years = Array.from(
    { length: maxAge - minAge + 1 },
    (_, i) => thisYear - minAge - i,
  );

  // One shortcut per decade covered by the range, newest first
  const newest = years[0];
  const oldest = years[years.length - 1];
  const decadeShortcuts: number[] = [];
  for (let d = Math.floor(newest / 10) * 10; d >= Math.floor(oldest / 10) * 10; d -= 10) {
    const inRange = years.find((y) => y >= d && y < d + 10);
    if (inRange !== undefined) decadeShortcuts.push(d);
  }

  const year = parsed?.year ?? thisYear - 10;
  const month = parsed?.month ?? 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.min(parsed?.day ?? 1, daysInMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function emit(d: number, m: number, y: number) {
    // Clamp the day when switching to a shorter month (31 Jan -> Feb)
    const safeDay = Math.min(d, new Date(y, m, 0).getDate());
    onChange(
      `${y}-${String(m).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`,
    );
  }

  const age = parsed ? calculateAge(value) : null;

  return (
    <div>
      <span className="mb-1.5 block text-sm font-bold text-ink">
        {label} {required && <span className="text-green-deep">*</span>}
      </span>

      <div
        className={cn(
          "overflow-hidden rounded-xl border-2 bg-white",
          error ? "border-red-600" : "border-ink",
        )}
      >
        {/* Decade jumps: reaching a birth year one notch at a time is painful */}
        <div className="flex flex-wrap gap-1.5 border-b-2 border-ink/12 bg-cream px-2 py-2">
          <span className="self-center pr-1 text-[10px] font-bold tracking-wider text-ink/45 uppercase">
            Jump
          </span>
          {decadeShortcuts.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => emit(day, month, y)}
              aria-pressed={year === y}
              className={cn(
                "min-h-8 cursor-pointer rounded-full border-2 border-ink px-2.5 text-xs font-bold transition-colors",
                year === y ? "bg-green-deep text-white" : "bg-white text-ink hover:bg-cream-deep",
              )}
            >
              {y}s
            </button>
          ))}
        </div>
        <div className="relative grid grid-cols-[1fr_1.4fr_1fr]">
          {/* Selection band, centred behind all three columns */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-11 -translate-y-1/2 border-y-2 border-green-deep/35 bg-green-deep/8"
          />

          <Column
            label="Day"
            items={days}
            selected={day}
            render={(d) => String(d)}
            onSelect={(d) => emit(d, month, year)}
          />
          <Column
            label="Month"
            items={Array.from({ length: 12 }, (_, i) => i + 1)}
            selected={month}
            render={(m) => MONTHS[m - 1]}
            onSelect={(m) => emit(day, m, year)}
          />
          <Column
            label="Year"
            items={years}
            selected={year}
            render={(y) => String(y)}
            onSelect={(y) => emit(day, month, y)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t-2 border-ink/12 bg-cream px-3 py-2">
          <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-ink">
            <CalendarDays className="size-3.5 shrink-0 text-ink/50" aria-hidden="true" />
            <span className="truncate">
              {parsed
                ? new Date(year, month - 1, day).toLocaleDateString("en-GB", {
                    weekday: "short", day: "numeric", month: "long", year: "numeric",
                  })
                : "Scroll or use the arrow keys"}
            </span>
          </p>
          {age !== null && (
            <p className="text-sm font-bold text-green-deep">
              Age {age}
            </p>
          )}
        </div>
      </div>

      {/* Real value for uncontrolled form reads and validation */}
      {name && <input type="hidden" name={name} value={value} />}

      {hint && !error && <p className="mt-2 text-sm text-ink/55">{hint}</p>}

      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function Column<T extends number>({
  label,
  items,
  selected,
  render,
  onSelect,
}: {
  label: string;
  items: T[];
  selected: T;
  render: (v: T) => string;
  onSelect: (v: T) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<number | undefined>(undefined);

  // Keep the chosen value under the selection band
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const i = items.indexOf(selected);
    if (i < 0) return;
    const target = i * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 2) {
      el.scrollTo({ top: target, behavior: "smooth" });
    }
  }, [selected, items]);

  /** Commit whichever row settled under the band. */
  function handleScroll() {
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const i = Math.round(el.scrollTop / ITEM_H);
      const next = items[Math.max(0, Math.min(items.length - 1, i))];
      if (next !== undefined && next !== selected) onSelect(next);
    }, 110);
  }

  return (
    <div className="relative">
      <p className="border-b-2 border-ink/10 py-1 text-center text-[10px] font-bold tracking-wider text-ink/50 uppercase">
        {label}
      </p>

      <div
        ref={ref}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`${label}-${selected}`}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={(e) => {
          const i = items.indexOf(selected);
          const step =
            e.key === "ArrowDown" ? 1
            : e.key === "ArrowUp" ? -1
            : e.key === "PageDown" ? 5
            : e.key === "PageUp" ? -5
            : 0;
          if (step) {
            e.preventDefault();
            const next = items[Math.max(0, Math.min(items.length - 1, i + step))];
            if (next !== undefined) onSelect(next);
          } else if (e.key === "Home") {
            e.preventDefault();
            onSelect(items[0]);
          } else if (e.key === "End") {
            e.preventDefault();
            onSelect(items[items.length - 1]);
          }
        }}
        className="h-[132px] snap-y snap-mandatory overflow-y-auto scroll-smooth focus-visible:ring-2 focus-visible:ring-green-deep/40 focus:outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingBlock: ITEM_H }}
      >
        {/* Spacers let the first and last items reach the centre band */}
        <div style={{ height: ITEM_H }} aria-hidden="true" />

        {items.map((it) => {
          const active = it === selected;
          return (
            <button
              key={it}
              id={`${label}-${it}`}
              type="button"
              role="option"
              aria-selected={active}
              tabIndex={-1}
              onClick={() => onSelect(it)}
              className={cn(
                "flex h-11 w-full snap-center items-center justify-center transition-all",
                active
                  ? "font-display text-lg font-bold text-green-deep"
                  : "cursor-pointer text-sm text-ink/40 hover:text-ink",
              )}
            >
              {render(it)}
            </button>
          );
        })}

        <div style={{ height: ITEM_H }} aria-hidden="true" />
      </div>
    </div>
  );
}

/**
 * Age in whole years on today's date.
 *
 * Subtracting years alone is wrong until the birthday has passed this year,
 * which is exactly the case that puts a child in the wrong cohort.
 */
export function calculateAge(iso: string, on = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;

  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let age = on.getFullYear() - y;
  const hadBirthday =
    on.getMonth() + 1 > mo || (on.getMonth() + 1 === mo && on.getDate() >= d);
  if (!hadBirthday) age -= 1;

  return age >= 0 ? age : null;
}
