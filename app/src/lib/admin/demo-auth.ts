"use client";

/**
 * Compatibility shim.
 *
 * Authentication moved to Firebase Auth in `auth.ts`. This file re-exports it
 * so existing imports keep working; prefer importing from "@/lib/admin/auth".
 */

export {
  canImpersonate,
  createUserProfile,
  getImpersonation,
  initials,
  loadProfile,
  ROLE_NAV,
  sessionForPerson,
  signIn,
  signOut,
  startImpersonation,
  stopImpersonation,
  watchSession,
  type Impersonation,
  type Profile,
  type Role,
  type Session,
} from "./auth";
