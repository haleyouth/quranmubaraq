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

export const ADMIN_NAME = "Qasim Shafiq Mir";
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

    case "principal":
      // Any student or teacher, plus the super admin
      return [
        adminParty,
        ...teachers.filter((t) => t.status === "active").map((t) => teacherParty(t.name)),
        ...students.map((s) => studentParty(s.name)),
      ];

    case "teacher":
      // Own students, plus staff — never another teacher's student
      return [
        adminParty,
        principalParty,
        ...studentsForTeacher(name).map(studentParty),
      ];

    case "student":
      // Only their own teacher(s), plus administration for pastoral issues
      return [
        ...teachersForStudent(name).map(teacherParty),
        principalParty,
        adminParty,
      ];
  }
}

/** Guard used before sending, so the rule is enforced not merely hinted. */
export function canMessage(role: Role, from: string, toName: string): boolean {
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
