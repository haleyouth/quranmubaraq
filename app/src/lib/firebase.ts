/**
 * Firebase client SDK.
 *
 * Config values are read from NEXT_PUBLIC_* env vars so each environment
 * (local / staging / production) can point at its own project. Firebase web
 * API keys are public identifiers by design — they are not secrets. Access is
 * controlled by Firestore/Storage security rules and App Check, never by
 * hiding this key.
 */

import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { type Analytics, getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Reuse the existing app across hot reloads and RSC boundaries
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

/**
 * Analytics is browser-only and unsupported in some environments
 * (SSR, older browsers, blocked cookies), so it is initialised lazily.
 */
export async function initAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.measurementId) return null;
  return (await isSupported()) ? getAnalytics(app) : null;
}
