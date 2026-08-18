/**
 * Schedule engine.
 *
 * Generates a real, self-consistent timetable from recurring class
 * definitions, so every view (student, teacher, admin calendar, today's
 * board) is derived from one source rather than hand-written per screen.
 *
 * All dates are handled in local time. When the Firestore backend lands,
 * `classDefs` becomes a collection query and the expansion below moves to
 * the server — the shapes returned here are the contract.
 */

import { students, teachers } from "./demo-data";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export type ClassDef = {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  course: string;
  /** Days of the week this class recurs on. */
  days: readonly Weekday[];
  /** Local start time, "HH:MM". */
  start: string;
  durationMin: number;
  zoomUrl: string;
  status: "active" | "paused";
};

export type SessionStatus =
  | "scheduled"
  | "live"
  | "completed"
  | "missed-student"
  | "missed-teacher"
  | "cancelled";

export type Attendance = "present" | "absent" | "late" | "excused" | "pending";

export type ClassSession = {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  startsAt: Date;
  endsAt: Date;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  course: string;
  zoomUrl: string;
  status: SessionStatus;
  attendance: Attendance;
  /** Teacher's short performance note, recorded after the class. */
  note?: string;
  rating?: number; // 1–5
};

/* -------------------------------------------------------------------------- */
/*                             Class definitions                              */
/* -------------------------------------------------------------------------- */

const MWF: readonly Weekday[] = [1, 3, 5];
const TTH: readonly Weekday[] = [2, 4];
const FIVE: readonly Weekday[] = [1, 2, 3, 4, 5];

function zoom(id: string) {
  // Placeholder rooms until the Zoom Server-to-Server integration lands.
  return `https://zoom.us/j/${id}`;
}

export const classDefs: readonly ClassDef[] = [
  { id: "C-001", studentId: "ST-401", studentName: "Yusuf Ibrahim", teacherId: "T-101", teacherName: "Ustadha Ayesha Siddiqa", course: "Quran Reading", days: FIVE, start: "07:00", durationMin: 30, zoomUrl: zoom("98211100401"), status: "active" },
  { id: "C-002", studentId: "ST-402", studentName: "Maryam Khan", teacherId: "T-101", teacherName: "Ustadha Ayesha Siddiqa", course: "Quran Memorization", days: FIVE, start: "07:30", durationMin: 60, zoomUrl: zoom("98211100402"), status: "active" },
  { id: "C-003", studentId: "ST-403", studentName: "Ahmad Raza", teacherId: "T-102", teacherName: "Ustadh Bilal Ahmed", course: "Quran Recitation", days: MWF, start: "08:00", durationMin: 30, zoomUrl: zoom("98211100403"), status: "active" },
  { id: "C-004", studentId: "ST-404", studentName: "Fatima Noor", teacherId: "T-105", teacherName: "Ustadh Imran Malik", course: "Quran Reading", days: MWF, start: "08:30", durationMin: 30, zoomUrl: zoom("98211100404"), status: "active" },
  { id: "C-005", studentId: "ST-405", studentName: "Bilal Hassan", teacherId: "T-103", teacherName: "Ustadha Zainab Ali", course: "Islamic Education", days: TTH, start: "09:00", durationMin: 30, zoomUrl: zoom("98211100405"), status: "active" },
  { id: "C-006", studentId: "ST-406", studentName: "Aisha Siddiq", teacherId: "T-104", teacherName: "Ustadh Yusuf Qadri", course: "Quran Translation", days: FIVE, start: "09:00", durationMin: 60, zoomUrl: zoom("98211100406"), status: "active" },
  { id: "C-007", studentId: "ST-407", studentName: "Omar Farooq", teacherId: "T-101", teacherName: "Ustadha Ayesha Siddiqa", course: "Quran Memorization", days: FIVE, start: "09:30", durationMin: 60, zoomUrl: zoom("98211100407"), status: "active" },
  { id: "C-008", studentId: "ST-408", studentName: "Zainab Tariq", teacherId: "T-102", teacherName: "Ustadh Bilal Ahmed", course: "Quran Reading", days: MWF, start: "10:00", durationMin: 30, zoomUrl: zoom("98211100408"), status: "active" },
  { id: "C-009", studentId: "ST-401", studentName: "Yusuf Ibrahim", teacherId: "T-103", teacherName: "Ustadha Zainab Ali", course: "Islamic Education", days: TTH, start: "17:00", durationMin: 30, zoomUrl: zoom("98211100409"), status: "active" },
  { id: "C-010", studentId: "ST-402", studentName: "Maryam Khan", teacherId: "T-104", teacherName: "Ustadh Yusuf Qadri", course: "Quran Translation", days: TTH, start: "18:00", durationMin: 60, zoomUrl: zoom("98211100410"), status: "active" },
] as const;

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

