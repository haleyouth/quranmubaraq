"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Video } from "lucide-react";
import { getSession, type Session } from "@/lib/admin/demo-auth";
import {
  filterForRole, sessionsForDay, STATUS_LABEL,
  type Attendance, type ClassSession, type SessionStatus,
} from "@/lib/admin/schedule";
import {
  AdminButton, AdminPage, Badge, Field, Panel, StatTile,
  StatusBadge, Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";
import { JoinClassDialog } from "@/components/admin/JoinClassDialog";

const FILTERS = ["all", "live", "scheduled", "completed", "missed"] as const;

/** Short, structured comments so teachers can log an outcome in one tap. */
const QUICK_NOTES = [
  "Excellent focus, completed the full sabaq.",
  "Good progress, minor Tajweed corrections.",
  "Needs more revision before next class.",
  "Joined late but caught up well.",
  "Homework was incomplete.",
  "Student did not join.",
];

export default function TodayPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [rows, setRows] = useState<ClassSession[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [toast, setToast] = useState("");
  const [joining, setJoining] = useState<ClassSession | null>(null);
  const [outcome, setOutcome] = useState<ClassSession | null>(null);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    const all = sessionsForDay(new Date());
    setRows(s ? filterForRole(all, s.role, s.name) : all);
  }, []);

  const shown = useMemo(
    () =>
      rows.filter((s) => {
        if (filter === "all") return true;
        if (filter === "missed") return s.status.startsWith("missed");
        return s.status === filter;
      }),
    [rows, filter],
  );

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 3500);
  }

  /** Records the class outcome: held or missed, plus a short comment. */
  function record(
    id: string,
    status: SessionStatus,
    attendance: Attendance,
    note: string,
    rating?: number,
  ) {
    setRows((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, attendance, note, rating } : s)),
    );
    flash(
      status === "completed"
        ? "Class marked as held, comment saved."
        : "Class marked as missed, comment saved.",
    );
  }

  const counts = {
    live: rows.filter((s) => s.status === "live").length,
    scheduled: rows.filter((s) => s.status === "scheduled").length,
    completed: rows.filter((s) => s.status === "completed").length,
    missed: rows.filter((s) => s.status.startsWith("missed")).length,
  };

  const isTeacher = session?.role === "teacher";
  const canRecord = isTeacher || session?.role === "admin" || session?.role === "principal";

  return (
    <AdminPage
      title="Today's Classes"
      description={
        isTeacher
          ? "Your classes today. Mark each as held or missed with a short comment."
          : "Live operational board — every session scheduled today."
      }
    >

      {toast && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Live now" value={String(counts.live)} delta="In progress" />
        <StatTile label="Upcoming" value={String(counts.scheduled)} delta="Later today" />
        <StatTile label="Held" value={String(counts.completed)} delta="Recorded" trend="up" />
        <StatTile label="Missed" value={String(counts.missed)} delta="Needs follow-up" trend={counts.missed ? "down" : "flat"} />
      </div>

      <Panel bodyClassName="p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter sessions">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`min-h-9 cursor-pointer rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold capitalize transition-colors ${
                filter === f ? "bg-green-deep text-white" : "bg-white text-ink hover:bg-cream-deep"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title={`${shown.length} sessions`} bodyClassName="p-0">
        <Table
          head={["Time", "Student", "Teacher", "Course", "Status", "Attendance", "Comment", "Actions"]}
          empty={shown.length === 0}
        >
          {shown.map((s) => (
            <Tr key={s.id}>
              <Td label="Time" className="font-display text-base whitespace-nowrap">
                {s.start}–{s.end}
              </Td>
              <Td label="Student" className="font-semibold">{s.studentName}</Td>
              <Td label="Teacher" className="text-ink/70">{s.teacherName}</Td>
              <Td label="Course" className="text-ink/70">{s.course}</Td>
              <Td label="Status">
                <Badge
                  tone={
                    s.status === "live" ? "danger"
                    : s.status === "completed" ? "green"
                    : s.status.startsWith("missed") ? "gold"
                    : s.status === "cancelled" ? "sage"
                    : "neutral"
                  }
                >
                  {STATUS_LABEL[s.status]}
                </Badge>
              </Td>
              <Td label="Attendance"><StatusBadge status={s.attendance} /></Td>
              <Td label="Comment" className="max-w-[220px]">
                {s.note ? (
                  <span className="text-xs text-ink/70">
                    &ldquo;{s.note}&rdquo;
                    {s.rating ? <strong className="ml-1 text-green-deep">{s.rating}/5</strong> : null}
                  </span>
                ) : (
                  <span className="text-xs text-ink/35">—</span>
                )}
              </Td>
              <Td label="Actions">
                <div className="flex flex-wrap gap-1.5">
                  {(s.status === "live" || s.status === "scheduled") && (
                    <AdminButton
                      size="sm"
                      variant={s.status === "live" ? "primary" : "outline"}
                      onClick={() => setJoining(s)}
                    >
                      <Video className="size-3.5" aria-hidden="true" />
                      Join
                    </AdminButton>
                  )}
                  {canRecord && s.status !== "scheduled" && (
                    <AdminButton size="sm" variant="outline" onClick={() => setOutcome(s)}>
                      {s.note ? "Edit outcome" : "Record outcome"}
                    </AdminButton>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      {!isTeacher && (
        <Panel title="Online class settings" description="Defaults applied to every Zoom meeting created by the scheduler.">
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              ["Auto-create Zoom meeting", "Enabled"],
              ["Waiting room", "Enabled"],
              ["Passcode required", "Enabled"],
              ["Join before host", "Disabled"],
              ["Mute participants on entry", "Enabled"],
              ["Auto-record to cloud", "Enabled"],
              ["Join window", "10 minutes before start"],
              ["Auto-attendance threshold", "70% of session duration"],
              ["Recording retention", "90 days"],
            ].map(([label, value]) => (
              <li key={label} className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink/12 bg-cream px-4 py-3">
                <span className="text-sm font-semibold text-ink">{label}</span>
                <span className="text-sm text-ink/65">{value}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <JoinClassDialog session={joining} onClose={() => setJoining(null)} />

      <OutcomeDialog
        session={outcome}
        onClose={() => setOutcome(null)}
        onSave={record}
      />
    </AdminPage>
  );
}

/* -------------------------------------------------------------------------- */

function OutcomeDialog({
  session,
  onClose,
  onSave,
}: {
  session: ClassSession | null;
  onClose: () => void;
  onSave: (
    id: string,
    status: SessionStatus,
    attendance: Attendance,
    note: string,
    rating?: number,
  ) => void;
}) {
  const [held, setHeld] = useState(true);
  const [attendance, setAttendance] = useState<Attendance>("present");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(4);

  useEffect(() => {
    if (!session) return;
    const wasHeld = session.status === "completed";
    setHeld(wasHeld);
    setAttendance(session.attendance === "pending" ? "present" : session.attendance);
    setNote(session.note ?? "");
    setRating(session.rating ?? 4);
  }, [session]);

  if (!session) return null;

  function submit() {
    if (!session) return;
    onSave(
      session.id,
      held ? "completed" : "missed-student",
      held ? attendance : "absent",
      note.trim() || (held ? "Class held." : "Class missed."),
      held ? rating : undefined,
    );
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Record class outcome"
      description={`${session.course} · ${session.studentName} · ${session.start}–${session.end}`}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton onClick={submit}>Save outcome</AdminButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Was the class held?">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHeld(true)}
              aria-pressed={held}
              className={`min-h-11 flex-1 cursor-pointer rounded-xl border-2 border-ink px-4 py-2 font-bold transition-colors ${
                held ? "bg-green text-white" : "bg-white text-ink hover:bg-cream-deep"
              }`}
            >
              Class held
            </button>
            <button
              type="button"
              onClick={() => setHeld(false)}
              aria-pressed={!held}
              className={`min-h-11 flex-1 cursor-pointer rounded-xl border-2 border-ink px-4 py-2 font-bold transition-colors ${
                !held ? "bg-gold text-ink" : "bg-white text-ink hover:bg-cream-deep"
              }`}
            >
              Class missed
            </button>
          </div>
        </Field>

        {held && (
          <>
            <Field label="Student attendance">
              <div className="flex flex-wrap gap-2">
                {(["present", "late", "excused"] as Attendance[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAttendance(a)}
                    aria-pressed={attendance === a}
                    className={`min-h-9 cursor-pointer rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold capitalize transition-colors ${
                      attendance === a ? "bg-green-deep text-white" : "bg-white text-ink hover:bg-cream-deep"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={`Performance rating — ${rating}/5`}>
              <input
                type="range"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-green-deep"
                aria-label="Performance rating out of 5"
              />
            </Field>
          </>
        )}

        <Field label="Short comment" hint="Keep it brief — parents can see this.">
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={160}
            className={inputClass}
            placeholder="e.g. Excellent focus, completed the full sabaq."
          />
        </Field>

        <div>
          <p className="mb-2 text-xs font-bold tracking-wider text-ink/55 uppercase">
            Quick comments
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_NOTES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setNote(q)}
                className="cursor-pointer rounded-full border-2 border-ink/20 bg-cream px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-ink hover:bg-cream-deep"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
