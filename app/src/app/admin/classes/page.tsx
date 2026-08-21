"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, CheckCircle2, Link2, Pencil, Plus, Trash2, Users, Video,
} from "lucide-react";
import { teachers as demoTeachers } from "@/lib/admin/demo-data";
import { WEEKDAY_LABEL, type ClassDef, type Weekday } from "@/lib/admin/schedule";
import {
  createClass, deleteClass, findConflicts, setClassMeetingLink, updateClass,
  type ClassInput,
} from "@/lib/admin/classes-live";
import { useClasses } from "@/lib/admin/use-classes";
import { listUsers, setMyMeetingUrl, type DirectoryUser } from "@/lib/admin/auth";
import { useSession } from "@/lib/admin/session-context";
import { courses } from "@/lib/content";
import {
  AdminButton, AdminPage, Badge, Field, Panel, StatTile,
  Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { ConfirmModal, Modal } from "@/components/admin/Modal";

/** Monday-first, matching the weekday numbers used by the schedule engine. */
const DAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

const DURATIONS = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1½ hours" },
];

type Draft = {
  studentName: string;
  teacherName: string;
  course: string;
  days: Weekday[];
  start: string;
  durationMin: number;
  zoomUrl: string;
};

const EMPTY_DRAFT: Draft = {
  studentName: "",
  teacherName: "",
  course: courses[0]?.title ?? "Quran Reading",
  days: [1, 3, 5],
  start: "09:00",
  durationMin: 30,
  zoomUrl: "",
};

function friendly(err: unknown, fallback: string) {
  const code = (err as { code?: string })?.code ?? "";
  if (code === "permission-denied")
    return "Only Admin and Principal accounts may set the timetable.";
  return (err as Error)?.message || fallback;
}

