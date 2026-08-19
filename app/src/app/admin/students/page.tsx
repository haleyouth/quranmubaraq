"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, CheckCircle2, Pencil, PauseCircle, Plus, Search, UserCog, UserRound,
} from "lucide-react";
import { students as seed, type Student } from "@/lib/admin/demo-data";
import {
  canImpersonate, getSession, sessionForPerson, startImpersonation, type Session,
} from "@/lib/admin/demo-auth";
import { courses } from "@/lib/content";
import {
  AdminButton, AdminPage, Field, Panel, StatusBadge,
  Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";
import { CalendarView } from "@/components/admin/CalendarView";
import { useRouter } from "next/navigation";

export default function StudentsPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [calendarFor, setCalendarFor] = useState<Student | null>(null);
  const [rows, setRows] = useState<Student[]>([...seed]);
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [editing, setEditing] = useState<Student | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => setSession(getSession()), []);

  const filtered = useMemo(
    () =>
      rows.filter((s) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.guardian.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q);
        const matchesCourse = courseFilter === "all" || s.course === courseFilter;
        return matchesQuery && matchesCourse;
      }),
    [rows, query, courseFilter],
  );

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3500);
  }

  function save(next: Student) {
    setRows((prev) =>
      prev.some((s) => s.id === next.id)
        ? prev.map((s) => (s.id === next.id ? next : s))
        : [next, ...prev],
    );
    flash(`Saved ${next.name}.`);
  }

  function togglePause(s: Student) {
    const status: Student["status"] = s.status === "active" ? "disabled" : "active";
    setRows((prev) => prev.map((r) => (r.id === s.id ? { ...r, status } : r)));
    flash(
      status === "disabled"
        ? `${s.name} paused. Billing stops at the end of the current period.`
        : `${s.name} resumed.`,
    );
  }

  /** Act as this student, preserving the actor's session for return. */
  function viewAsStudent(s: Student) {
    if (startImpersonation(sessionForPerson(s.name, "student"))) {
      router.push("/admin");
    } else {
      flash("Only Admin and Principal accounts may view as another user.");
    }
  }

  const canManage = session?.role === "admin" || session?.role === "principal";
  const mayImpersonate = session ? canImpersonate(session.role) : false;

  return (
    <AdminPage
      title="Students"
      description="Enrolments, guardians, progress and attendance."
      actions={
        canManage && (
          <AdminButton onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Enrol student
          </AdminButton>
        )
      }
    >

      {toast && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      <Panel bodyClassName="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student, guardian or country"
              aria-label="Search students"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            aria-label="Filter by course"
            className={`${inputClass} sm:w-64`}
          >
            <option value="all">All courses</option>
            {courses.map((c) => (
              <option key={c.slug} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </Panel>

      <Panel title={`${filtered.length} student${filtered.length === 1 ? "" : "s"}`} bodyClassName="p-0">
        <Table
          head={["Student", "Guardian", "Course", "Teacher", "Plan", "Attendance", "Status", "Actions"]}
          empty={filtered.length === 0}
        >
          {filtered.map((s) => (
            <Tr key={s.id}>
              <Td label="Student">
                <div className="flex items-center gap-3">
                  <span className="font-display grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-green-deep text-xs text-white">
                    {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{s.name}</p>
                    <p className="text-xs text-ink/55">{s.id} · {s.country}</p>
                  </div>
                </div>
              </Td>
              <Td label="Guardian" className="text-ink/70">{s.guardian}</Td>
              <Td label="Course" className="text-ink/70">{s.course}</Td>
              <Td label="Teacher" className="text-ink/70">{s.teacher}</Td>
              <Td label="Plan">{s.plan}</Td>
              <Td label="Attendance">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full border border-ink bg-cream">
                    <div
                      className={s.attendance >= 85 ? "h-full bg-green" : "h-full bg-gold"}
                      style={{ width: `${s.attendance}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold">{s.attendance}%</span>
                </div>
              </Td>
              <Td label="Status"><StatusBadge status={s.status} /></Td>
              <Td label="Actions">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditing(s)}
                    aria-label={`Edit ${s.name}`}
                    title="Edit profile"
                    className="grid size-10 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep sm:size-8"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarFor(s)}
                    aria-label={`View ${s.name}'s class schedule`}
                    title="Class schedule"
                    className="grid size-10 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep sm:size-8"
                  >
                    <CalendarDays className="size-3.5" />
                  </button>
                  {mayImpersonate && (
                    <button
                      type="button"
                      onClick={() => viewAsStudent(s)}
                      aria-label={`View as ${s.name}`}
                      title="View as this student"
                      className="grid size-10 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep sm:size-8"
                    >
                      <UserCog className="size-3.5" />
                    </button>
                  )}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => togglePause(s)}
                      aria-label={s.status === "active" ? `Pause ${s.name}` : `Resume ${s.name}`}
                      title={s.status === "active" ? "Pause enrolment" : "Resume enrolment"}
                      className="grid size-10 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep sm:size-8"
                    >
                      <PauseCircle className="size-3.5" />
                    </button>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      <Modal
        open={Boolean(calendarFor)}
        onClose={() => setCalendarFor(null)}
        title={calendarFor ? `${calendarFor.name} — class schedule` : ""}
        description="Click any day to see that day's classes."
        size="lg"
      >
        {calendarFor && (
          <CalendarView
            title={`${calendarFor.course} · ${calendarFor.plan}`}
            filter={(x) => x.studentName === calendarFor.name}
          />
        )}
      </Modal>

      <StudentForm
        open={Boolean(editing) || creating}
        student={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSave={save}
      />
    </AdminPage>
  );
}

function StudentForm({
  open, student, onClose, onSave,
}: {
  open: boolean;
  student: Student | null;
  onClose: () => void;
  onSave: (s: Student) => void;
}) {
  const blank: Student = {
    id: `ST-${Math.floor(Math.random() * 900 + 100)}`,
    name: "", guardian: "", country: "United Kingdom",
    course: courses[0].title, teacher: "Ustadha Ayesha Siddiqa",
    plan: "3 Days / Week", attendance: 100, status: "pending",
    joined: new Date().toISOString().slice(0, 10),
  };

  const [form, setForm] = useState<Student>(student ?? blank);

  useEffect(() => {
    setForm(student ?? blank);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={student ? `Edit ${student.name}` : "Enrol student"}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton form="student-form" type="submit">
            {student ? "Save changes" : "Enrol student"}
          </AdminButton>
        </>
      }
    >
      <form
        id="student-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
          onClose();
        }}
        className="space-y-4"
      >
        <Field label="Student name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Yusuf Ibrahim" />
        </Field>
        <Field label="Parent / guardian">
          <input required value={form.guardian} onChange={(e) => setForm({ ...form, guardian: e.target.value })} className={inputClass} placeholder="Ibrahim Adeel" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country">
            <input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Plan">
            <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className={inputClass}>
              <option>Free Trial</option>
              <option>3 Days / Week</option>
              <option>5 Days / Week</option>
            </select>
          </Field>
        </div>
        <Field label="Course">
          <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className={inputClass}>
            {courses.map((c) => <option key={c.slug}>{c.title}</option>)}
          </select>
        </Field>
        <Field label="Assigned teacher">
          <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className={inputClass}>
            <option>Ustadha Ayesha Siddiqa</option>
            <option>Ustadh Bilal Ahmed</option>
            <option>Ustadha Zainab Ali</option>
            <option>Ustadh Yusuf Qadri</option>
            <option>Ustadh Imran Malik</option>
          </select>
        </Field>
        <p className="flex items-start gap-2 rounded-xl border-2 border-ink/15 bg-cream p-3 text-sm text-ink/70">
          <UserRound className="mt-0.5 size-4 shrink-0 text-green" aria-hidden="true" />
          A parent portal account is created automatically for the guardian on save.
        </p>
      </form>
    </Modal>
  );
}
