"use client";

/**
 * Verse of the day, scrolling across the footer.
 *
 * A footer variant rather than a shared component: the portal marquee is
 * styled for a light bar and hides below xl, whereas this sits on the dark
 * footer and must show on every screen size.
 *
 * The verse changes at local midnight, picked deterministically from the date
 * so every visitor on a given day sees the same one.
 */

import { useEffect, useState } from "react";
import { ayahOfTheDay, fetchAyahOfTheDay, type Ayah } from "@/lib/ayah";

export function FooterAyah() {
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [reduced, setReduced] = useState(false);

  // Resolved after mount: the page is a static export built long before it is
  // viewed, so "today" has to be the viewer's today, not the build's.
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setAyah(ayahOfTheDay());

    let alive = true;
    fetchAyahOfTheDay()
      .then((a) => {
        if (alive) setAyah(a);
      })
      .catch(() => {
        /* the bundled verse is already showing */
      });
    return () => {
      alive = false;
    };
  }, []);

  // Hold the vertical space so the footer does not jump when the verse lands.
  if (!ayah) return <div className="h-8" aria-hidden="true" />;

  const citation = `${ayah.surahEnglish} ${ayah.surahNumber}:${ayah.numberInSurah}`;

  // Scrolling scripture past someone who cannot read it at speed is worse
  // than showing it still, so reduced motion gets a centred static verse.
  if (reduced) {
    return (
      <div className="text-center" aria-label="Verse of the day">
        <p lang="ar" dir="rtl" className="text-lg leading-loose text-cream">
          {ayah.arabic}
        </p>
        <p className="mt-1 text-sm text-cream/70 italic">
          &ldquo;{ayah.english}&rdquo;
        </p>
        <p className="mt-1 font-marker text-sm text-gold">{citation}</p>
      </div>
    );
  }

  const Verse = () => (
    <span className="flex shrink-0 items-center gap-4 pr-16">
      <span lang="ar" dir="rtl" className="text-lg text-cream">
        {ayah.arabic}
      </span>
      <span aria-hidden="true" className="text-cream/25">
        &bull;
      </span>
      <span className="text-sm text-cream/70 italic">
        &ldquo;{ayah.english}&rdquo;
      </span>
      <span className="font-marker text-sm text-gold">{citation}</span>
    </span>
  );

  return (
    <div
      className="group overflow-hidden"
      aria-label="Verse of the day"
    >
      <div className="flex w-max animate-[marquee_52s_linear_infinite] group-hover:[animation-play-state:paused]">
        <Verse />
        {/* Duplicate carries the seamless loop; hidden from assistive tech */}
        <span aria-hidden="true" className="flex">
          <Verse />
        </span>
      </div>
    </div>
  );
}
