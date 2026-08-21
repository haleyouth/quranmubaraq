"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban, CalendarDays, CheckCircle2, Pencil, Plus, Search, Trash2, UserCog,
} from "lucide-react";
import { teachers as seed, type Teacher } from "@/lib/admin/demo-data";
import {
  canImpersonate, sessionForPerson, startImpersonation, type Session,
} from "@/lib/admin/demo-auth";
import { useSession } from "@/lib/admin/session-context";
import {
  AdminButton, AdminPage, Badge, Field, Panel, StatusBadge,
  Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { ConfirmModal, Modal } from "@/components/admin/Modal";
import { CalendarView } from "@/components/admin/CalendarView";
import { useEffect } from "react";

export default function TeachersPage() {
  const router = useRouter();
  const { session } = useSession();
  const [rows, setRows] = useState<Teacher[]>([...seed]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editing, setEditing] = useState<Teacher | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState<
    { kind: "disable" | "enable" | "delete"; teacher: Teacher } | null
  >(null);
  const [calendarFor, setCalendarFor] = useState<Teacher | null>(null);
  const [toast, setToast] = useState("");


  const filtered = useMemo(
    () =>
      rows.filter((t) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.specializations.some((s) => s.toLowerCase().includes(q));
        const matchesStatus = statusFilter === "all" || t.status === statusFilter;
        return matchesQuery && matchesStatus;
      }),
    [rows, query, statusFilter],
  );

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3500);
  }

  function saveTeacher(next: Teacher) {
    setRows((prev) => {
      const exists = prev.some((t) => t.id === next.id);
      return exists ? prev.map((t) => (t.id === next.id ? next : t)) : [next, ...prev];
    });
    flash(`Saved ${next.name}.`);
  }

  function applyConfirm() {
    if (!confirm) return;
    const { kind, teacher } = confirm;

    if (kind === "delete") {
      setRows((prev) => prev.filter((t) => t.id !== teacher.id));
      flash(`${teacher.name} archived. Attendance and payout history is retained.`);
      return;
    }

    const status = kind === "disable" ? "disabled" : "active";
    setRows((prev) =>
      prev.map((t) => (t.id === teacher.id ? { ...t, status: status as Teacher["status"] } : t)),
    );
    flash(
      kind === "disable"
        ? `${teacher.name} disabled. Their ${teacher.load} weekly classes need reassigning.`
        : `${teacher.name} re-enabled.`,
    );
  }

  /**
   * Impersonation — the actor's own session is preserved so they can return.
   * In production this is audit-logged and time-boxed (CRM plan §5.1).
   */
  function switchToTeacher(teacher: Teacher) {
    if (!session) return;
    const target = sessionForPerson(teacher.id, teacher.name, "teacher");
    if (startImpersonation(session, target)) {
      router.push("/admin");
    } else {
      flash("Only Admin and Principal accounts may view as another user.");
    }
  }

  const canManage = session?.role === "admin" || session?.role === "principal";
  const mayImpersonate = session ? canImpersonate(session.role) : false;

  return (
    <AdminPage
      title="Teachers"
      description="Manage teaching staff, availability, status and access."
      actions={
        canManage && (
          <AdminButton onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Add teacher
          </AdminButton>
        )
      }
    >

      {toast && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink"
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      <Panel bodyClassName="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or specialization"
              aria-label="Search teachers"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className={`${inputClass} sm:w-52`}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </Panel>

      <Panel
        title={`${filtered.length} teacher${filtered.length === 1 ? "" : "s"}`}
        bodyClassName="p-0"
      >
        <Table
          head={["Teacher", "Contact", "Admin", "Specializations", "Load", "Status", "Actions"]}
          empty={filtered.length === 0}
        >
          {filtered.map((t) => (
            <Tr key={t.id}>
              <Td label="Teacher">
                <div className="flex items-center gap-3">
                  <span className="font-display grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-green text-xs text-white">
                    {t.name.split(" ").slice(-2).map((w) => w[0]).join("")}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-ink/55">
                      {t.id} · {t.students} students · ★ {t.rating}
                    </p>
                  </div>
                </div>
              </Td>
              <Td label="Contact">
                <p className="text-ink/80">{t.email}</p>
                <p className="text-xs text-ink/55">{t.phone}</p>
              </Td>
              <Td label="Admin" className="text-ink/70">{t.admin}</Td>
              <Td label="Specializations">
                <div className="flex flex-wrap gap-1.5">
                  {t.specializations.map((s) => (
                    <Badge key={s} tone="sage">
                      {s}
                    </Badge>
                  ))}
                </div>
              </Td>
              <Td label="Load">
                <span className="font-semibold">{t.load}h</span>
                <span className="text-ink/50"> / 30h</span>
              </Td>
              <Td label="Status">
                <StatusBadge status={t.status} />
              </Td>
              <Td label="Actions">
                <div className="flex flex-wrap gap-1.5">
                  <IconAction label="Edit profile" onClick={() => setEditing(t)}>
                    <Pencil className="size-3.5" />
                  </IconAction>
                  <IconAction
                    label={`View ${t.name}'s class schedule`}
                    onClick={() => setCalendarFor(t)}
                  >
                    <CalendarDays className="size-3.5" />
                  </IconAction>
                  {canManage && (
                    <>
                      {mayImpersonate && (
                        <IconAction
                          label={`View as ${t.name}`}
                          onClick={() => switchToTeacher(t)}
                        >
                          <UserCog className="size-3.5" />
                        </IconAction>
                      )}
                      <IconAction
                        label={t.status === "active" ? "Disable teacher" : "Enable teacher"}
                        onClick={() =>
                          setConfirm({
                            kind: t.status === "active" ? "disable" : "enable",
                            teacher: t,
                          })
                        }
                      >
                        <Ban className="size-3.5" />
                      </IconAction>
                      <IconAction
                        label="Delete teacher"
                        danger
                        onClick={() => setConfirm({ kind: "delete", teacher: t })}
                      >
                        <Trash2 className="size-3.5" />
                      </IconAction>
                    </>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      {/* Class schedule calendar */}
      <Modal
        open={Boolean(calendarFor)}
        onClose={() => setCalendarFor(null)}
        title={calendarFor ? `${calendarFor.name} — class schedule` : ""}
        description="Click any day to see that day's classes."
        size="lg"
      >
        {calendarFor && (
          <CalendarView
            title={`${calendarFor.students} students · ${calendarFor.load}h per week`}
            filter={(s) => s.teacherName === calendarFor.name}
          />
        )}
      </Modal>

      {/* Edit / create */}
      <TeacherForm
        open={Boolean(editing) || creating}
        teacher={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSave={saveTeacher}
      />

      {/* Confirmations */}
      <ConfirmModal
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={applyConfirm}
        danger={confirm?.kind !== "enable"}
        title={
          confirm?.kind === "delete"
            ? `Delete ${confirm.teacher.name}?`
            : confirm?.kind === "disable"
              ? `Disable ${confirm?.teacher.name}?`
              : `Enable ${confirm?.teacher.name}?`
        }
        confirmLabel={
          confirm?.kind === "delete"
            ? "Archive teacher"
            : confirm?.kind === "disable"
              ? "Disable"
              : "Enable"
        }
        body={
          confirm?.kind === "delete"
            ? `This archives the teacher rather than erasing them, so attendance, payout and audit history is preserved. Their ${confirm.teacher.students} students must be reassigned first.`
            : confirm?.kind === "disable"
              ? `${confirm?.teacher.name} will be unable to sign in and will receive no new assignments. Their ${confirm?.teacher.load} weekly class hours need reassigning or cancelling.`
              : `${confirm?.teacher.name} will regain portal access and can be assigned classes again.`
        }
      />
    </AdminPage>
  );
}

function IconAction({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-10 cursor-pointer place-items-center rounded-lg border-2 border-ink transition-colors sm:size-8 ${
        danger ? "bg-white text-red-700 hover:bg-red-700 hover:text-white" : "bg-white text-ink hover:bg-cream-deep"
      }`}
    >
      {children}
    </button>
  );
}

function TeacherForm({
  open,
  teacher,
  onClose,
  onSave,
}: {
  open: boolean;
  teacher: Teacher | null;
  onClose: () => void;
  onSave: (t: Teacher) => void;
}) {
  const blank: Teacher = {
    id: `T-${Math.floor(Math.random() * 900 + 100)}`,
    name: "", email: "", phone: "", admin: "Qasim Shafiq Mir",
    specializations: ["Tajweed"], students: 0, load: 0, rating: 0,
    status: "active", joined: new Date().toISOString().slice(0, 10), gender: "male",
  };

  const [form, setForm] = useState<Teacher>(teacher ?? blank);

  useEffect(() => {
    setForm(teacher ?? blank);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher, open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={teacher ? `Edit ${teacher.name}` : "Add teacher"}
      description="Teacher, admin, email and phone are the core record."
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton form="teacher-form" type="submit">
            {teacher ? "Save changes" : "Create teacher"}
          </AdminButton>
        </>
      }
    >
      <form id="teacher-form" onSubmit={submit} className="space-y-4">
        <Field label="Teacher name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder="Ustadh Ahmad Ibrahim"
          />
        </Field>

        <Field label="Email address">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
            placeholder="name@quranmubarak.com"
          />
        </Field>

        <Field label="Phone number">
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
            placeholder="+92 300 5551200"
          />
        </Field>

        <Field label="Reporting admin">
          <select
            value={form.admin}
            onChange={(e) => setForm({ ...form, admin: e.target.value })}
            className={inputClass}
          >
            <option>Qasim Shafiq Mir</option>
            <option>Bilal Ahmed</option>
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Gender" hint="Used for teacher-preference matching.">
            <select
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as Teacher["gender"] })
              }
              className={inputClass}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Field>

          <Field label="Weekly hours" hint="Maximum 30.">
            <input
              type="number"
              min={0}
              max={30}
              value={form.load}
              onChange={(e) => setForm({ ...form, load: Number(e.target.value) })}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Specializations">
          <div className="flex flex-wrap gap-2">
            {["Tajweed", "Hifz", "Recitation", "Tafseer", "Arabic", "Islamic Studies"].map(
              (s) => {
                const on = form.specializations.includes(s);
                return (
                  <label
                    key={s}
                    className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-full border-2 border-ink px-3 py-1.5 text-sm font-semibold transition-colors ${
                      on ? "bg-green text-white" : "bg-white text-ink"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        setForm({
                          ...form,
                          specializations: on
                            ? form.specializations.filter((x) => x !== s)
                            : [...form.specializations, s],
                        })
                      }
                      className="sr-only"
                    />
                    {s}
                  </label>
                );
              },
            )}
          </div>
        </Field>
      </form>
    </Modal>
  );
}
