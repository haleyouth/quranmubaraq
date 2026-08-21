"use client";

/**
 * Scheduled classes, stored in Firestore.
 *
 * A schedule is what every other view derives from — today's board, the
 * calendar, attendance, each portal's timetable — so it has to be real data
 * rather than a per-browser draft: a class the principal books must be
 * visible to the teacher and the student on their own devices.
 *
 * Shapes match `ClassDef` in ./schedule so the expansion engine can consume
 * these and the hardcoded demo defs interchangeably.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ClassDef, Weekday } from "./schedule";

const COLLECTION = "classes";

/** A class as stored: same fields as ClassDef, plus bookkeeping. */
export type LiveClass = ClassDef & {
  /** Who booked it, for the audit trail. */
  createdBy?: string;
};

/**
 * Subscribes to the whole timetable.
 *
 * Every signed-in person receives all classes and the caller narrows to their
 * own; the set is small (one row per student per course) and the rules already
 * restrict writes. Filtering server-side per role would need a different
 * query per portal and would still not hide a colleague's name, which the
 * directory exposes anyway.
 */
export function subscribeToClasses(
  onChange: (classes: LiveClass[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, COLLECTION)),
    (snap) => {
      onChange(
        snap.docs.map((d) => {
          const data = d.data() as Partial<LiveClass>;
          return {
            id: d.id,
            studentId: data.studentId ?? "",
            studentName: data.studentName ?? "",
            teacherId: data.teacherId ?? "",
            teacherName: data.teacherName ?? "",
            course: data.course ?? "Quran Reading",
            days: (data.days ?? []) as readonly Weekday[],
            start: data.start ?? "09:00",
            durationMin: data.durationMin ?? 30,
            zoomUrl: data.zoomUrl ?? "",
            status: data.status === "paused" ? "paused" : "active",
            createdBy: data.createdBy,
          };
        }),
      );
    },
    (err) => onError?.(err),
  );
}

export type ClassInput = {
  studentName: string;
  teacherName: string;
  course: string;
  days: readonly Weekday[];
  start: string;
  durationMin: number;
  zoomUrl?: string;
  status?: "active" | "paused";
  /** Optional roster ids, kept when the person exists in the demo roster. */
  studentId?: string;
  teacherId?: string;
};

export async function createClass(input: ClassInput, createdBy: string) {
  return addDoc(collection(db, COLLECTION), {
    studentId: input.studentId ?? "",
    studentName: input.studentName,
    teacherId: input.teacherId ?? "",
    teacherName: input.teacherName,
    course: input.course,
    days: [...input.days],
    start: input.start,
    durationMin: input.durationMin,
    zoomUrl: input.zoomUrl ?? "",
    status: input.status ?? "active",
    createdBy,
    createdAt: serverTimestamp(),
  });
}

export async function updateClass(id: string, changes: Partial<ClassInput>) {
  const patch: Record<string, unknown> = { ...changes };
  if (changes.days) patch.days = [...changes.days];
  return updateDoc(doc(db, COLLECTION, id), patch);
}

export async function deleteClass(id: string) {
  return deleteDoc(doc(db, COLLECTION, id));
}

/* -------------------------------------------------------------------------- */
/*                             Conflict detection                             */
/* -------------------------------------------------------------------------- */

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Finds classes that would collide with a proposed booking.
 *
 * A person cannot be in two places at once, so an overlap on any shared
 * weekday is a conflict — for the teacher or the student. Checked here rather
 * than only in the rules because the person booking needs to see *which*
 * class clashes, which a rules rejection cannot tell them.
 */
export function findConflicts(
  candidate: Pick<ClassInput, "teacherName" | "studentName" | "days" | "start" | "durationMin">,
  existing: readonly ClassDef[],
  ignoreId?: string,
): ClassDef[] {
  const startA = toMinutes(candidate.start);
  const endA = startA + candidate.durationMin;

  return existing.filter((c) => {
    if (c.id === ignoreId) return false;
    if (c.status !== "active") return false;

    const sharesPerson =
      c.teacherName === candidate.teacherName || c.studentName === candidate.studentName;
    if (!sharesPerson) return false;

    const sharesDay = c.days.some((d) => candidate.days.includes(d));
    if (!sharesDay) return false;

    const startB = toMinutes(c.start);
    const endB = startB + c.durationMin;
    // Touching end-to-start is fine; strict overlap is not.
    return startA < endB && startB < endA;
  });
}

/**
 * Sets the meeting room for one class.
 *
 * Separate from updateClass because the rules allow a teacher to change only
 * this field on their own class: sending the whole object would look like an
 * attempt to rewrite the timetable and be refused.
 */
export async function setClassMeetingLink(id: string, zoomUrl: string) {
  return updateDoc(doc(db, COLLECTION, id), { zoomUrl: zoomUrl.trim() });
}
