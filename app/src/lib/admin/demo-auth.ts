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
const IMPERSONATION_KEY = "qm_demo_impersonation";

export type Session = Omit<DemoUser, "password">;

/** Records who started an impersonation so the portal can return to them. */
export type Impersonation = {
  actor: Session;
  target: Session;
  startedAt: number;
};

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
  window.localStorage.removeItem(IMPERSONATION_KEY);
}

/* -------------------------------------------------------------------------- */
/*                               Impersonation                                */
/* -------------------------------------------------------------------------- */

/**
 * Only Super Admin and Principal may act as another user, mirroring
 * CRM plan §5.1. The original session is preserved so the actor can return.
 * In production every start and stop is written to the audit log and the
 * session is time-boxed; here it is a client-side convenience only.
 */
export function canImpersonate(role: Role) {
  return role === "admin" || role === "principal";
}

export function startImpersonation(target: Session): boolean {
  const actor = getSession();
  if (!actor || !canImpersonate(actor.role)) return false;
  // Never nest — always impersonate from the real account
  if (getImpersonation()) return false;

  const record: Impersonation = { actor, target, startedAt: Date.now() };
  window.localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(record));
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(target));
  return true;
}

export function getImpersonation(): Impersonation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(IMPERSONATION_KEY);
    return raw ? (JSON.parse(raw) as Impersonation) : null;
  } catch {
    return null;
  }
}

/** Restores the original account. Returns false if not impersonating. */
export function stopImpersonation(): boolean {
  const record = getImpersonation();
  if (!record) return false;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(record.actor));
  window.localStorage.removeItem(IMPERSONATION_KEY);
  return true;
}

/** Builds a session for a teacher or student being impersonated. */
export function sessionForPerson(
  name: string,
  role: Role,
  branch = "Lahore Campus",
): Session {
  const initials = name
    .replace(/^(Ustadh|Ustadha)\s+/i, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return {
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@quranmubarak.com`,
    name,
    role,
    title: role === "teacher" ? "Quran Teacher" : "Student",
    branch,
    avatarInitials: initials,
  };
}

/** Navigation entries each role is permitted to see. */
export const ROLE_NAV: Record<Role, readonly string[]> = {
  admin: [
    "dashboard", "today", "messages", "submissions", "leads", "applications", "students", "teachers", "classes",
    "attendance", "complaints", "leave", "finance", "reports", "policies", "settings",
  ],
  principal: [
    "dashboard", "today", "messages", "submissions", "leads", "applications", "students", "teachers", "classes",
    "attendance", "complaints", "leave", "reports", "policies",
  ],
  teacher: [
    "dashboard", "today", "messages", "students", "classes",
    "attendance", "leave", "reports", "policies",
  ],
  student: [
    "dashboard", "messages", "classes", "attendance", "reports", "complaints",
  ],
};
