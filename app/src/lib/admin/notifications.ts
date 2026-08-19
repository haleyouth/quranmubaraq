/**
 * Notifications.
 *
 * Derived from live state rather than stored as a separate feed: unread
 * messages come from the message store, upcoming and unmarked classes from
 * the schedule engine, and operational alerts from the demo data. That way a
 * badge can never disagree with the screen it points at.
 *
 * Each role sees only what concerns it — a student is never told about
 * pending leave requests, and a teacher never sees arrears.
 */

import type { Role } from "./demo-auth";
import { loadMessages, threadId, contactsFor } from "./messages";
import {
  filterForRole,
  sessionsForDay,
  type ClassSession,
} from "./schedule";
import { complaints, invoices, leaveRequests } from "./demo-data";

export type NotificationKind =
  | "message"
  | "class"
  | "attendance"
  | "complaint"
  | "leave"
  | "finance";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  /** Minutes ago; lower sorts first. */
  minutesAgo: number;
  urgent?: boolean;
};

const READ_KEY = "qm_notifications_read_v1";

/** Ids the signed-in person has dismissed, kept per browser. */
export function readIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function persistRead(ids: Set<string>) {
  try {
    window.localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
    window.dispatchEvent(new CustomEvent("qm-notifications-changed"));
  } catch {
    /* storage unavailable */
  }
}

export function markRead(id: string) {
  const ids = readIds();
  ids.add(id);
  persistRead(ids);
}

export function markAllRead(all: Notification[]) {
  const ids = readIds();
  all.forEach((n) => ids.add(n.id));
  persistRead(ids);
}

export function subscribeNotifications(fn: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === READ_KEY || e.key === "qm_messages_v1") fn();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("qm-notifications-changed", fn);
  window.addEventListener("qm-messages-changed", fn);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("qm-notifications-changed", fn);
    window.removeEventListener("qm-messages-changed", fn);
  };
}

function minutesUntil(s: ClassSession, now: Date) {
  return Math.round((s.startsAt.getTime() - now.getTime()) / 60000);
}

/** Builds the feed for one person. */
export function buildNotifications(
  role: Role,
  name: string,
  now = new Date(),
): Notification[] {
  const out: Notification[] = [];

  /* ------------------------------ Messages ------------------------------ */
  const messages = loadMessages();
  const contacts = contactsFor(role, name);
  for (const c of contacts) {
    const id = threadId(name, c.name);
    const unread = messages.filter(
      (m) => m.threadId === id && !m.read && m.fromName !== name,
    );
    if (unread.length === 0) continue;

    const latest = unread.reduce((a, b) => (a.minutesAgo < b.minutesAgo ? a : b));
    out.push({
      id: `msg-${id}-${latest.id}`,
      kind: "message",
      title: `${unread.length} new message${unread.length === 1 ? "" : "s"} from ${c.name}`,
      body: latest.body,
      href: "/admin/messages",
      minutesAgo: latest.minutesAgo,
    });
  }

  /* ------------------------------- Classes ------------------------------ */
  const today = filterForRole(sessionsForDay(now, now), role, name);

  for (const s of today.filter((x) => x.status === "live")) {
    out.push({
      id: `live-${s.id}`,
      kind: "class",
      title: "Class in progress",
      body:
        role === "student"
          ? `${s.course} with ${s.teacherName} is live now.`
          : `${s.studentName} — ${s.course} is live now.`,
      href: role === "student" ? "/admin" : "/admin/today",
      minutesAgo: 0,
      urgent: true,
    });
  }

  for (const s of today.filter((x) => x.status === "scheduled")) {
    const mins = minutesUntil(s, now);
    if (mins < 0 || mins > 60) continue;
    out.push({
      id: `soon-${s.id}`,
      kind: "class",
      title: `Class in ${mins} minute${mins === 1 ? "" : "s"}`,
      body:
        role === "student"
          ? `${s.course} with ${s.teacherName} at ${s.start}.`
          : `${s.studentName} — ${s.course} at ${s.start}.`,
      href: role === "student" ? "/admin" : "/admin/today",
      minutesAgo: 0,
    });
  }

  // Teachers are nudged about classes they have not yet recorded
  if (role === "teacher") {
    const unmarked = today.filter(
      (s) => s.attendance === "pending" && s.status !== "scheduled" && s.status !== "live",
    );
    if (unmarked.length > 0) {
      out.push({
        id: `unmarked-${unmarked.length}-${unmarked[0].date}`,
        kind: "attendance",
        title: `${unmarked.length} class${unmarked.length === 1 ? "" : "es"} need an outcome`,
        body: "Mark whether the class was held and add a short comment.",
        href: "/admin/today",
        minutesAgo: 30,
      });
    }
  }

  /* ------------------------------ Staff only ---------------------------- */
  if (role === "admin" || role === "principal") {
    for (const c of complaints.filter(
      (x) => x.status === "escalated" || x.priority === "urgent",
    )) {
      out.push({
        id: `complaint-${c.id}`,
        kind: "complaint",
        title: `${c.priority === "urgent" ? "Urgent" : "Escalated"} complaint`,
        body: `${c.id} — ${c.subject}`,
        href: "/admin/complaints",
        minutesAgo: 45,
        urgent: true,
      });
    }

    const pending = leaveRequests.filter((l) => l.status === "pending");
    if (pending.length > 0) {
      out.push({
        id: `leave-pending-${pending.length}`,
        kind: "leave",
        title: `${pending.length} leave request${pending.length === 1 ? "" : "s"} awaiting approval`,
        body: `${pending.reduce((a, l) => a + l.affected, 0)} classes affected if approved.`,
        href: "/admin/leave",
        minutesAgo: 120,
      });
    }

    if (role === "admin") {
      const overdue = invoices.filter((i) => i.status === "overdue");
      if (overdue.length > 0) {
        out.push({
          id: `overdue-${overdue.length}`,
          kind: "finance",
          title: `${overdue.length} invoice${overdue.length === 1 ? "" : "s"} overdue`,
          body: `$${overdue.reduce((a, i) => a + Number(i.amount), 0).toFixed(2)} outstanding.`,
          href: "/admin/finance",
          minutesAgo: 240,
        });
      }
    }
  }

  /* ------------------------------- Student ------------------------------ */
  if (role === "student") {
    const due = invoices.filter((i) => i.status === "overdue" || i.status === "sent");
    if (due.length > 0) {
      out.push({
        id: `invoice-${due[0].id}`,
        kind: "finance",
        title: "Invoice due",
        body: `${due[0].id} for ${due[0].period} — ${due[0].currency} ${due[0].amount}.`,
        href: "/admin",
        minutesAgo: 300,
      });
    }
  }

  return out.sort((a, b) => a.minutesAgo - b.minutesAgo);
}

export function timeAgoShort(minutes: number): string {
  if (minutes < 1) return "now";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
