"use client";

/**
 * DEMO AUTHENTICATION — NOT FOR PRODUCTION.
 *
 * Credentials are hard-coded and the "session" is a plain localStorage flag.
 * There is no server-side verification whatsoever: anyone can read these
 * values from the JS bundle, and anyone can forge a session from devtools.
 *
 * This exists so the portal UI can be demonstrated and reviewed before the
 * real backend lands. Replace wholesale with Firebase Auth + custom claims
 * (see planning/CRM-IMPLEMENTATION-PLAN.md §5.1) before any real data
 * touches this system.
 */

export type Role = "admin" | "principal" | "teacher" | "student";

export type DemoUser = {
  email: string;
  password: string;
  name: string;
  role: Role;
  title: string;
  branch: string;
  avatarInitials: string;
};

export const DEMO_USERS: readonly DemoUser[] = [
  {
    email: "admin@quranmubarak.com",
    password: "demo1234",
    name: "Qasim Shafiq Mir",
    role: "admin",
    title: "Super Admin",
    branch: "Head Office",
    avatarInitials: "QM",
  },
  {
    email: "principal@quranmubarak.com",
    password: "demo1234",
    name: "Ustadh Bilal Ahmed",
    role: "principal",
    title: "Principal",
    branch: "Lahore Campus",
    avatarInitials: "BA",
  },
  {
    email: "teacher@quranmubarak.com",
    password: "demo1234",
    name: "Ustadha Ayesha Siddiqa",
    role: "teacher",
    title: "Quran Teacher",
    branch: "Lahore Campus",
    avatarInitials: "AS",
  },
  {
    email: "student@quranmubarak.com",
    password: "demo1234",
    name: "Yusuf Ibrahim",
    role: "student",
    title: "Student",
    branch: "Lahore Campus",
    avatarInitials: "YI",
  },
] as const;

const SESSION_KEY = "qm_demo_session";

export type Session = Omit<DemoUser, "password">;

export function signIn(email: string, password: string): Session | null {
  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!user) return null;

  const { password: _password, ...session } = user;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function signOut() {
  window.localStorage.removeItem(SESSION_KEY);
}

/** Navigation entries each role is permitted to see. */
export const ROLE_NAV: Record<Role, readonly string[]> = {
  admin: [
    "dashboard", "today", "leads", "students", "teachers", "classes",
    "attendance", "complaints", "leave", "finance", "reports", "policies", "settings",
  ],
  principal: [
    "dashboard", "today", "leads", "students", "teachers", "classes",
    "attendance", "complaints", "leave", "reports", "policies",
  ],
  teacher: ["dashboard", "today", "students", "classes", "attendance", "leave", "policies"],
  student: ["dashboard", "classes", "attendance", "finance", "complaints"],
};
