"use client";

/**
 * The effective timetable for the signed-in person.
 *
 * Classes staff have scheduled live in Firestore take precedence; the built-in
 * demo timetable shows through only until the first real class is booked, so a
 * fresh academy is not staring at an empty calendar and an established one is
 * never shown fictional classes alongside its real ones.
 */

import { useEffect, useState } from "react";
import { subscribeToClasses, type LiveClass } from "./classes-live";
import { classDefs, type ClassDef } from "./schedule";

export type ClassesState = {
  /** What every schedule view should expand. */
  defs: readonly ClassDef[];
  /** True once Firestore has answered. */
  ready: boolean;
  /** True when `defs` is the built-in sample rather than real bookings. */
  isDemo: boolean;
};

export function useClasses(): ClassesState {
  const [live, setLive] = useState<LiveClass[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = subscribeToClasses(
      (classes) => {
        if (!cancelled) setLive(classes);
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Firestore unreachable, or answered with nothing booked yet.
  if (failed) return { defs: classDefs, ready: true, isDemo: true };
  if (live === null) return { defs: classDefs, ready: false, isDemo: true };
  if (live.length === 0) return { defs: classDefs, ready: true, isDemo: true };

  return { defs: live, ready: true, isDemo: false };
}
