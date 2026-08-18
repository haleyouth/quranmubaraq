"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Pause, Play } from "lucide-react";
import { ayahOfTheDay, fetchAyahOfTheDay, type Ayah } from "@/lib/ayah";
import { cn } from "@/lib/utils";

const ROTATE_MS = 9000;

/**
 * Daily ayah bar.
 *
 * A vertical looping slider pinned to the top of every admin page. Verses
 * rotate on a timer, sliding up as the calendar does. The reader can pause,
 * because text that moves while you are reading it is hostile.
 *
 * Renders after mount only: the verse depends on the local date, and with
 * `output: "export"` the HTML is built long before it is viewed.
 */
export function AyahBar() {
  const [ayat, setAyat] = useState<Ayah[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    // Today plus the next two days, so the bar has something to rotate
    // through while every viewer still starts on the same verse.
    const now = new Date();
    const days = [0, 1, 2].map((d) => {
      const dt = new Date(now);
      dt.setDate(dt.getDate() + d);
      return dt;
    });

    setAyat(days.map((d) => ayahOfTheDay(d)));

    // Then upgrade to the API text, which carries full diacritics
    let alive = true;
    Promise.all(days.map((d) => fetchAyahOfTheDay(d)))
      .then((fetched) => {
        if (alive) setAyat(fetched);
      })
      .catch(() => {
        /* bundled text already rendered */
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (paused || reduced || ayat.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % ayat.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [paused, reduced, ayat.length]);

  const current = useMemo(() => ayat[index], [ayat, index]);

  if (!current) {
    return <div className="mb-5 h-[86px] rounded-2xl border-2 border-ink bg-ink/90" />;
  }

  return (
    <section
      aria-label="Verse of the day"
      className="islamic-pattern-strong relative mb-5 overflow-hidden rounded-2xl border-2 border-ink bg-ink text-cream hard-shadow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-gold/20 blur-3xl"
      />

      <div className="relative flex items-stretch gap-3 px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center self-center rounded-full border-2 border-gold/50 bg-gold/15">
          <BookOpen className="size-4 text-gold" aria-hidden="true" />
        </span>

        {/* Viewport — one verse tall, contents slide up through it */}
        <div className="relative h-[62px] min-w-0 flex-1 overflow-hidden">
          <div
            className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateY(-${index * 62}px)` }}
          >
            {ayat.map((a, i) => (
              <article
                key={`${a.number}-${i}`}
                aria-hidden={i !== index}
                className="flex h-[62px] flex-col justify-center"
              >
                <p
                  dir="rtl"
                  lang="ar"
                  className="truncate text-right text-base leading-tight text-cream"
                >
                  {a.arabic}
                </p>
                <p className="mt-1 flex items-baseline gap-2 text-xs text-cream/75">
                  <span className="truncate">&ldquo;{a.english}&rdquo;</span>
                  <span className="shrink-0 font-semibold whitespace-nowrap text-gold">
                    {a.surahEnglish} {a.surahNumber}:{a.numberInSurah}
                  </span>
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume verses" : "Pause verses"}
            title={paused ? "Resume" : "Pause"}
            className="grid size-7 cursor-pointer place-items-center rounded-full border-2 border-cream/25 text-cream/70 transition-colors hover:border-gold hover:bg-gold hover:text-ink"
          >
            {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
          </button>

          <span className="flex gap-1" role="tablist" aria-label="Choose verse">
            {ayat.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Verse ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 cursor-pointer rounded-full transition-all",
                  i === index ? "w-4 bg-gold" : "w-1.5 bg-cream/30 hover:bg-cream/60",
                )}
              />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}
