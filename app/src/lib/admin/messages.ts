/**
 * Messaging.
 *
 * Permission model, per the brief:
 *   - Super Admin  : may message, and read, anyone.
 *   - Principal    : may message any student or teacher.
 *   - Teacher      : may message their own assigned students, and staff.
 *   - Student      : may message only their own assigned teacher (plus admin).
 *
 * Safeguarding note: students cannot message other students, and cannot
 * message a teacher who does not teach them. This mirrors CRM plan §8 —
 * no unmoderated student-to-student channel.
 */

import { students, teachers } from "./demo-data";
import { classDefs } from "./schedule";
import type { Role } from "./demo-auth";

export type Party = {
  id: string;
  name: string;
  role: Role;
  subtitle: string;
  initials: string;
};

export type Message = {
  id: string;
  threadId: string;
  fromName: string;
  fromRole: Role;
  body: string;
  /** Minutes before "now", so the demo always looks recent. */
  minutesAgo: number;
  read: boolean;
};

export type Thread = {
  id: string;
  /** Names of the two participants. */
  participants: [string, string];
  subject: string;
};

function initials(name: string) {
  return name
    .replace(/^(Ustadh|Ustadha)\s+/i, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Display name for the seeded Super Admin in sample threads only. */
export const ADMIN_NAME = "AdminSuper";
export const PRINCIPAL_NAME = "Ustadh Bilal Ahmed";

/* -------------------------------------------------------------------------- */
/*                              Directory + rules                             */
/* -------------------------------------------------------------------------- */

/** Every teacher who teaches this student. */
export function teachersForStudent(studentName: string): string[] {
  return Array.from(
    new Set(classDefs.filter((c) => c.studentName === studentName).map((c) => c.teacherName)),
  );
}

/** Every student taught by this teacher. */
export function studentsForTeacher(teacherName: string): string[] {
  return Array.from(
    new Set(classDefs.filter((c) => c.teacherName === teacherName).map((c) => c.studentName)),
  );
}

const adminParty: Party = {
  id: "U-ADMIN", name: ADMIN_NAME, role: "admin",
  subtitle: "Super Admin · Head Office", initials: initials(ADMIN_NAME),
};

const principalParty: Party = {
  id: "U-PRINCIPAL", name: PRINCIPAL_NAME, role: "principal",
  subtitle: "Principal · Lahore Campus", initials: initials(PRINCIPAL_NAME),
};

function teacherParty(name: string): Party {
  const t = teachers.find((x) => x.name === name);
  return {
    id: t?.id ?? name, name, role: "teacher",
    subtitle: t ? `Teacher · ${t.specializations.join(", ")}` : "Teacher",
    initials: initials(name),
  };
}

function studentParty(name: string): Party {
  const s = students.find((x) => x.name === name);
  return {
    id: s?.id ?? name, name, role: "student",
    subtitle: s ? `Student · ${s.course}` : "Student",
    initials: initials(name),
  };
}

/**
 * Who this person is allowed to start a conversation with.
 * This is the single source of truth for the permission rules above.
 */
export function contactsFor(role: Role, name: string): Party[] {
  switch (role) {
    case "admin":
      // Everyone
      return [
        principalParty,
        ...teachers.filter((t) => t.status === "active").map((t) => teacherParty(t.name)),
        ...students.map((s) => studentParty(s.name)),
      ];

    /*
     * The Super Admin is deliberately absent from every list below.
     * They can open a conversation with anyone, but the account itself is not
     * discoverable from a lower role — a principal, teacher or student never
     * sees that it exists. Replies still work: once the admin writes, the
     * thread is in the recipient's inbox and they answer inside it.
     */
    case "principal":
      // Any student or teacher in the academy
      return [
        ...teachers.filter((t) => t.status === "active").map((t) => teacherParty(t.name)),
        ...students.map((s) => studentParty(s.name)),
      ];

    case "teacher":
      // Own students, plus the principal — never another teacher's student
      return [
        principalParty,
        ...studentsForTeacher(name).map(studentParty),
      ];

    case "student":
      // Only their own teacher(s), plus the principal for pastoral issues
      return [
        ...teachersForStudent(name).map(teacherParty),
        principalParty,
      ];
  }
}

/**
 * Guard used before sending, so the rule is enforced not merely hinted.
 *
 * `existingThread` covers the reply case: the Super Admin is not listed as a
 * contact for anyone, so without this a person could receive a message from
 * administration and be unable to answer it.
 */
export function canMessage(
  role: Role,
  from: string,
  toName: string,
  existingThread = false,
): boolean {
  if (existingThread) return true;
  return contactsFor(role, from).some((c) => c.name === toName);
}

export function threadId(a: string, b: string) {
  return [a, b].sort().join("::");
}

/* -------------------------------------------------------------------------- */
/*                                Seed messages                               */
/* -------------------------------------------------------------------------- */

const AYESHA = "Ustadha Ayesha Siddiqa";
const YUSUF = "Yusuf Ibrahim";
const MARYAM = "Maryam Khan";

export const seedMessages: Message[] = [
  {
    id: "M-001", threadId: threadId(YUSUF, AYESHA), fromName: AYESHA, fromRole: "teacher",
    body: "Assalamu alaikum. Yusuf did very well today — he completed the full sabaq without prompting, masha'Allah.",
    minutesAgo: 95, read: true,
  },
  {
    id: "M-002", threadId: threadId(YUSUF, AYESHA), fromName: YUSUF, fromRole: "student",
    body: "Wa alaikum assalam, jazakillahu khairan. I will revise the madd rules again before Wednesday.",
    minutesAgo: 80, read: true,
  },
  {
    id: "M-003", threadId: threadId(YUSUF, AYESHA), fromName: AYESHA, fromRole: "teacher",
    body: "Please also read page 14 of the Qaida twice. We will start the next section on Wednesday in sha Allah.",
    minutesAgo: 34, read: false,
  },
  {
    id: "M-004", threadId: threadId(MARYAM, AYESHA), fromName: MARYAM, fromRole: "student",
    body: "Ustadha, may I move Thursday's class to the evening? I have a school exam that morning.",
    minutesAgo: 210, read: true,
  },
  {
    id: "M-005", threadId: threadId(MARYAM, AYESHA), fromName: AYESHA, fromRole: "teacher",
    body: "Of course. I will ask administration to reschedule it to 18:00 your time. Best of luck with the exam.",
    minutesAgo: 180, read: true,
  },
  {
    id: "M-006", threadId: threadId(AYESHA, PRINCIPAL_NAME), fromName: PRINCIPAL_NAME, fromRole: "principal",
    body: "Please submit your attendance comments for last week before Friday so I can prepare the parent reports.",
    minutesAgo: 300, read: false,
  },
  {
    id: "M-007", threadId: threadId(AYESHA, PRINCIPAL_NAME), fromName: AYESHA, fromRole: "teacher",
    body: "Noted, I will have them completed by Thursday evening in sha Allah.",
    minutesAgo: 240, read: true,
  },
  {
    id: "M-008", threadId: threadId(YUSUF, PRINCIPAL_NAME), fromName: PRINCIPAL_NAME, fromRole: "principal",
    body: "Your progress report for this month has been approved and is now available in the Reports section.",
    minutesAgo: 1400, read: true,
  },
];

export function timeAgo(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.round(minutes)}m ago`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

/* -------------------------------------------------------------------------- */
/*                            Shared message store                            */
/* -------------------------------------------------------------------------- */

/**
 * Messages are persisted to localStorage under one shared key, so a message
 * sent by a teacher is visible when you sign in as that student — including
 * in another browser tab, via the `storage` event.
 *
 * This is a demo stand-in for Firestore. When the backend lands, replace the
 * read/write pair below with a collection query and an addDoc; the component
 * API does not change.
 */

const STORE_KEY = "qm_messages_v1";

type Stored = Omit<Message, "minutesAgo"> & { sentAt: number };

function toStored(m: Message, now: number): Stored {
  const { minutesAgo, ...rest } = m;
  return { ...rest, sentAt: now - minutesAgo * 60_000 };
}

function fromStored(s: Stored, now: number): Message {
  return { ...s, minutesAgo: Math.max(0, (now - s.sentAt) / 60_000) };
}

/** Seeds the store on first run, then returns every message. */
export function loadMessages(now = Date.now()): Message[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) {
      const seeded = seedMessages.map((m) => toStored(m, now));
      window.localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
      return seeded.map((s) => fromStored(s, now));
    }
    return (JSON.parse(raw) as Stored[])
      .map((s) => fromStored(s, now))
      .sort((a, b) => b.minutesAgo - a.minutesAgo);
  } catch {
    return seedMessages.map((m) => ({ ...m }));
  }
}

/** Appends a message and notifies other tabs. */
export function persistMessage(msg: Omit<Message, "minutesAgo">): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    const list: Stored[] = raw ? JSON.parse(raw) : [];
    list.push({ ...msg, sentAt: Date.now() });
    window.localStorage.setItem(STORE_KEY, JSON.stringify(list));
    // Same-tab listeners; the storage event only fires in *other* tabs
    window.dispatchEvent(new CustomEvent("qm-messages-changed"));
  } catch {
    /* storage unavailable — the message stays in memory for this session */
  }
}

/** Marks a thread read for one person, so unread badges clear correctly. */
export function markThreadRead(threadIdValue: string, readerName: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const list = (JSON.parse(raw) as Stored[]).map((s) =>
      s.threadId === threadIdValue && s.fromName !== readerName
        ? { ...s, read: true }
        : s,
    );
    window.localStorage.setItem(STORE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("qm-messages-changed"));
  } catch {
    /* ignore */
  }
}

/** Subscribes to changes from this tab and others. Returns an unsubscribe. */
export function subscribeMessages(fn: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORE_KEY) fn();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("qm-messages-changed", fn);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("qm-messages-changed", fn);
  };
}

/** Clears the store, restoring the seeded conversations. */
export function resetMessages(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORE_KEY);
  window.dispatchEvent(new CustomEvent("qm-messages-changed"));
}