export function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function startOfWeek(d: Date): Date {
  // Week starts Monday
  const out = new Date(d);
  const dow = out.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  out.setDate(out.getDate() + diff);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMinutes(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function atTime(date: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const out = new Date(date);
  out.setHours(h, m, 0, 0);
  return out;
}

/**
 * Deterministic pseudo-random in [0,1) from a string seed, so the same
 * session always receives the same historical outcome across renders and
 * between server and client. Math.random would cause hydration mismatches.
 */
function seeded(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

const NOTES_GOOD = [
  "Excellent focus, completed the full sabaq.",
  "Strong Tajweed, madd rules applied correctly.",
  "Confident recitation, well prepared.",
  "Good revision, retained last week's portion.",
  "Very attentive, asked thoughtful questions.",
];
const NOTES_MIXED = [
  "Joined late but caught up well.",
  "Needs more revision on ghunnah.",
  "Progressing, though homework was incomplete.",
  "Some hesitation on new letters, will revisit.",
];

/* -------------------------------------------------------------------------- */
/*                             Session expansion                              */
/* -------------------------------------------------------------------------- */

/** Expands recurring definitions into concrete sessions across a date range. */
export function expandSessions(from: Date, to: Date, now = new Date()): ClassSession[] {
  const out: ClassSession[] = [];

  for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
    const dow = d.getDay() as Weekday;

    for (const def of classDefs) {
      if (def.status !== "active") continue;
      if (!def.days.includes(dow)) continue;

      const date = ymd(d);
      const end = addMinutes(def.start, def.durationMin);
      const startsAt = atTime(d, def.start);
      const endsAt = atTime(d, end);
      const id = `${def.id}-${date}`;

      let status: SessionStatus;
      let attendance: Attendance;
      let note: string | undefined;
      let rating: number | undefined;

      if (endsAt < now) {
        // Past — assign a stable outcome
        const r = seeded(id);
        if (r < 0.82) {
          status = "completed";
          attendance = r < 0.7 ? "present" : "late";
          const pool = attendance === "present" ? NOTES_GOOD : NOTES_MIXED;
          note = pool[Math.floor(seeded(id + "n") * pool.length)];
          rating = attendance === "present" ? 4 + Math.round(seeded(id + "r")) : 3;
        } else if (r < 0.93) {
          status = "missed-student";
          attendance = "absent";
          note = "Student did not join.";
        } else if (r < 0.97) {
          status = "cancelled";
          attendance = "excused";
          note = "Cancelled in advance by parent.";
        } else {
          status = "missed-teacher";
          attendance = "excused";
          note = "Teacher unavailable — rescheduled.";
        }
      } else if (startsAt <= now && endsAt >= now) {
        status = "live";
        attendance = "pending";
      } else {
        status = "scheduled";
        attendance = "pending";
      }

      out.push({
        id,
        classId: def.id,
        date,
        start: def.start,
        end,
        startsAt,
        endsAt,
        studentId: def.studentId,
        studentName: def.studentName,
        teacherId: def.teacherId,
        teacherName: def.teacherName,
        course: def.course,
        zoomUrl: def.zoomUrl,
        status,
        attendance,
        note,
        rating,
      });
    }
  }

  return out.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export function sessionsForDay(date: Date, now = new Date()) {
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  const to = new Date(date);
  to.setHours(23, 59, 59, 999);
  return expandSessions(from, to, now);
}

export function sessionsForRange(from: Date, to: Date, now = new Date()) {
  return expandSessions(from, to, now);
}

/** Filters by the signed-in person, so each portal sees only its own classes. */
export function filterForRole(
  sessions: ClassSession[],
  role: string,
  name: string,
): ClassSession[] {
  if (role === "teacher") return sessions.filter((s) => s.teacherName === name);
  if (role === "student") {
    // Match by name so impersonating another student shows THEIR classes,
    // not the demo account's. Falls back to the first record only if the
    // signed-in name matches no student.
    const me = students.find((s) => s.name === name) ?? students[0];
    return sessions.filter((s) => s.studentName === me.name);
  }
  return sessions;
}

export function teacherByName(name: string) {
  return teachers.find((t) => t.name === name);
}

/* -------------------------------------------------------------------------- */
/*                                  Labels                                    */
/* -------------------------------------------------------------------------- */

export const STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: "Scheduled",
  live: "Live now",
  completed: "Completed",
  "missed-student": "Student no-show",
  "missed-teacher": "Teacher absent",
  cancelled: "Cancelled",
};

export const WEEKDAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTH_LABEL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
