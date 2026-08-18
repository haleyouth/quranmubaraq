"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ITEM_H = 40; // px per row, must match the item height below

/**
 * Date-of-birth roller.
 *
 * Three scroll columns (day / month / year) that snap to the nearest value.
 * Chosen over a calendar grid because entering a birth date means paging back
 * years, which a month grid handles badly.
 *
 * Accessibility: each column is a listbox with real buttons, so it is fully
 * keyboard- and screen-reader operable — the scroll snapping is an
 * enhancement, not the only way to choose.
 */
export function DateRoller({
  value,
  onChange,
  minAge = 3,
  maxAge = 90,
  label = "Date of birth",
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
    return <div className="h-[184px] animate-pulse rounded-xl border-2 border-ink/20 bg-cream" />;
  }

  const years = Array.from(
    { length: maxAge - minAge + 1 },
    (_, i) => thisYear - minAge - i,
  );

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
        <div className="relative grid grid-cols-[1fr_1.4fr_1fr]">
          {/* Selection band, centred behind all three columns */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-10 -translate-y-1/2 border-y-2 border-green-deep/35 bg-green-deep/8"
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
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <CalendarDays className="size-3.5 text-ink/50" aria-hidden="true" />
            {parsed
              ? `${day} ${MONTHS[month - 1]} ${year}`
              : "Scroll to choose a date"}
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
        tabIndex={0}
        onScroll={handleScroll}
        className="h-[120px] snap-y snap-mandatory overflow-y-auto scroll-smooth focus:outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingBlock: ITEM_H }}
      >
        {/* Spacers let the first and last items reach the centre band */}
        <div style={{ height: ITEM_H }} aria-hidden="true" />

        {items.map((it) => {
          const active = it === selected;
          return (
            <button
              key={it}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onSelect(it)}
              className={cn(
                "flex h-10 w-full snap-center items-center justify-center text-sm transition-colors",
                active
                  ? "font-display text-base font-bold text-green-deep"
                  : "cursor-pointer text-ink/45 hover:text-ink",
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
