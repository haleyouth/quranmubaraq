"use client";

import { useEffect, useState } from "react";
import { ayahOfTheDay, fetchAyahOfTheDay, type Ayah } from "@/lib/ayah";

/**
 * Verse of the day, as a marquee for the portal top bar.
 *
 * Sits beside the Hijri date rather than occupying a card, so it costs no
 * vertical space. The track is duplicated once so the -50% translate loops
 * seamlessly, matching the marketing site's marquee.
 *
 * Pauses on hover, and holds still entirely under prefers-reduced-motion —
 * scrolling scripture past someone who cannot read it at speed is worse than
 * showing nothing.
 */
export function AyahMarquee() {
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setAyah(ayahOfTheDay());

    let alive = true;
    fetchAyahOfTheDay()
      .then((a) => {
        if (alive) setAyah(a);
      })
      .catch(() => {
        /* bundled text already rendered */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!ayah) return null;

  const citation = `${ayah.surahEnglish} ${ayah.surahNumber}:${ayah.numberInSurah}`;

  // Static under reduced motion: truncate rather than scroll
  if (reduced) {
    return (
      <p
        className="hidden min-w-0 flex-1 truncate text-sm text-ink/70 xl:block"
        title={`${ayah.english} — ${citation}`}
      >
        <span lang="ar" dir="rtl" className="text-ink">
          {ayah.arabic}
        </span>
        <span className="mx-2 text-ink/30">·</span>
        {ayah.english}
        <span className="ml-2 font-semibold text-green-deep">{citation}</span>
      </p>
    );
  }

  const Verse = () => (
    <span className="flex shrink-0 items-center gap-3 pr-12">
      <span lang="ar" dir="rtl" className="text-base text-ink">
        {ayah.arabic}
      </span>
      <span aria-hidden="true" className="text-ink/25">
        ·
      </span>
      <span className="text-sm text-ink/70">&ldquo;{ayah.english}&rdquo;</span>
      <span className="text-sm font-semibold text-green-deep">{citation}</span>
    </span>
  );

  return (
    <div
      className="group hidden min-w-0 flex-1 overflow-hidden xl:block"
      aria-label="Verse of the day"
    >
      <div className="flex w-max animate-[marquee_42s_linear_infinite] group-hover:[animation-play-state:paused]">
        <Verse />
        {/* Duplicate carries the loop; hidden from assistive tech */}
        <span aria-hidden="true" className="flex">
          <Verse />
        </span>
      </div>
    </div>
  );
}
