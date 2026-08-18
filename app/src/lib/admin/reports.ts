/**
 * Report definitions and generation.
 *
 * Reports are produced client-side as a branded, printable HTML document so
 * the demo is fully functional without a server. When the backend lands the
 * same definitions drive server-side PDF rendering.
 */

import { students, teachers, invoices, complaints, leaveRequests } from "./demo-data";
import { sessionsForRange, addDays, type ClassSession } from "./schedule";

export type ReportKey =
  | "attendance-summary"
  | "attendance-exceptions"
  | "student-progress"
  | "teacher-utilisation"
  | "revenue-collections"
  | "arrears"
  | "leave-cover"
  | "complaints-sla";

export type ReportDef = {
  key: ReportKey;
  name: string;
  description: string;
  category: "Operations" | "Academic" | "Staff" | "Finance" | "Quality";
  /** Reports a student or parent may request for themselves. */
  studentVisible: boolean;
};

export const REPORTS: readonly ReportDef[] = [
  { key: "attendance-summary", name: "Attendance Summary", description: "Attendance rates by student, teacher and course.", category: "Operations", studentVisible: true },
  { key: "attendance-exceptions", name: "Attendance Exceptions", description: "No-shows, chronic absence and unexplained gaps.", category: "Operations", studentVisible: false },
  { key: "student-progress", name: "Student Progress Report", description: "Classes held, attendance, teacher comments and ratings.", category: "Academic", studentVisible: true },
  { key: "teacher-utilisation", name: "Teacher Utilisation", description: "Hours taught against capacity, per teacher.", category: "Staff", studentVisible: false },
  { key: "revenue-collections", name: "Revenue & Collections", description: "Invoiced, collected and outstanding by period.", category: "Finance", studentVisible: false },
  { key: "arrears", name: "Ageing & Arrears", description: "Outstanding balances bucketed by age.", category: "Finance", studentVisible: false },
  { key: "leave-cover", name: "Leave & Cover", description: "Leave taken by type, and substitute cover rate.", category: "Staff", studentVisible: false },
  { key: "complaints-sla", name: "Complaints & SLA", description: "Volume by category with resolution times.", category: "Quality", studentVisible: false },
] as const;

export type ReportRow = Record<string, string | number>;
export type ReportData = {
  title: string;
  subtitle: string;
  columns: readonly string[];
  rows: ReportRow[];
  summary: readonly { label: string; value: string }[];
};

/* -------------------------------------------------------------------------- */

function pct(n: number, d: number) {
  return d === 0 ? "0%" : `${Math.round((n / d) * 100)}%`;
}

