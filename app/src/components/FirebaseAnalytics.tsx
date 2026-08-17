"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/firebase";

/**
 * Initialises Firebase Analytics on the client once, after hydration, so it
 * never blocks first paint or runs during SSR.
 */
export function FirebaseAnalytics() {
  useEffect(() => {
    initAnalytics().catch(() => {
      // Analytics is non-essential — blocked cookies or an ad blocker
      // should never surface an error to the user.
    });
  }, []);

  return null;
}
