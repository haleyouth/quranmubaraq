"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, Inbox, Mail, Pencil, Phone, RefreshCw, Search,
  Trash2, TriangleAlert,
} from "lucide-react";
import { getSession, type Session } from "@/lib/admin/demo-auth";
import {
  deleteApplication, listApplications, updateApplication, vacancies,
  type ApplicationStatus, type StoredApplication,
} from "@/lib/careers";
import { calculateAge } from "@/components/ui/DateRoller";
import {
  AdminButton, AdminPage, Badge, DemoNotice, Field, Panel, StatTile,
  Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { ConfirmModal, Modal } from "@/components/admin/Modal";

const STAGES: ApplicationStatus[] = ["new", "reviewing", "interview", "hired", "rejected"];

const TONE: Record<ApplicationStatus, "gold" | "teal" | "sage" | "green" | "danger"> = {
  new: "gold",
  reviewing: "teal",
  interview: "sage",
  hired: "green",
  rejected: "danger",
};

/** Demo rows so the screen is reviewable before Auth is connected. */
const SEED: StoredApplication[] = [
  {
    id: "AP-DEMO-1", name: "Ustadha Ruqayyah Anwar", email: "r.anwar@example.com",
    phone: "+92 300 5559911", country: "Pakistan", role: "Female Quran Teacher",
    gender: "female", dateOfBirth: "1994-04-12", age: 32,
    qualifications: "Hafiza with ijazah in Hafs 'an 'Asim; BA Islamic Studies.",
    experienceYears: "5-10", availability: "20-30 hours",
    message: "I have taught children online for six years and enjoy working with beginners.",
    status: "new", source: "careers", createdAt: new Date("2026-08-17"),
  },
  {
    id: "AP-DEMO-2", name: "Ustadh Salman Rafiq", email: "s.rafiq@example.com",
    phone: "+44 7700 900443", country: "United Kingdom", role: "Male Quran Teacher",
    gender: "male", dateOfBirth: "1988-11-03", age: 37,
    qualifications: "Hafiz, Madinah graduate, ijazah in three qira'at.",
    experienceYears: "More than 10", availability: "10-20 hours",
    message: "Available evenings UK time.",
    status: "interview", source: "careers", createdAt: new Date("2026-08-15"),
  },
  {
    id: "AP-DEMO-3", name: "Sumayyah Idris", email: "s.idris@example.com",
    phone: "+1 416 555 0192", country: "Canada", role: "Admissions Coordinator",
    gender: "female", dateOfBirth: "1997-06-21", age: 29,
    qualifications: "BA Communications; three years in education admissions.",
    experienceYears: "3-5", availability: "Full-time",
    message: "Comfortable with CRM tools and parent communication.",
    status: "reviewing", source: "careers", createdAt: new Date("2026-08-13"),
  },
];

export default function ApplicationsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [rows, setRows] = useState<StoredApplication[]>([]);
  const [live, setLive] = useState<Set<string>>(new Set());
  const [liveState, setLiveState] = useState<"loading" | "ok" | "denied" | "error">("loading");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editing, setEditing] = useState<StoredApplication | null>(null);
  const [viewing, setViewing] = useState<StoredApplication | null>(null);
  const [deleting, setDeleting] = useState<StoredApplication | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setSession(getSession());
    void load();
  }, []);

  async function load() {
    setLiveState("loading");
    try {
      const fetched = await listApplications();
      setRows([...fetched, ...SEED]);
      setLive(new Set(fetched.map((a) => a.id)));
      setLiveState("ok");
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      setRows([...SEED]);
      setLive(new Set());
      setLiveState(code === "permission-denied" ? "denied" : "error");
    }
  }

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 3500);
  }

  const canManage = session?.role === "admin" || session?.role === "principal";
  const isLive = (id: string) => live.has(id);

  const filtered = useMemo(
    () =>
      rows.filter((a) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q) ||
          a.qualifications.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        const matchesRole = roleFilter === "all" || a.role === roleFilter;
        return matchesQuery && matchesStatus && matchesRole;
      }),
    [rows, query, statusFilter, roleFilter],
  );

  async function changeStatus(app: StoredApplication, status: ApplicationStatus) {
    setRows((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
    if (!isLive(app.id)) return flash(`${app.name} moved to ${status}.`);
    try {
      await updateApplication(app.id, { status });
      flash(`${app.name} moved to ${status}.`);
    } catch {
      flash("Could not save — staff sign-in required.");
      void load();
    }
  }

  async function saveEdit(next: StoredApplication) {
    setRows((prev) => prev.map((a) => (a.id === next.id ? next : a)));
    setEditing(null);
    if (!isLive(next.id)) return flash(`Saved ${next.name}.`);
    try {
      await updateApplication(next.id, {
        name: next.name, email: next.email, phone: next.phone,
        country: next.country, role: next.role, gender: next.gender,
        dateOfBirth: next.dateOfBirth, age: next.age,
        qualifications: next.qualifications,
        experienceYears: next.experienceYears,
        availability: next.availability, message: next.message,
        status: next.status, note: next.note ?? "",
      });
      flash(`Saved ${next.name}.`);
    } catch {
      flash("Could not save — staff sign-in required.");
      void load();
    }
  }

  async function confirmDelete() {
    const app = deleting;
    if (!app) return;
    setRows((prev) => prev.filter((a) => a.id !== app.id));
    if (!isLive(app.id)) return flash(`${app.name} removed.`);
    try {
      await deleteApplication(app.id);
      flash(`${app.name} permanently deleted.`);
    } catch {
      flash("Could not delete — staff sign-in required.");
      void load();
    }
  }

  const counts = Object.fromEntries(
    STAGES.map((s) => [s, rows.filter((a) => a.status === s).length]),
  );

  return (
    <AdminPage
      title="Job Applications"
      description="Applications submitted through the careers page."
      actions={
        <AdminButton variant="outline" onClick={() => void load()}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh
        </AdminButton>
      }
    >
      <DemoNotice>
        Applications submitted on the careers page are saved to Firestore and
        appear here. Rows marked <strong>Live</strong> are real submissions and
        can be edited or deleted; the rest are demo data.
      </DemoNotice>

      {toast && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      {liveState === "denied" && (
        <p className="flex items-start gap-3 rounded-xl border-2 border-ink bg-gold px-4 py-3 text-sm text-ink">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <strong className="block">Staff sign-in required to load live applications.</strong>
            Submissions are being saved, but the security rules only release
            them to an authenticated staff account.
          </span>
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map((s) => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)} className="text-left">
            <StatTile label={s} value={String(counts[s] ?? 0)} />
          </button>
        ))}
      </div>

      <Panel bodyClassName="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, country or qualifications"
              aria-label="Search applications"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role" className={inputClass}>
            <option value="all">All roles</option>
            {vacancies.map((v) => <option key={v.slug} value={v.title}>{v.title}</option>)}
            <option value="General application">General application</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status" className={inputClass}>
            <option value="all">All statuses</option>
            {STAGES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
      </Panel>

      <Panel
        title={`${filtered.length} application${filtered.length === 1 ? "" : "s"}`}
        description={liveState === "loading" ? "Loading live applications…" : undefined}
        bodyClassName="p-0"
      >
        <Table
          head={["Applicant", "Contact", "Role", "Age", "Experience", "Status", "Move to", "Actions"]}
          empty={filtered.length === 0}
        >
          {filtered.map((a) => (
            <Tr key={a.id}>
              <Td label="Applicant">
                <button
                  type="button"
                  onClick={() => setViewing(a)}
                  className="cursor-pointer text-left font-semibold text-ink underline decoration-teal decoration-2 underline-offset-4 hover:text-green-deep"
                >
                  {a.name}
                </button>
                <p className="flex items-center gap-1.5 text-xs text-ink/55">
                  {a.country}
                  {isLive(a.id) && <Badge tone="green">Live</Badge>}
                </p>
              </Td>
              <Td label="Contact">
                <a href={`mailto:${a.email}`} className="flex items-center gap-1.5 text-sm text-ink/80 hover:text-green-deep">
                  <Mail className="size-3.5" aria-hidden="true" />
                  {a.email}
                </a>
                <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/55 hover:text-green-deep">
                  <Phone className="size-3" aria-hidden="true" />
                  {a.phone}
                </a>
              </Td>
              <Td label="Role" className="text-ink/70">{a.role}</Td>
              <Td label="Age">
                {a.dateOfBirth ? (calculateAge(a.dateOfBirth) ?? a.age ?? "—") : (a.age ?? "—")}
              </Td>
              <Td label="Experience" className="text-ink/70">{a.experienceYears}</Td>
              <Td label="Status">
                <Badge tone={TONE[a.status]}>{a.status}</Badge>
              </Td>
              <Td label="Move to">
                <select
                  value={a.status}
                  onChange={(e) => void changeStatus(a, e.target.value as ApplicationStatus)}
                  disabled={!canManage}
                  aria-label={`Change status for ${a.name}`}
                  className={`${inputClass} min-h-9 w-32 py-1 text-sm disabled:opacity-50`}
                >
                  {STAGES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </Td>
              <Td label="Actions">
                {canManage ? (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditing(a)}
                      aria-label={`Edit ${a.name}`}
                      title="Edit application"
                      className="grid size-8 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(a)}
                      aria-label={`Delete ${a.name}`}
                      title="Delete application"
                      className="grid size-8 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white text-red-700 transition-colors hover:bg-red-700 hover:text-white"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-ink/45">View only</span>
                )}
              </Td>
            </Tr>
          ))}
        </Table>

        {liveState === "ok" && live.size === 0 && (
          <div className="border-t-2 border-ink/12 py-8 text-center">
            <Inbox className="mx-auto size-7 text-ink/30" aria-hidden="true" />
            <p className="mt-2 font-semibold text-ink">No live applications yet</p>
            <p className="mt-0.5 text-sm text-ink/60">
              New submissions from the careers page appear here immediately.
            </p>
          </div>
        )}
      </Panel>

      {/* Full application */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? ""}
        description={viewing ? `${viewing.role} · ${viewing.country}` : undefined}
      >
        {viewing && (
          <dl className="space-y-3 text-sm">
            {[
              ["Email", viewing.email],
              ["Phone", viewing.phone],
              ["Date of birth", viewing.dateOfBirth || "—"],
              ["Age", String(calculateAge(viewing.dateOfBirth) ?? viewing.age ?? "—")],
              ["Gender", viewing.gender || "Not stated"],
              ["Experience", viewing.experienceYears],
              ["Availability", viewing.availability],
              ["Applied", viewing.createdAt ? viewing.createdAt.toLocaleDateString("en-GB") : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b-2 border-ink/10 pb-2">
                <dt className="font-bold text-ink/60">{k}</dt>
                <dd className="text-right text-ink">{v}</dd>
              </div>
            ))}
            <div>
              <dt className="font-bold text-ink/60">Qualifications</dt>
              <dd className="mt-1 rounded-lg border-2 border-ink/12 bg-cream p-3 text-ink/80">
                {viewing.qualifications}
              </dd>
            </div>
            {viewing.message && (
              <div>
                <dt className="font-bold text-ink/60">Message</dt>
                <dd className="mt-1 rounded-lg border-2 border-ink/12 bg-cream p-3 text-ink/80">
                  {viewing.message}
                </dd>
              </div>
            )}
            {viewing.note && (
              <div>
                <dt className="font-bold text-ink/60">Internal note</dt>
                <dd className="mt-1 rounded-lg border-2 border-ink bg-gold/25 p-3 text-ink/80">
                  {viewing.note}
                </dd>
              </div>
            )}
          </dl>
        )}
      </Modal>

      <ApplicationForm
        app={editing}
        onClose={() => setEditing(null)}
        onSave={(next) => void saveEdit(next)}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
        danger
        title={deleting ? `Delete ${deleting.name}'s application?` : ""}
        confirmLabel="Delete permanently"
        body={
          deleting && isLive(deleting.id)
            ? `This permanently removes ${deleting.name}'s application and contact details. This cannot be undone.`
            : `This removes ${deleting?.name} from the list for this session.`
        }
      />
    </AdminPage>
  );
}

/* -------------------------------------------------------------------------- */

function ApplicationForm({
  app,
  onClose,
  onSave,
}: {
  app: StoredApplication | null;
  onClose: () => void;
  onSave: (a: StoredApplication) => void;
}) {
  const [form, setForm] = useState<StoredApplication | null>(app);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(app);
    setError("");
  }, [app]);

  if (!app || !form) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (form.name.trim().length < 2) return setError("Please enter the full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      return setError("Please enter a valid email address.");
    onSave({
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      age: calculateAge(form.dateOfBirth) ?? form.age,
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${app.name}`}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton form="app-form" type="submit">Save changes</AdminButton>
        </>
      }
    >
      <form id="app-form" onSubmit={submit} noValidate className="space-y-4">
        {error && (
          <p role="alert" className="rounded-xl border-2 border-red-700 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800">
            {error}
          </p>
        )}

        <Field label="Full name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email address">
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Phone number">
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
              {vacancies.map((v) => <option key={v.slug} value={v.title}>{v.title}</option>)}
              <option value="General application">General application</option>
            </select>
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}
              className={inputClass}
            >
              {STAGES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </Field>
        </div>

        <Field
          label="Date of birth"
          hint={`Age is recalculated on save${
            form.dateOfBirth ? ` — currently ${calculateAge(form.dateOfBirth) ?? "?"}` : ""
          }.`}
        >
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label="Qualifications">
          <textarea
            rows={3}
            value={form.qualifications}
            onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label="Internal note" hint="Never shown to the applicant.">
          <textarea
            rows={2}
            value={form.note ?? ""}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            maxLength={400}
            className={inputClass}
            placeholder="e.g. Strong Tajweed on the trial call, schedule a second interview."
          />
        </Field>
      </form>
    </Modal>
  );
}
