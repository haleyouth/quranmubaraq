"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Video } from "lucide-react";
import {
  MONTH_LABEL,
  STATUS_LABEL,
  addDays,
  sessionsForRange,
  startOfMonth,
  ymd,
  type ClassSession,
} from "@/lib/admin/schedule";
import { toHijri } from "@/lib/hijri";
import { Modal } from "@/components/admin/Modal";
import { AdminButton, Badge, type BadgeTone } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_TONE: Record<string, BadgeTone> = {
  scheduled: "neutral",
  live: "danger",
  completed: "green",
  "missed-student": "danger",
  "missed-teacher": "gold",
  cancelled: "sage",
};

/** Month grid with per-day session dots and a day detail drawer. */
export function CalendarView({
  title,
  filter,
  onJoin,
}: {
  title: string;
  /** Narrows the full schedule to one person's classes. */
  filter?: (s: ClassSession) => boolean;
  onJoin?: (s: ClassSession) => void;
}) {
  const [cursor, setCursor] = useState<Date | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // The static export is built long before it is viewed, so the calendar
  // anchors itself to the viewer's clock after mount rather than build time.
  useEffect(() => setCursor(startOfMonth(new Date())), []);

  const { cells, byDay, todayKey } = useMemo(() => {
    if (!cursor) return { cells: [] as Date[], byDay: new Map<string, ClassSession[]>(), todayKey: "" };

    const first = startOfMonth(cursor);
    // Grid starts on the Monday on or before the 1st
    const lead = (first.getDay() + 6) % 7;
    const gridStart = addDays(first, -lead);
    const gridEnd = addDays(gridStart, 41); // 6 weeks

    const all = sessionsForRange(gridStart, gridEnd);
    const mine = filter ? all.filter(filter) : all;

    const map = new Map<string, ClassSession[]>();
    for (const s of mine) {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    }

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));

    return { cells: days, byDay: map, todayKey: ymd(new Date()) };
  }, [cursor, filter]);

  const selectedSessions = selected ? (byDay.get(selected) ?? []) : [];

  if (!cursor) {
    // Reserve height so the panel does not jump when the grid appears
    return <div className="h-[420px] animate-pulse rounded-xl bg-cream-deep/40" />;
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl text-ink">
            {MONTH_LABEL[cursor.getMonth()]} {cursor.getFullYear()}
          </h3>
          <p className="text-sm text-ink/60">{title}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            aria-label="Previous month"
            className="grid size-10 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep sm:size-9"
          >
            <ChevronLeft className="size-4" />
          </button>
          <AdminButton size="sm" variant="outline" onClick={() => setCursor(startOfMonth(new Date()))}>
            Today
          </AdminButton>
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            aria-label="Next month"
            className="grid size-10 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep sm:size-9"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-4 -mx-1 px-1 sm:mt-5 sm:-mx-2 sm:overflow-x-auto sm:px-2">
        <div className="sm:min-w-[640px]">
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {DOW.map((d) => (
              <div
                key={d}
                className="pb-1 text-center text-[10px] font-bold tracking-wider text-ink/55 uppercase sm:text-xs"
              >
                <span className="sm:hidden">{d[0]}</span>
                <span className="hidden sm:inline">{d}</span>
              </div>
            ))}

            {cells.map((day) => {
              const key = ymd(day);
              const inMonth = day.getMonth() === cursor.getMonth();
              const list = byDay.get(key) ?? [];
              const isToday = key === todayKey;
              const hijri = toHijri(day);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => list.length > 0 && setSelected(key)}
                  disabled={list.length === 0}
                  aria-label={`${day.getDate()} ${MONTH_LABEL[day.getMonth()]}, ${list.length} classes`}
                  className={cn(
                    "flex aspect-square min-h-11 flex-col rounded-lg border-2 p-1 text-left transition-colors sm:aspect-auto sm:h-[92px] sm:rounded-xl sm:p-2",
                    inMonth ? "bg-white" : "bg-cream-deep/40",
                    isToday ? "border-green-deep ring-2 ring-green-deep/25" : "border-ink/15",
                    list.length > 0
                      ? "cursor-pointer hover:border-ink hover:bg-cream"
                      : "cursor-default",
                  )}
                >
                  <span className="flex items-baseline justify-between">
                    <span
                      className={cn(
                        "font-display text-sm leading-none sm:text-lg",
                        inMonth ? "text-ink" : "text-ink/35",
                        isToday && "text-green-deep",
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-semibold leading-none sm:text-[11px]",
                        inMonth ? "text-ink/45" : "text-ink/25",
                      )}
                    >
                      {hijri.day}
                    </span>
                  </span>

                  {/* Phones: a single dot marks a day with classes; the drawer
                      lists them in full when the day is tapped. */}
                  {list.length > 0 && (
                    <span className="mt-auto flex items-center justify-center pb-0.5 sm:hidden">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 rounded-full",
                          list.some((x) => x.status === "live")
                            ? "bg-red-700"
                            : list.every((x) => x.status === "completed")
                              ? "bg-green"
                              : "bg-green-deep",
                        )}
                      />
                    </span>
                  )}

                  {list.length > 0 && (
                    <span className="mt-1.5 hidden space-y-1 sm:block">
                      {list.slice(0, 2).map((s) => (
                        <span
                          key={s.id}
                          className={cn(
                            "block truncate rounded px-1.5 py-0.5 text-[10px] font-bold",
                            s.status === "live"
                              ? "bg-red-700 text-white"
                              : s.status === "completed"
                                ? "bg-green text-white"
                                : s.status.startsWith("missed")
                                  ? "bg-gold text-ink"
                                  : "bg-cream-deep text-ink",
                          )}
                        >
                          {s.start} {s.course.replace("Quran ", "")}
                        </span>
                      ))}
                      {list.length > 2 && (
                        <span className="block text-[10px] font-bold text-ink/55">
                          +{list.length - 2} more
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-ink/60">
        {[
          ["bg-cream-deep border-ink/25", "Scheduled"],
          ["bg-green", "Completed"],
          ["bg-red-700", "Live"],
          ["bg-gold", "Missed"],
        ].map(([cls, label]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={cn("size-3 rounded border-2 border-ink", cls)} />
            {label}
          </span>
        ))}
      </div>

      {/* Day detail */}
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={
          selected
            ? new Date(`${selected}T00:00:00`).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : ""
        }
        description={
          selected
            ? `${selectedSessions.length} class${selectedSessions.length === 1 ? "" : "es"} · ${(() => {
                const h = toHijri(new Date(`${selected}T00:00:00`));
                return `${h.day} ${h.monthName} ${h.year} AH`;
              })()}`
            : undefined
        }
      >
        <ul className="space-y-3">
          {selectedSessions.map((s) => (
            <li key={s.id} className="rounded-xl border-2 border-ink/15 bg-cream p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg text-ink">{s.course}</p>
                  <p className="mt-0.5 text-sm text-ink/70">
                    {s.studentName} · {s.teacherName}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[s.status] ?? "neutral"}>
                  {STATUS_LABEL[s.status]}
                </Badge>
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ink/70">
                <Clock className="size-3.5" aria-hidden="true" />
                {s.start} – {s.end}
              </p>

              {s.note && (
                <p className="mt-2 rounded-lg border-2 border-ink/12 bg-white px-3 py-2 text-sm text-ink/75">
                  &ldquo;{s.note}&rdquo;
                  {s.rating ? (
                    <span className="ml-2 font-bold text-green-deep">{s.rating}/5</span>
                  ) : null}
                </p>
              )}

              {(s.status === "live" || s.status === "scheduled") && onJoin && (
                <AdminButton
                  size="sm"
                  className="mt-3"
                  variant={s.status === "live" ? "primary" : "outline"}
                  onClick={() => onJoin(s)}
                >
                  <Video className="size-3.5" aria-hidden="true" />
                  {s.status === "live" ? "Join now" : "Class link"}
                </AdminButton>
              )}
            </li>
          ))}

          {selectedSessions.length === 0 && (
            <li className="py-6 text-center text-ink/55">
              <CalendarDays className="mx-auto size-7 text-ink/30" aria-hidden="true" />
              <p className="mt-2">No classes scheduled.</p>
            </li>
          )}
        </ul>
      </Modal>
    </div>
  );
}