export default function ClassesPage() {
  const { session } = useSession();
  const { defs, ready, isDemo } = useClasses();

  const [people, setPeople] = useState<DirectoryUser[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClassDef | null>(null);
  const [removing, setRemoving] = useState<ClassDef | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [peopleError, setPeopleError] = useState("");
  const [toast, setToast] = useState("");
  const [linkFor, setLinkFor] = useState<ClassDef | null>(null);
  const [linkDraft, setLinkDraft] = useState("");
  const [myRoom, setMyRoom] = useState("");
  const [roomSaved, setRoomSaved] = useState(false);

  const canManage = session?.role === "admin" || session?.role === "principal";
  const isTeacher = session?.role === "teacher";
  /** Teachers host their own classes; principals host meetings of their own. */
  const hasOwnRoom = isTeacher || session?.role === "principal";

  // Seed the personal-room field from the profile once it resolves.
  useEffect(() => {
    setMyRoom(session?.meetingUrl ?? "");
  }, [session?.uid, session?.meetingUrl]);

  /** A teacher may set the link on their own class; staff on any class. */
  const mayEditLink = (c: ClassDef) =>
    canManage || (isTeacher && c.teacherName === session?.name);

  async function saveMyRoom() {
    if (!session?.uid) return;
    try {
      await setMyMeetingUrl(session.uid, myRoom);
      setRoomSaved(true);
      window.setTimeout(() => setRoomSaved(false), 3000);
      flash("Your meeting room was saved.");
    } catch (err) {
      flash(friendly(err, "Could not save your meeting room."));
    }
  }

  async function saveClassLink() {
    if (!linkFor) return;
    try {
      await setClassMeetingLink(linkFor.id, linkDraft);
      flash(`Meeting link updated for ${linkFor.studentName}.`);
      setLinkFor(null);
    } catch (err) {
      flash(friendly(err, "Could not save the meeting link."));
    }
  }

  /*
   * Real portal accounts are who a class can be booked between.
   *
   * Keyed on the uid, not the session object: the auth listener hands back a
   * fresh object on every callback, so depending on `session` re-ran this
   * fetch in a loop and the dropdowns could be left empty mid-flight.
   */
  useEffect(() => {
    if (!session?.uid) return;
    let cancelled = false;
    listUsers()
      .then((list) => {
        if (!cancelled) {
          setPeople(list);
          setPeopleError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setPeopleError(friendly(err, "Could not load accounts."));
      });
    return () => {
      cancelled = true;
    };
  }, [session?.uid]);

  const teacherOptions = useMemo(
    () => people.filter((p) => p.role === "teacher"),
    [people],
  );
  const studentOptions = useMemo(
    () => people.filter((p) => p.role === "student"),
    [people],
  );

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 4500);
  }

  /** Classes relevant to whoever is signed in. */
  const mine = useMemo(
    () =>
      defs.filter((c) => {
        if (c.status !== "active") return false;
        if (!session) return true;
        if (session.role === "teacher") return c.teacherName === session.name;
        if (session.role === "student") return c.studentName === session.name;
        return true;
      }),
    [defs, session],
  );

  /**
   * Real weekly grid, built from the class definitions rather than a formula.
   * Rows are only the times that actually have a class, so the table shows
   * exactly what is scheduled and nothing invented.
   */
  const grid = useMemo(() => {
    const slots = Array.from(new Set(mine.map((c) => c.start))).sort();
    return slots.map((slot) => ({
      slot,
      cells: DAY_ORDER.map((dow) =>
        mine.filter((c) => c.start === slot && c.days.includes(dow)),
      ),
    }));
  }, [mine]);

  /** Live conflicts for the current draft, shown before saving. */
  const conflicts = useMemo(() => {
    if (!draft.studentName || !draft.teacherName || draft.days.length === 0) return [];
    return findConflicts(
      {
        teacherName: draft.teacherName,
        studentName: draft.studentName,
        days: draft.days,
        start: draft.start,
        durationMin: draft.durationMin,
      },
      isDemo ? [] : defs,
      editing?.id,
    );
  }, [draft, defs, isDemo, editing]);

  const stats = useMemo(() => {
    const active = defs.filter((c) => c.status === "active");
    const weeklyHours = active.reduce(
      (sum, c) => sum + (c.days.length * c.durationMin) / 60,
      0,
    );
    return {
      active: active.length,
      students: new Set(active.map((c) => c.studentName)).size,
      teachers: new Set(active.map((c) => c.teacherName)).size,
      hours: Math.round(weeklyHours),
    };
  }, [defs]);

  function openCreate() {
    setDraft({
      ...EMPTY_DRAFT,
      teacherName: teacherOptions[0]?.name ?? "",
      studentName: studentOptions[0]?.name ?? "",
    });
    setFormError("");
    setEditing(null);
    setOpen(true);
  }

  function openEdit(c: ClassDef) {
    setDraft({
      studentName: c.studentName,
      teacherName: c.teacherName,
      course: c.course,
      days: [...c.days],
      start: c.start,
      durationMin: c.durationMin,
      zoomUrl: c.zoomUrl ?? "",
    });
    setFormError("");
    setEditing(c);
    setOpen(true);
  }

  async function save() {
    if (!session) return;
    setFormError("");

    if (!draft.studentName || !draft.teacherName) {
      setFormError("Choose both a teacher and a student.");
      return;
    }
    if (draft.days.length === 0) {
      setFormError("Pick at least one day for the class to repeat on.");
      return;
    }
    if (conflicts.length > 0) {
      setFormError(
        `That slot clashes with ${conflicts.length} existing class${
          conflicts.length === 1 ? "" : "es"
        }. Adjust the time or day.`,
      );
      return;
    }

    // Carry roster ids across when the person also exists in the demo roster,
    // so older views that key off ids keep working.
    const payload: ClassInput = {
      studentName: draft.studentName,
      teacherName: draft.teacherName,
      course: draft.course,
      days: draft.days,
      start: draft.start,
      durationMin: draft.durationMin,
      zoomUrl: draft.zoomUrl,
      studentId: people.find((p) => p.name === draft.studentName)?.uid,
      teacherId: people.find((p) => p.name === draft.teacherName)?.uid,
    };

    setBusy(true);
    try {
      if (editing) {
        await updateClass(editing.id, payload);
        flash(`Updated ${draft.studentName}'s ${draft.course} class.`);
      } else {
        await createClass(payload, session.name);
        flash(
          `${draft.course} scheduled for ${draft.studentName} with ${draft.teacherName}.`,
        );
      }
      setOpen(false);
      setEditing(null);
    } catch (err) {
      setFormError(friendly(err, "Could not save the class."));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!removing) return;
    try {
      await deleteClass(removing.id);
      flash(`Removed ${removing.studentName}'s ${removing.course} class.`);
    } catch (err) {
      flash(friendly(err, "Could not remove the class."));
    }
  }

  function toggleDay(d: Weekday) {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.includes(d)
        ? prev.days.filter((x) => x !== d)
        : [...prev.days, d].sort(),
    }));
  }

  return (
    <AdminPage
      title="Classes"
      description="Recurring class schedules, teacher assignment and conflict checking."
      actions={
        canManage && (
          <AdminButton onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Schedule class
          </AdminButton>
        )
      }
    >
      {toast && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {toast}
        </p>
      )}

      {ready && isDemo && (
        <p className="flex items-start gap-2 rounded-xl border-2 border-ink bg-gold px-4 py-2.5 text-sm text-ink">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <strong>Sample timetable.</strong> No classes have been scheduled yet,
            so the grid below shows example data.{" "}
            {canManage
              ? "Schedule a class and it replaces this entirely."
              : "Ask administration to set your schedule."}
          </span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        <StatTile label="Active classes" value={String(stats.active)} delta={isDemo ? "Sample data" : "Scheduled"} />
        <StatTile label="Students booked" value={String(stats.students)} delta="With a timetable" />
        <StatTile label="Teachers assigned" value={String(stats.teachers)} delta="Currently teaching" />
        <StatTile label="Weekly hours" value={`${stats.hours}h`} delta="Across all classes" />
      </div>

      {hasOwnRoom && (
        <Panel
          title="Your meeting room"
          description="Used as the default link for classes you host. Students click it from their portal when class is due."
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Zoom or Meet link">
                <input
                  value={myRoom}
                  onChange={(e) => setMyRoom(e.target.value)}
                  placeholder="https://zoom.us/j/1234567890"
                  className={inputClass}
                />
              </Field>
            </div>
            <AdminButton onClick={() => void saveMyRoom()}>
              {roomSaved ? "Saved" : "Save room"}
            </AdminButton>
          </div>
        </Panel>
      )}

      <Panel
        title="Weekly schedule"
        description="All times shown in your local timezone. Grey cells are free."
      >
        {grid.length === 0 ? (
          <p className="py-8 text-center text-ink/60">
            No classes scheduled yet.
            {canManage ? " Use “Schedule class” to add the first one." : ""}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-bold text-ink/55 uppercase">
                    Time
                  </th>
                  {DAY_ORDER.map((d) => (
                    <th key={d} scope="col" className="px-2 py-2 text-center text-xs font-bold text-ink/55 uppercase">
                      {WEEKDAY_LABEL[d]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.map(({ slot, cells }) => (
                  <tr key={slot}>
                    <th scope="row" className="px-2 py-1.5 text-left font-display text-sm text-ink">
                      {slot}
                    </th>
                    {cells.map((classesHere, i) => (
                      <td key={i} className="p-1 align-top">
                        {classesHere.length > 0 ? (
                          <div className="space-y-1">
                            {classesHere.map((c) => (
                              <div
                                key={c.id}
                                className="rounded-lg border-2 border-ink bg-green px-2 py-1.5 text-xs text-white"
                                title={`${c.studentName} — ${c.course} with ${c.teacherName}, ${c.durationMin} min`}
                              >
                                <p className="truncate font-bold">{c.studentName}</p>
                                <p className="truncate opacity-85">
                                  {c.course.replace("Quran ", "")}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-lg border-2 border-dashed border-ink/20 px-2 py-1.5 text-center text-xs text-ink/35">
                            Free
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* The bookings themselves, editable by staff. */}
      <Panel
        title={`${mine.length} scheduled class${mine.length === 1 ? "" : "es"}`}
        bodyClassName="p-0"
      >
        <Table
          head={
            canManage
              ? ["Student", "Teacher", "Course", "Days", "Time", "Meeting", "Actions"]
              : ["Student", "Teacher", "Course", "Days", "Time", "Meeting"]
          }
          empty={mine.length === 0}
        >
          {mine.map((c) => (
            <Tr key={c.id}>
              <Td label="Student" className="font-semibold">{c.studentName}</Td>
              <Td label="Teacher" className="text-ink/80">{c.teacherName}</Td>
              <Td label="Course">{c.course}</Td>
              <Td label="Days">
                <div className="flex flex-wrap gap-1">
                  {[...c.days].sort((a, b) =>
                    DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b),
                  ).map((d) => (
                    <Badge key={d} tone="sage">{WEEKDAY_LABEL[d]}</Badge>
                  ))}
                </div>
              </Td>
              <Td label="Time">
                {c.start} · {c.durationMin} min
              </Td>
              <Td label="Meeting">
                <div className="flex flex-wrap items-center gap-2">
                  {c.zoomUrl ? (
                    <a
                      href={c.zoomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-green-deep underline decoration-2 underline-offset-4 sm:min-h-0"
                    >
                      <Video className="size-3.5" aria-hidden="true" />
                      Join
                    </a>
                  ) : (
                    <span className="text-xs text-ink/45">No link yet</span>
                  )}
                  {mayEditLink(c) && !isDemo && (
                    <AdminButton
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setLinkDraft(c.zoomUrl || myRoom);
                        setLinkFor(c);
                      }}
                    >
                      <Link2 className="size-3.5" aria-hidden="true" />
                      {c.zoomUrl ? "Change" : "Add link"}
                    </AdminButton>
                  )}
                </div>
              </Td>
              {canManage && (
                <Td label="Actions">
                  <div className="flex flex-wrap gap-2">
                    <AdminButton
                      size="sm"
                      variant="outline"
                      disabled={isDemo}
                      title={isDemo ? "Sample class — schedule a real one first" : undefined}
                      onClick={() => openEdit(c)}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </AdminButton>
                    <AdminButton
                      size="sm"
                      variant="danger"
                      disabled={isDemo}
                      title={isDemo ? "Sample class — nothing to remove" : undefined}
                      onClick={() => setRemoving(c)}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Remove
                    </AdminButton>
                  </div>
                </Td>
              )}
            </Tr>
          ))}
        </Table>
      </Panel>

      <Panel title="Teacher utilisation" bodyClassName="p-0">
        <Table head={["Teacher", "Classes", "Weekly hours", "Load", "Students"]}>
          {(teacherOptions.length ? teacherOptions.map((t) => t.name) : demoTeachers.map((t) => t.name))
            .map((name) => {
              const theirs = defs.filter(
                (c) => c.teacherName === name && c.status === "active",
              );
              const hours =
                theirs.reduce((sum, c) => sum + (c.days.length * c.durationMin) / 60, 0);
              const pct = Math.min(100, Math.round((hours / 30) * 100));
              return (
                <Tr key={name}>
                  <Td label="Teacher" className="font-semibold">{name}</Td>
                  <Td label="Classes">{theirs.length}</Td>
                  <Td label="Weekly hours">{hours.toFixed(1)}h / 30h</Td>
                  <Td label="Load">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full border border-ink bg-cream">
                        <div
                          className={pct > 85 ? "h-full bg-gold" : "h-full bg-green"}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold">{pct}%</span>
                    </div>
                  </Td>
                  <Td label="Students">
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set(theirs.map((c) => c.studentName))).map((s) => (
                        <Badge key={s} tone="teal">{s}</Badge>
                      ))}
                    </div>
                  </Td>
                </Tr>
              );
            })}
        </Table>
      </Panel>

      {/* ---------------------------- Schedule form --------------------------- */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit class" : "Schedule a class"}
        description="Pairs a teacher with a student on a recurring weekly slot."
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton onClick={() => void save()} disabled={busy || conflicts.length > 0}>
              {busy ? "Saving…" : editing ? "Save changes" : "Schedule class"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          {peopleError && (
            <p
              role="alert"
              className="rounded-xl border-2 border-red-700 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
            >
              {peopleError}
            </p>
          )}

          <Field
            label="Teacher"
            hint={
              teacherOptions.length
                ? undefined
                : "No teacher accounts yet — create one in Portal Accounts first."
            }
          >
            <select
              value={draft.teacherName}
              onChange={(e) => setDraft({ ...draft, teacherName: e.target.value })}
              className={inputClass}
            >
              <option value="">Select a teacher…</option>
              {teacherOptions.map((t) => (
                <option key={t.uid} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Student"
            hint={
              studentOptions.length
                ? undefined
                : "No student accounts yet — create one in Portal Accounts first."
            }
          >
            <select
              value={draft.studentName}
              onChange={(e) => setDraft({ ...draft, studentName: e.target.value })}
              className={inputClass}
            >
              <option value="">Select a student…</option>
              {studentOptions.map((s) => (
                <option key={s.uid} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Course">
            <select
              value={draft.course}
              onChange={(e) => setDraft({ ...draft, course: e.target.value })}
              className={inputClass}
            >
              {courses.map((c) => (
                <option key={c.slug} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Repeats on">
            <div className="flex flex-wrap gap-2">
              {DAY_ORDER.map((dow) => {
                const on = draft.days.includes(dow);
                return (
                  <button
                    key={dow}
                    type="button"
                    onClick={() => toggleDay(dow)}
                    aria-pressed={on}
                    className={`min-h-11 cursor-pointer rounded-full border-2 border-ink px-3.5 py-1.5 text-sm font-bold transition-colors sm:min-h-9 ${
                      on ? "bg-green text-white" : "bg-white text-ink"
                    }`}
                  >
                    {WEEKDAY_LABEL[dow]}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start time">
              <input
                type="time"
                value={draft.start}
                onChange={(e) => setDraft({ ...draft, start: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Duration">
              <select
                value={draft.durationMin}
                onChange={(e) =>
                  setDraft({ ...draft, durationMin: Number(e.target.value) })
                }
                className={inputClass}
              >
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Meeting link" hint="Optional. Paste the Zoom or Meet room.">
            <input
              value={draft.zoomUrl}
              onChange={(e) => setDraft({ ...draft, zoomUrl: e.target.value })}
              placeholder="https://zoom.us/j/…"
              className={inputClass}
            />
          </Field>

          {conflicts.length > 0 && (
            <div
              role="alert"
              className="rounded-xl border-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <p className="flex items-center gap-2 font-bold">
                <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
                Time clash
              </p>
              <ul className="mt-2 space-y-1">
                {conflicts.map((c) => (
                  <li key={c.id}>
                    {c.teacherName === draft.teacherName ? c.teacherName : c.studentName} already
                    has {c.course} at {c.start} for {c.durationMin} min.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {formError && (
            <p
              role="alert"
              className="rounded-xl border-2 border-red-700 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
            >
              {formError}
            </p>
          )}

          <p className="flex items-start gap-2 rounded-xl border-2 border-ink/15 bg-cream p-3 text-sm text-ink/70">
            <Video className="mt-0.5 size-4 shrink-0 text-green" aria-hidden="true" />
            The class appears immediately in the teacher&rsquo;s and student&rsquo;s own
            portals, calendar and today&rsquo;s board.
          </p>

          {!canManage && (
            <p className="flex items-start gap-2 rounded-xl border-2 border-ink/15 bg-cream p-3 text-sm text-ink/70">
              <Users className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Only Admin and Principal accounts may change the timetable.
            </p>
          )}
        </div>
      </Modal>

      <Modal
        open={!!linkFor}
        onClose={() => setLinkFor(null)}
        title="Meeting link"
        description={
          linkFor
            ? `${linkFor.course} with ${linkFor.studentName} at ${linkFor.start}`
            : undefined
        }
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setLinkFor(null)}>
              Cancel
            </AdminButton>
            <AdminButton onClick={() => void saveClassLink()}>Save link</AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label="Zoom or Meet link"
            hint="The student clicks this from their portal when the class is due."
          >
            <input
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              placeholder="https://zoom.us/j/1234567890"
              className={inputClass}
            />
          </Field>

          {myRoom && linkDraft !== myRoom && (
            <button
              type="button"
              onClick={() => setLinkDraft(myRoom)}
              className="cursor-pointer text-sm font-bold text-green-deep underline decoration-2 underline-offset-4"
            >
              Use my meeting room
            </button>
          )}
        </div>
      </Modal>

      <ConfirmModal
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => void remove()}
        danger
        confirmLabel="Remove class"
        title={`Remove ${removing?.studentName ?? ""}'s class?`}
        body="The recurring slot is deleted and disappears from both portals. Past attendance records are unaffected."
      />
    </AdminPage>
  );
}
