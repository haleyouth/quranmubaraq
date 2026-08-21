"use client";

/**
 * Portal authentication, backed by Firebase Auth.
 *
 * Identity is the signed-in Firebase user plus their /users profile, which
 * carries role and display name. Role lives in Firestore rather than a client
 * store because the security rules read it there: a browser cannot grant
 * itself a role it was not given.
 */

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import {
  collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type Role = "admin" | "principal" | "teacher" | "student";

export type Session = {
  uid: string;
  email: string;
  name: string;
  role: Role;
  title: string;
  branch: string;
  avatarInitials: string;
};

export type Profile = Omit<Session, "uid">;

const IMPERSONATION_KEY = "qm_impersonation";

export function initials(name: string) {
  return name
    .replace(/^(Ustadh|Ustadha)\s+/i, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Loads the profile that gives a Firebase user their role. */
export async function loadProfile(user: User): Promise<Session | null> {
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return null;

  const p = snap.data() as Partial<Profile>;
  if (!p.role || !p.name) return null;

  return {
    uid: user.uid,
    email: p.email ?? user.email ?? "",
    name: p.name,
    role: p.role as Role,
    title: p.title ?? "",
    branch: p.branch ?? "",
    avatarInitials: p.avatarInitials ?? initials(p.name),
  };
}

export async function signIn(email: string, password: string): Promise<Session> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const session = await loadProfile(cred.user);
  if (!session) {
    await fbSignOut(auth);
    throw new Error(
      "This account has no portal profile yet. Ask an administrator to set one up.",
    );
  }
  return session;
}

export async function signOut() {
  window.sessionStorage.removeItem(IMPERSONATION_KEY);
  await fbSignOut(auth);
}

/**
 * Watches the signed-in user, resolving their profile on each change.
 *
 * `loading` stays true until Firebase has genuinely settled. That matters on
 * a hard page load: the SDK restores the persisted user from IndexedDB
 * asynchronously, and callers that treat the intervening null as "signed out"
 * would bounce a signed-in person back to the login page. Resolving the
 * profile is itself async, so that gap is held open too.
 *
 * Returns an unsubscribe.
 */
export function watchSession(
  onChange: (session: Session | null, loading: boolean) => void,
): () => void {
  let generation = 0;

  return onAuthStateChanged(auth, async (user) => {
    const mine = ++generation;

    if (!user) {
      // Firebase has finished restoring and found nobody: genuinely signed out.
      return onChange(null, false);
    }

    try {
      const session = await loadProfile(user);
      // A newer auth event has superseded this one — drop the stale result.
      if (mine !== generation) return;
      onChange(session, false);
    } catch {
      if (mine !== generation) return;
      onChange(null, false);
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                               Impersonation                                */
/* -------------------------------------------------------------------------- */

/**
 * Viewing the portal as another person.
 *
 * This is a presentation-layer overlay only: the Firebase session, and
 * therefore every security rule, still applies to the real signed-in staff
 * member. Nothing is written as the impersonated user.
 */
export type Impersonation = { actor: Session; target: Session; startedAt: number };

export function canImpersonate(role: Role) {
  return role === "admin" || role === "principal";
}

export function startImpersonation(actor: Session, target: Session): boolean {
  if (!canImpersonate(actor.role)) return false;
  if (getImpersonation()) return false;
  window.sessionStorage.setItem(
    IMPERSONATION_KEY,
    JSON.stringify({ actor, target, startedAt: Date.now() }),
  );
  return true;
}

export function getImpersonation(): Impersonation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(IMPERSONATION_KEY);
    return raw ? (JSON.parse(raw) as Impersonation) : null;
  } catch {
    return null;
  }
}

export function stopImpersonation(): boolean {
  if (!getImpersonation()) return false;
  window.sessionStorage.removeItem(IMPERSONATION_KEY);
  return true;
}

export function sessionForPerson(
  uid: string,
  name: string,
  role: Role,
  branch = "Lahore Campus",
): Session {
  return {
    uid,
    email: "",
    name,
    role,
    title: role === "teacher" ? "Quran Teacher" : "Student",
    branch,
    avatarInitials: initials(name),
  };
}

/* -------------------------------------------------------------------------- */
/*                          Account administration                            */
/* -------------------------------------------------------------------------- */

/**
 * Creates the portal profile for a new teacher or student.
 *
 * Only the profile is written here. Creating the sign-in credential requires
 * the Admin SDK, which a static site cannot run, so the person is invited to
 * register with this email and their profile is waiting when they do.
 */
export async function createUserProfile(input: {
  uid: string;
  email: string;
  name: string;
  role: Role;
  title?: string;
  branch?: string;
}) {
  return setDoc(doc(db, "users", input.uid), {
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    role: input.role,
    title: input.title ?? (input.role === "teacher" ? "Quran Teacher" : "Student"),
    branch: input.branch ?? "Lahore Campus",
    avatarInitials: initials(input.name),
    status: "active",
  });
}

/** Navigation entries each role is permitted to see. */
export const ROLE_NAV: Record<Role, readonly string[]> = {
  admin: [
    "dashboard", "today", "messages", "submissions", "students", "teachers",
    "classes", "attendance", "complaints", "leave", "finance", "reports",
    "policies", "accounts", "settings",
  ],
  principal: [
    "dashboard", "today", "messages", "submissions", "students", "teachers",
    "classes", "attendance", "complaints", "leave", "reports", "policies",
    "accounts",
  ],
  teacher: [
    "dashboard", "today", "messages", "students", "classes",
    "attendance", "leave", "reports", "policies",
  ],
  student: [
    "dashboard", "messages", "classes", "attendance", "reports", "complaints",
  ],
};

/* -------------------------------------------------------------------------- */
/*                              Account directory                             */
/* -------------------------------------------------------------------------- */

export type DirectoryUser = Profile & { uid: string };

/** Every portal account. Readable by any signed-in user. */
export async function listUsers(): Promise<DirectoryUser[]> {
  const snap = await getDocs(query(collection(db, "users"), orderBy("name")));
  return snap.docs.map((d) => {
    const p = d.data() as Partial<Profile>;
    return {
      uid: d.id,
      email: p.email ?? "",
      name: p.name ?? "",
      role: (p.role ?? "student") as Role,
      title: p.title ?? "",
      branch: p.branch ?? "",
      avatarInitials: p.avatarInitials ?? initials(p.name ?? ""),
    };
  });
}

/**
 * Creates a new teacher or student account.
 *
 * Creating the sign-in credential and the profile in one step needs the Admin
 * SDK, which a static site cannot run. Instead a second Firebase app instance
 * registers the credential without disturbing the staff member's own session —
 * signing up on the default instance would sign them out.
 */
export async function createAccount(input: {
  email: string;
  password: string;
  name: string;
  role: Exclude<Role, "admin">;
  title?: string;
  branch?: string;
}): Promise<{ uid: string }> {
  const { initializeApp, deleteApp, getApps } = await import("firebase/app");
  const { getAuth: getSecondaryAuth, createUserWithEmailAndPassword } = await import(
    "firebase/auth"
  );

  const primary = getApps()[0];
  const secondary = initializeApp(primary.options, `provision-${Date.now()}`);

  try {
    const cred = await createUserWithEmailAndPassword(
      getSecondaryAuth(secondary),
      input.email.trim().toLowerCase(),
      input.password,
    );

    // Written by the staff member on the primary session, which the rules
    // permit; the new user never writes their own privileged fields.
    await createUserProfile({
      uid: cred.user.uid,
      email: input.email,
      name: input.name,
      role: input.role,
      title: input.title,
      branch: input.branch,
    });

    return { uid: cred.user.uid };
  } finally {
    await deleteApp(secondary);
  }
}

/** Updates a person's profile. Staff only, enforced by the rules. */
export async function updateAccount(
  uid: string,
  changes: Partial<Pick<Profile, "name" | "email" | "role" | "title" | "branch">>,
) {
  const patch: Record<string, unknown> = { ...changes };
  if (changes.name) patch.avatarInitials = initials(changes.name);
  return updateDoc(doc(db, "users", uid), patch);
}

/** Removes a profile. Admin only; the sign-in credential must be removed
 *  separately from the Firebase console. */
export async function deleteAccount(uid: string) {
  return deleteDoc(doc(db, "users", uid));
}