/** Builds report data over a date window, optionally scoped to one student. */
export function buildReport(
  key: ReportKey,
  opts: { from: Date; to: Date; studentName?: string } ,
): ReportData {
  const { from, to, studentName } = opts;
  const range = `${from.toLocaleDateString("en-GB")} – ${to.toLocaleDateString("en-GB")}`;

  let sessions: ClassSession[] = sessionsForRange(from, to);
  if (studentName) sessions = sessions.filter((s) => s.studentName === studentName);

  const past = sessions.filter((s) => s.status !== "scheduled");
  const held = past.filter((s) => s.status === "completed");
  const missed = past.filter((s) => s.status.startsWith("missed"));

  switch (key) {
    case "attendance-summary": {
      const names = studentName
        ? [studentName]
        : Array.from(new Set(sessions.map((s) => s.studentName)));

      const rows = names.map((n) => {
        const mine = past.filter((s) => s.studentName === n);
        const present = mine.filter((s) => s.attendance === "present").length;
        const late = mine.filter((s) => s.attendance === "late").length;
        const absent = mine.filter((s) => s.attendance === "absent").length;
        return {
          Student: n,
          Scheduled: mine.length,
          Present: present,
          Late: late,
          Absent: absent,
          Rate: pct(present + late, mine.length),
        };
      });

      return {
        title: "Attendance Summary",
        subtitle: range,
        columns: ["Student", "Scheduled", "Present", "Late", "Absent", "Rate"],
        rows,
        summary: [
          { label: "Sessions", value: String(past.length) },
          { label: "Held", value: String(held.length) },
          { label: "Missed", value: String(missed.length) },
          { label: "Attendance rate", value: pct(held.length, past.length) },
        ],
      };
    }

    case "attendance-exceptions": {
      const rows = missed.map((s) => ({
        Date: s.date,
        Time: s.start,
        Student: s.studentName,
        Teacher: s.teacherName,
        Course: s.course,
        Reason: s.note ?? "—",
      }));
      return {
        title: "Attendance Exceptions",
        subtitle: range,
        columns: ["Date", "Time", "Student", "Teacher", "Course", "Reason"],
        rows,
        summary: [
          { label: "Exceptions", value: String(rows.length) },
          { label: "Of sessions", value: pct(missed.length, past.length) },
        ],
      };
    }

    case "student-progress": {
      const rows = held
        .filter((s) => !studentName || s.studentName === studentName)
        .map((s) => ({
          Date: s.date,
          Course: s.course,
          Teacher: s.teacherName,
          Attendance: s.attendance,
          Rating: s.rating ? `${s.rating}/5` : "—",
          Comment: s.note ?? "—",
        }));

      const rated = held.filter((s) => s.rating);
      const avg = rated.length
        ? (rated.reduce((a, s) => a + (s.rating ?? 0), 0) / rated.length).toFixed(1)
        : "—";

      return {
        title: "Student Progress Report",
        subtitle: `${studentName ?? "All students"} · ${range}`,
        columns: ["Date", "Course", "Teacher", "Attendance", "Rating", "Comment"],
        rows,
        summary: [
          { label: "Classes held", value: String(held.length) },
          { label: "Missed", value: String(missed.length) },
          { label: "Attendance", value: pct(held.length, past.length) },
          { label: "Average rating", value: `${avg}${avg === "—" ? "" : " / 5"}` },
        ],
      };
    }

    case "teacher-utilisation": {
      const rows = teachers.map((t) => {
        const mine = past.filter((s) => s.teacherName === t.name);
        return {
          Teacher: t.name,
          Students: t.students,
          "Weekly hours": `${t.load}h / 30h`,
          Utilisation: pct(t.load, 30),
          "Sessions in period": mine.length,
          Rating: t.rating,
          Status: t.status,
        };
      });
      return {
        title: "Teacher Utilisation",
        subtitle: range,
        columns: ["Teacher", "Students", "Weekly hours", "Utilisation", "Sessions in period", "Rating", "Status"],
        rows,
        summary: [
          { label: "Teachers", value: String(teachers.length) },
          { label: "Active", value: String(teachers.filter((t) => t.status === "active").length) },
          { label: "Total weekly hours", value: `${teachers.reduce((a, t) => a + t.load, 0)}h` },
        ],
      };
    }

    case "revenue-collections": {
      const rows = invoices.map((i) => ({
        Invoice: i.id, Student: i.student, Period: i.period,
        Amount: `${i.currency} ${i.amount}`, Due: i.due, Status: i.status, Method: i.method,
      }));
      const paid = invoices.filter((i) => i.status === "paid");
      const total = invoices.reduce((a, i) => a + Number(i.amount), 0);
      const collected = paid.reduce((a, i) => a + Number(i.amount), 0);
      return {
        title: "Revenue & Collections",
        subtitle: range,
        columns: ["Invoice", "Student", "Period", "Amount", "Due", "Status", "Method"],
        rows,
        summary: [
          { label: "Invoiced", value: `$${total.toFixed(2)}` },
          { label: "Collected", value: `$${collected.toFixed(2)}` },
          { label: "Outstanding", value: `$${(total - collected).toFixed(2)}` },
          { label: "Collection rate", value: pct(collected, total) },
        ],
      };
    }

    case "arrears": {
      const overdue = invoices.filter((i) => i.status === "overdue");
      const rows = overdue.map((i) => ({
        Invoice: i.id, Student: i.student, Amount: `${i.currency} ${i.amount}`,
        Due: i.due, "Days overdue": Math.max(0, Math.round((Date.now() - new Date(i.due).getTime()) / 86400000)),
      }));
      return {
        title: "Ageing & Arrears",
        subtitle: range,
        columns: ["Invoice", "Student", "Amount", "Due", "Days overdue"],
        rows,
        summary: [
          { label: "Overdue invoices", value: String(overdue.length) },
          { label: "Total overdue", value: `$${overdue.reduce((a, i) => a + Number(i.amount), 0).toFixed(2)}` },
        ],
      };
    }

    case "leave-cover": {
      const rows = leaveRequests.map((l) => ({
        Ref: l.id, Teacher: l.teacher, Type: l.type,
        From: l.from, To: l.to, Days: l.days,
        "Classes affected": l.affected, Cover: l.cover, Status: l.status,
      }));
      const approved = leaveRequests.filter((l) => l.status === "approved");
      const covered = approved.filter((l) => !l.cover.toLowerCase().includes("not"));
      return {
        title: "Leave & Cover",
        subtitle: range,
        columns: ["Ref", "Teacher", "Type", "From", "To", "Days", "Classes affected", "Cover", "Status"],
        rows,
        summary: [
          { label: "Requests", value: String(leaveRequests.length) },
          { label: "Approved", value: String(approved.length) },
          { label: "Cover rate", value: pct(covered.length, approved.length) },
        ],
      };
    }

    case "complaints-sla": {
      const rows = complaints.map((c) => ({
        Ticket: c.id, Subject: c.subject, Category: c.category,
        "Raised by": c.raisedBy, Priority: c.priority, Status: c.status,
        SLA: c.sla, Assignee: c.assignee,
      }));
      const resolved = complaints.filter((c) => c.status === "resolved");
      return {
        title: "Complaints & SLA",
        subtitle: range,
        columns: ["Ticket", "Subject", "Category", "Raised by", "Priority", "Status", "SLA", "Assignee"],
        rows,
        summary: [
          { label: "Total", value: String(complaints.length) },
          { label: "Resolved", value: String(resolved.length) },
          { label: "Resolution rate", value: pct(resolved.length, complaints.length) },
        ],
      };
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

export function toCsv(data: ReportData): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    data.columns.join(","),
    ...data.rows.map((r) => data.columns.map((c) => esc(r[c] ?? "")).join(",")),
  ].join("\n");
}

export function downloadCsv(data: ReportData, filename: string) {
  const blob = new Blob([toCsv(data)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Student progress covering the last 30 days, used by the student portal. */
export function studentProgressReport(studentName: string) {
  const to = new Date();
  const from = addDays(to, -30);
  return buildReport("student-progress", { from, to, studentName });
}

export { students };
