"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase, CheckCircle2, ClipboardList, Inbox, Mail, Pencil, Phone,
  RefreshCw, Search, Trash2, TriangleAlert, UserPlus,
} from "lucide-react";
import { useSession } from "@/lib/admin/session-context";
import { leads as trialSeed, type LeadStatus } from "@/lib/admin/demo-data";
import {
  deleteLead, listLeads, updateLead, updateLeadStatus,
} from "@/lib/leads";
import {
  deleteApplication, listApplications, updateApplication, vacancies,
  type ApplicationStatus, type StoredApplication,
} from "@/lib/careers";
import { courses } from "@/lib/content";
import { DateRoller, calculateAge } from "@/components/ui/DateRoller";
import {
  AdminButton, AdminPage, Badge, Field, Panel, StatTile,
  Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { ConfirmModal, Modal } from "@/components/admin/Modal";
import { FunnelChart } from "@/components/admin/Charts";
import { enrolmentFunnel } from "@/lib/admin/demo-data";

/**
 * Every form the public site can submit, managed in one place.
 *
 * Trial-class requests and job applications live in separate Firestore
 * collections because they carry different fields, but staff work one inbox:
 * splitting them across screens meant whichever tab was closed went unread.
 */
type FormType = "trial" | "application";

const TRIAL_STAGES: LeadStatus[] = ["new", "contacted", "trial", "enrolled", "lost"];
const APP_STAGES: ApplicationStatus[] = ["new", "reviewing", "interview", "hired", "rejected"];
const OWNERS = ["Unassigned", "Qasim Shafiq Mir", "Bilal Ahmed", "Ayesha Siddiqa"];

type Row = {
  id: string;
  type: FormType;
  name: string;
  email: string;
  phone: string;
  country: string;
  /** Course of interest, or the role applied for. */
  subject: string;
  status: string;
  dateOfBirth?: string;
  age?: number | null;
  owner?: string;
  gender?: string;
  qualifications?: string;
  experienceYears?: string;
  availability?: string;
  message?: string;
  note?: string;
  createdAt: Date | null;
  /** Backed by Firestore, so edits persist. */
  live: boolean;
};

const TYPE_META: Record<
  FormType,
  { label: string; icon: typeof Inbox; tone: "green" | "greenDeep" }
> = {
  trial: { label: "Trial class", icon: ClipboardList, tone: "green" },
  application: { label: "Job application", icon: Briefcase, tone: "greenDeep" },
};

/** Demo applications, so the screen is reviewable before Auth is connected. */
const APP_SEED: StoredApplication[] = [
  {
    id: "AP-DEMO-1", name: "Ustadha Ruqayyah Anwar", email: "r.anwar@example.com",
    phone: "+92 300 5559911", country: "Pakistan", role: "Female Quran Teacher",
    gender: "female", dateOfBirth: "1994-04-12", age: 32,
    qualifications: "Hafiza with ijazah in Hafs 'an 'Asim; BA Islamic Studies.",
    experienceYears: "5-10", availability: "20-30 hours",
    message: "I have taught children online for six years.",
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

export default function SubmissionsPage() {
  const { session } = useSession();
  const [rows, setRows] = useState<Row[]>([]);
  const [liveState, setLiveState] = useState<"loading" | "ok" | "denied" | "error">("loading");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | FormType>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<Row | null>(null);
  const [viewing, setViewing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLiveState("loading");

    const demo: Row[] = [
      ...trialSeed.map((l) => ({
        id: l.id, type: "trial" as const, name: l.name, email: l.email,
        phone: l.phone, country: l.country, subject: l.course,
        status: l.status, owner: l.owner,
        createdAt: new Date(l.created), live: false,
      })),
      ...APP_SEED.map((a) => ({
        id: a.id, type: "application" as const, name: a.name, email: a.email,
        phone: a.phone, country: a.country, subject: a.role,
        status: a.status, dateOfBirth: a.dateOfBirth,
        age: a.age ?? calculateAge(a.dateOfBirth), gender: a.gender,
        qualifications: a.qualifications, experienceYears: a.experienceYears,
        availability: a.availability, message: a.message,
        createdAt: a.createdAt, live: false,
      })),
    ];

    // Read both independently, so one failing does not hide the other
    const [trialRes, appRes] = await Promise.allSettled([listLeads(), listApplications()]);

    const live: Row[] = [];
    if (trialRes.status === "fulfilled") {
      live.push(
        ...trialRes.value.map((l) => ({
          id: l.id, type: "trial" as const, name: l.name, email: l.email,
          phone: l.phone, country: l.country, subject: l.course ?? "",
          status: l.status, dateOfBirth: l.dateOfBirth,
          age: l.dateOfBirth ? calculateAge(l.dateOfBirth) : (l.age ?? null),
          owner: l.owner ?? "Unassigned", note: l.note,
          createdAt: l.createdAt, live: true,
        })),
      );
    }
    if (appRes.status === "fulfilled") {
      live.push(
        ...appRes.value.map((a) => ({
          id: a.id, type: "application" as const, name: a.name, email: a.email,
          phone: a.phone, country: a.country, subject: a.role,
          status: a.status, dateOfBirth: a.dateOfBirth,
          age: a.age ?? calculateAge(a.dateOfBirth), gender: a.gender,
          qualifications: a.qualifications, experienceYears: a.experienceYears,
          availability: a.availability, message: a.message, note: a.note,
          createdAt: a.createdAt, live: true,
        })),
      );
    }

    const denied =
      (trialRes.status === "rejected" &&
        (trialRes.reason as { code?: string })?.code === "permission-denied") ||
      (appRes.status === "rejected" &&
        (appRes.reason as { code?: string })?.code === "permission-denied");

    setRows(
      [...live, ...demo].sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      ),
    );
    setLiveState(
      trialRes.status === "fulfilled" || appRes.status === "fulfilled"
        ? "ok"
        : denied
          ? "denied"
          : "error",
    );
  }

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 3500);
  }

  const canManage = session?.role === "admin" || session?.role === "principal";
  const stagesFor = (t: FormType) => (t === "trial" ? TRIAL_STAGES : APP_STAGES);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q);
        const matchesType = typeFilter === "all" || r.type === typeFilter;
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matchesQuery && matchesType && matchesStatus;
      }),
    [rows, query, typeFilter, statusFilter],
  );

  async function changeStatus(row: Row, status: string) {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
    if (!row.live) return flash(`${row.name} moved to ${status}.`);
    try {
      if (row.type === "trial") await updateLeadStatus(row.id, status as LeadStatus);
      else await updateApplication(row.id, { status: status as ApplicationStatus });
      flash(`${row.name} moved to ${status}.`);
    } catch {
      flash("Could not save — staff sign-in required.");
      void load();
    }
  }

  async function saveEdit(next: Row) {
    setRows((prev) => prev.map((r) => (r.id === next.id ? next : r)));
    setEditing(null);
    if (!next.live) return flash(`Saved ${next.name}.`);

    try {
      if (next.type === "trial") {
        await updateLead(next.id, {
          name: next.name, email: next.email, phone: next.phone,
          country: next.country, course: next.subject,
          dateOfBirth: next.dateOfBirth, age: next.age ?? undefined,
          status: next.status as LeadStatus, owner: next.owner,
          note: next.note ?? "",
        });
      } else {
        await updateApplication(next.id, {
          name: next.name, email: next.email, phone: next.phone,
          country: next.country, role: next.subject, gender: next.gender,
          dateOfBirth: next.dateOfBirth, age: next.age ?? undefined,
          qualifications: next.qualifications,
          experienceYears: next.experienceYears,
          availability: next.availability, message: next.message,
          status: next.status as ApplicationStatus, note: next.note ?? "",
        });
      }
      flash(`Saved ${next.name}.`);
    } catch {
      flash("Could not save — staff sign-in required.");
      void load();
    }
  }

  async function confirmDelete() {
    const row = deleting;
    if (!row) return;
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    if (!row.live) return flash(`${row.name} removed.`);
    try {
      if (row.type === "trial") await deleteLead(row.id);
      else await deleteApplication(row.id);
      flash(`${row.name} permanently deleted.`);
    } catch {
      flash("Could not delete — staff sign-in required.");
      void load();
    }
  }

  const trials = rows.filter((r) => r.type === "trial").length;
  const apps = rows.filter((r) => r.type === "application").length;
  const fresh = rows.filter((r) => r.status === "new").length;
  const liveCount = rows.filter((r) => r.live).length;

  if (session && !canManage) {
    return (
      <AdminPage title="Submissions" description="Restricted area.">
        <Panel title="Not available">
          <p className="py-6 text-center text-ink/70">
            Form submissions are limited to administration and principals.
          </p>
        </Panel>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Submissions"
      description="Trial requests and job applications from the website, in one inbox."
      actions={
        <AdminButton variant="outline" onClick={() => void load()}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh
        </AdminButton>
      }
    >
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
            <strong className="block">Staff sign-in required to load live submissions.</strong>
            Website forms are being saved, but the security rules only release
            them to an authenticated staff account.
          </span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        <StatTile label="Total" value={String(rows.length)} delta={`${liveCount} live`} />
        <StatTile label="Trial requests" value={String(trials)} delta="Registration form" />
        <StatTile label="Applications" value={String(apps)} delta="Careers form" />
        <StatTile label="Awaiting action" value={String(fresh)} delta="Status: new" trend={fresh ? "down" : "flat"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.7fr]">
        <Panel title="Trial conversion" description="Last 90 days">
          <FunnelChart data={enrolmentFunnel} caption="Enrolment funnel by stage" />
        </Panel>

        <Panel bodyClassName="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, phone or country"
                aria-label="Search submissions"
                className={`${inputClass} pl-9`}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as "all" | FormType);
                setStatusFilter("all");
              }}
              aria-label="Filter by form type"
              className={inputClass}
            >
              <option value="all">All form types</option>
              <option value="trial">Trial class requests</option>
              <option value="application">Job applications</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className={inputClass}
            >
              <option value="all">All statuses</option>
              {(typeFilter === "application" ? APP_STAGES : TRIAL_STAGES).map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
        </Panel>
      </div>

      <Panel
        title={`${filtered.length} submission${filtered.length === 1 ? "" : "s"}`}
        description={liveState === "loading" ? "Loading…" : undefined}
        bodyClassName="p-0"
      >
        <Table
          head={["Form", "Name", "Contact", "Subject", "Age", "Country", "Status", "Move to", "Actions"]}
          empty={filtered.length === 0}
        >
          {filtered.map((r) => {
            const meta = TYPE_META[r.type];
            const Icon = meta.icon;
            return (
              <Tr key={`${r.type}-${r.id}`}>
                <Td label="Form">
                  <span className="flex items-center gap-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg border-2 border-ink bg-cream-deep">
                      <Icon className="size-3.5 text-ink" aria-hidden="true" />
                    </span>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </span>
                </Td>
                <Td label="Name">
                  <button
                    type="button"
                    onClick={() => setViewing(r)}
                    className="cursor-pointer text-left font-semibold text-ink underline decoration-teal decoration-2 underline-offset-4 hover:text-green-deep"
                  >
                    {r.name}
                  </button>
                  <p className="flex items-center gap-1.5 text-xs text-ink/55">
                    {r.createdAt ? r.createdAt.toLocaleDateString("en-GB") : "—"}
                    {r.live && <Badge tone="green">Live</Badge>}
                  </p>
                </Td>
                <Td label="Contact">
                  <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 text-sm text-ink/80 hover:text-green-deep">
                    <Mail className="size-3.5" aria-hidden="true" />
                    {r.email}
                  </a>
                  <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/55 hover:text-green-deep">
                    <Phone className="size-3" aria-hidden="true" />
                    {r.phone}
                  </a>
                </Td>
                <Td label="Subject" className="text-ink/70">{r.subject || "—"}</Td>
                <Td label="Age">
                  {r.dateOfBirth ? (calculateAge(r.dateOfBirth) ?? r.age ?? "—") : (r.age ?? "—")}
                </Td>
                <Td label="Country" className="text-ink/70">{r.country}</Td>
                <Td label="Status"><Badge tone="neutral">{r.status}</Badge></Td>
                <Td label="Move to">
                  <select
                    value={r.status}
                    onChange={(e) => void changeStatus(r, e.target.value)}
                    disabled={!canManage}
                    aria-label={`Change status for ${r.name}`}
                    className={`${inputClass} min-h-11 w-32 py-1 text-sm disabled:opacity-50 sm:min-h-9`}
                  >
                    {stagesFor(r.type).map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </Td>
                <Td label="Actions">
                  {canManage ? (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditing(r)}
                        aria-label={`Edit ${r.name}`}
                        title="Edit submission"
                        className="grid size-10 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep sm:size-8"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      {r.type === "trial" && (
                        <button
                          type="button"
                          onClick={() => void changeStatus(r, "enrolled")}
                          aria-label={`Mark ${r.name} enrolled`}
                          title="Mark enrolled"
                          className="grid size-10 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep sm:size-8"
                        >
                          <UserPlus className="size-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleting(r)}
                        aria-label={`Delete ${r.name}`}
                        title="Delete submission"
                        className="grid size-10 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white text-red-700 transition-colors hover:bg-red-700 hover:text-white sm:size-8"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-ink/45">View only</span>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Table>

        {liveState === "ok" && liveCount === 0 && (
          <div className="border-t-2 border-ink/12 py-8 text-center">
            <Inbox className="mx-auto size-7 text-ink/30" aria-hidden="true" />
            <p className="mt-2 font-semibold text-ink">No live submissions yet</p>
            <p className="mt-0.5 text-sm text-ink/60">
              New website forms appear here immediately.
            </p>
          </div>
        )}
      </Panel>

      {/* Full detail */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? ""}
        description={viewing ? `${TYPE_META[viewing.type].label} · ${viewing.subject}` : undefined}
      >
        {viewing && (
          <dl className="space-y-3 text-sm">
            {[
              ["Email", viewing.email],
              ["Phone", viewing.phone],
              ["Country", viewing.country],
              ["Date of birth", viewing.dateOfBirth
                ? new Date(`${viewing.dateOfBirth}T00:00:00`).toLocaleDateString("en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })
                : "—"],
              ["Age", String(
                viewing.dateOfBirth ? (calculateAge(viewing.dateOfBirth) ?? "—") : (viewing.age ?? "—"),
              )],
              ...(viewing.type === "application"
                ? [
                    ["Gender", viewing.gender || "Not stated"],
                    ["Experience", viewing.experienceYears ?? "—"],
                    ["Availability", viewing.availability ?? "—"],
                  ]
                : [["Assigned to", viewing.owner ?? "Unassigned"]]),
              ["Status", viewing.status],
              ["Received", viewing.createdAt ? viewing.createdAt.toLocaleString("en-GB") : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b-2 border-ink/10 pb-2">
                <dt className="font-bold text-ink/60">{k}</dt>
                <dd className="text-right text-ink capitalize">{v}</dd>
              </div>
            ))}

            {viewing.qualifications && (
              <div>
                <dt className="font-bold text-ink/60">Qualifications</dt>
                <dd className="mt-1 rounded-lg border-2 border-ink/12 bg-cream p-3 text-ink/80">
                  {viewing.qualifications}
                </dd>
              </div>
            )}
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

      <SubmissionForm
        row={editing}
        onClose={() => setEditing(null)}
        onSave={(next) => void saveEdit(next)}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
        danger
        title={deleting ? `Delete ${deleting.name}'s submission?` : ""}
        confirmLabel="Delete permanently"
        body={
          deleting?.live
            ? `This permanently removes ${deleting.name}'s submission, including their contact details. This cannot be undone.`
            : `This removes ${deleting?.name} from the list for this session.`
        }
      />
    </AdminPage>
  );
}

/* -------------------------------------------------------------------------- */

function SubmissionForm({
  row,
  onClose,
  onSave,
}: {
  row: Row | null;
  onClose: () => void;
  onSave: (r: Row) => void;
}) {
  const [form, setForm] = useState<Row | null>(row);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(row);
    setError("");
  }, [row]);

  if (!row || !form) return null;
  const isTrial = form.type === "trial";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (form.name.trim().length < 2) return setError("Please enter the full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      return setError("Please enter a valid email address.");
    if (form.phone.replace(/\D/g, "").length < 7)
      return setError("Please enter a valid phone number.");

    onSave({
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      age: form.dateOfBirth ? calculateAge(form.dateOfBirth) : form.age,
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${row.name}`}
      description={
        row.live
          ? `Live ${TYPE_META[row.type].label.toLowerCase()} — changes are saved to the database.`
          : "Demo record — changes last for this session only."
      }
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton form="submission-form" type="submit">Save changes</AdminButton>
        </>
      }
    >
      <form id="submission-form" onSubmit={submit} noValidate className="space-y-4">
        {error && (
          <p role="alert" className="rounded-xl border-2 border-red-700 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800">
            {error}
          </p>
        )}

        <Field label="Full name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email address" hint="Applicants often mistype this.">
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Phone number">
            <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country">
            <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} />
          </Field>
          <Field label={isTrial ? "Course of interest" : "Role applied for"}>
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass}>
              {isTrial ? (
                <>
                  <option value="">Not sure yet</option>
                  {courses.map((c) => <option key={c.slug} value={c.title}>{c.title}</option>)}
                </>
              ) : (
                <>
                  {vacancies.map((v) => <option key={v.slug} value={v.title}>{v.title}</option>)}
                  <option value="General application">General application</option>
                </>
              )}
            </select>
          </Field>
        </div>

        {/* Same roller as the public forms, so age is computed identically */}
        <DateRoller
          value={form.dateOfBirth ?? ""}
          onChange={(iso) => setForm({ ...form, dateOfBirth: iso, age: calculateAge(iso) })}
          minAge={isTrial ? 3 : 18}
          maxAge={isTrial ? 90 : 80}
          label="Date of birth"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              {(isTrial ? TRIAL_STAGES : APP_STAGES).map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </Field>

          {isTrial ? (
            <Field label="Assigned to">
              <select value={form.owner ?? "Unassigned"} onChange={(e) => setForm({ ...form, owner: e.target.value })} className={inputClass}>
                {OWNERS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
          ) : (
            <Field label="Years of experience">
              <select value={form.experienceYears ?? "1-3"} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} className={inputClass}>
                <option>Less than 1</option>
                <option>1-3</option>
                <option>3-5</option>
                <option>5-10</option>
                <option>More than 10</option>
              </select>
            </Field>
          )}
        </div>

        {!isTrial && (
          <Field label="Qualifications">
            <textarea
              rows={3}
              value={form.qualifications ?? ""}
              onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
              className={inputClass}
            />
          </Field>
        )}

        <Field label="Internal note" hint="Never shown to the applicant or family.">
          <textarea
            rows={2}
            value={form.note ?? ""}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            maxLength={400}
            className={inputClass}
            placeholder="e.g. Called 19 Aug, prefers evening classes."
          />
        </Field>
      </form>
    </Modal>
  );
}
