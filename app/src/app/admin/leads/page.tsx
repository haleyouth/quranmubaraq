"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, Inbox, Mail, Pencil, Phone, RefreshCw, Search,
  Trash2, TriangleAlert, UserPlus,
} from "lucide-react";
import { leads as seed, type Lead, type LeadStatus } from "@/lib/admin/demo-data";
import { enrolmentFunnel } from "@/lib/admin/demo-data";
import { getSession, type Session } from "@/lib/admin/demo-auth";
import { courses } from "@/lib/content";
import {
  deleteLead, listLeads, updateLead, updateLeadStatus,
  type StoredLead,
} from "@/lib/leads";
import {
  AdminButton, AdminPage, Badge, Field, Panel, StatTile,
  StatusBadge, Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { ConfirmModal, Modal } from "@/components/admin/Modal";
import { FunnelChart } from "@/components/admin/Charts";

const STAGES: LeadStatus[] = ["new", "contacted", "trial", "enrolled", "lost"];
const OWNERS = ["Unassigned", "Qasim Shafiq Mir", "Bilal Ahmed", "Ayesha Siddiqa"];

/** One row shape for both demo and live leads, so the table has one code path. */
type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  course: string;
  teacherPreference?: string;
  status: LeadStatus;
  owner: string;
  note?: string;
  created: string;
  /** Live rows are backed by Firestore; demo rows are local only. */
  live: boolean;
};

function fromStored(l: StoredLead): Row {
  return {
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    country: l.country,
    course: l.course ?? "",
    teacherPreference: l.teacherPreference,
    status: l.status as LeadStatus,
    owner: l.owner ?? "Unassigned",
    note: l.note,
    created: l.createdAt ? l.createdAt.toLocaleDateString("en-GB") : "—",
    live: true,
  };
}

function fromDemo(l: Lead): Row {
  return {
    id: l.id, name: l.name, email: l.email, phone: l.phone,
    country: l.country, course: l.course, status: l.status,
    owner: l.owner, created: l.created, live: false,
  };
}

export default function LeadsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [liveState, setLiveState] = useState<"loading" | "ok" | "denied" | "error">("loading");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setSession(getSession());
    void load();
  }, []);

  /** Demo rows always render; live rows are merged in when readable. */
  async function load() {
    setLiveState("loading");
    const demo = seed.map(fromDemo);
    try {
      const live = (await listLeads()).map(fromStored);
      setRows([...live, ...demo]);
      setLiveState("ok");
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      setRows(demo);
      setLiveState(code === "permission-denied" ? "denied" : "error");
    }
  }

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 3500);
  }

  const canManage = session?.role === "admin" || session?.role === "principal";

  const filtered = useMemo(
    () =>
      rows.filter((l) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.country.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || l.status === statusFilter;
        return matchesQuery && matchesStatus;
      }),
    [rows, query, statusFilter],
  );

  async function changeStatus(lead: Row, status: LeadStatus) {
    setRows((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    if (!lead.live) return flash(`${lead.name} moved to ${status}.`);
    try {
      await updateLeadStatus(lead.id, status);
      flash(`${lead.name} moved to ${status}.`);
    } catch {
      flash("Could not save — staff sign-in required.");
      void load();
    }
  }

  async function saveEdit(next: Row) {
    setRows((prev) => prev.map((l) => (l.id === next.id ? next : l)));
    setEditing(null);
    if (!next.live) return flash(`Saved ${next.name}.`);
    try {
      await updateLead(next.id, {
        name: next.name,
        email: next.email,
        phone: next.phone,
        country: next.country,
        course: next.course,
        teacherPreference: next.teacherPreference,
        status: next.status,
        owner: next.owner,
        note: next.note ?? "",
      });
      flash(`Saved ${next.name}.`);
    } catch {
      flash("Could not save — staff sign-in required.");
      void load();
    }
  }

  async function confirmDelete() {
    const lead = deleting;
    if (!lead) return;
    setRows((prev) => prev.filter((l) => l.id !== lead.id));
    if (!lead.live) return flash(`${lead.name} removed.`);
    try {
      await deleteLead(lead.id);
      flash(`${lead.name} permanently deleted.`);
    } catch {
      flash("Could not delete — staff sign-in required.");
      void load();
    }
  }

  const counts = Object.fromEntries(
    STAGES.map((s) => [s, rows.filter((l) => l.status === s).length]),
  );

  return (
    <AdminPage
      title="Leads"
      description="Trial registrations from the website, and their progress to enrolment."
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
            Website registrations are being saved, but the security rules only
            release them to an authenticated staff account. Connect Firebase Auth
            and they will appear here automatically.
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

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Panel title="Conversion funnel" description="Last 90 days">
          <FunnelChart data={enrolmentFunnel} caption="Enrolment funnel by stage" />
        </Panel>

        <Panel bodyClassName="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, phone or country"
                aria-label="Search leads"
                className={`${inputClass} pl-9`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className={`${inputClass} sm:w-44`}
            >
              <option value="all">All statuses</option>
              {STAGES.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
        </Panel>
      </div>

      <Panel
        title={`${filtered.length} lead${filtered.length === 1 ? "" : "s"}`}
        description={liveState === "loading" ? "Loading live submissions…" : undefined}
        bodyClassName="p-0"
      >
        <Table
          head={["Lead", "Contact", "Country", "Course", "Owner", "Status", "Move to", "Actions"]}
          empty={filtered.length === 0}
        >
          {filtered.map((l) => (
            <Tr key={l.id}>
              <Td label="Lead">
                <p className="flex items-center gap-2 font-semibold text-ink">
                  {l.name}
                  {l.live && <Badge tone="green">Live</Badge>}
                </p>
                <p className="text-xs text-ink/55">{l.created}</p>
                {l.note && (
                  <p className="mt-1 max-w-[220px] truncate text-xs text-ink/60" title={l.note}>
                    {l.note}
                  </p>
                )}
              </Td>
              <Td label="Contact">
                <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 text-sm text-ink/80 hover:text-green-deep">
                  <Mail className="size-3.5" aria-hidden="true" />
                  {l.email}
                </a>
                <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/55 hover:text-green-deep">
                  <Phone className="size-3" aria-hidden="true" />
                  {l.phone}
                </a>
              </Td>
              <Td label="Country" className="text-ink/70">{l.country}</Td>
              <Td label="Course" className="text-ink/70">{l.course || "—"}</Td>
              <Td label="Owner" className="text-ink/70">{l.owner}</Td>
              <Td label="Status"><StatusBadge status={l.status} /></Td>
              <Td label="Move to">
                <select
                  value={l.status}
                  onChange={(e) => void changeStatus(l, e.target.value as LeadStatus)}
                  disabled={!canManage}
                  aria-label={`Change status for ${l.name}`}
                  className={`${inputClass} min-h-9 w-32 py-1 text-sm disabled:opacity-50`}
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </Td>
              <Td label="Actions">
                {canManage ? (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditing(l)}
                      aria-label={`Edit ${l.name}`}
                      title="Edit lead"
                      className="grid size-8 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void changeStatus(l, "enrolled")}
                      aria-label={`Mark ${l.name} enrolled`}
                      title="Mark enrolled"
                      className="grid size-8 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-white transition-colors hover:bg-cream-deep"
                    >
                      <UserPlus className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(l)}
                      aria-label={`Delete ${l.name}`}
                      title="Delete lead"
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

        {liveState === "ok" && rows.every((r) => !r.live) && (
          <div className="border-t-2 border-ink/12 py-8 text-center">
            <Inbox className="mx-auto size-7 text-ink/30" aria-hidden="true" />
            <p className="mt-2 font-semibold text-ink">No website submissions yet</p>
            <p className="mt-0.5 text-sm text-ink/60">
              New registrations appear here immediately.
            </p>
          </div>
        )}
      </Panel>

      <LeadForm
        lead={editing}
        onClose={() => setEditing(null)}
        onSave={(next) => void saveEdit(next)}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
        danger
        title={deleting ? `Delete ${deleting.name}?` : ""}
        confirmLabel="Delete permanently"
        body={
          deleting?.live
            ? `This permanently removes ${deleting.name}'s enquiry, including their contact details. This cannot be undone. If they have already enrolled, convert them to a student record instead.`
            : `This removes ${deleting?.name} from the list for this session.`
        }
      />
    </AdminPage>
  );
}

/* -------------------------------------------------------------------------- */

function LeadForm({
  lead,
  onClose,
  onSave,
}: {
  lead: Row | null;
  onClose: () => void;
  onSave: (l: Row) => void;
}) {
  const [form, setForm] = useState<Row | null>(lead);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(lead);
    setError("");
  }, [lead]);

  if (!lead || !form) return null;

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
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${lead.name}`}
      description={
        lead.live
          ? "Live website submission — changes are saved to the database."
          : "Demo record — changes last for this session only."
      }
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton form="lead-form" type="submit">Save changes</AdminButton>
        </>
      }
    >
      <form id="lead-form" onSubmit={submit} noValidate className="space-y-4">
        {error && (
          <p role="alert" className="rounded-xl border-2 border-red-700 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800">
            {error}
          </p>
        )}

        <Field label="Full name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email address" hint="Parents often mistype this.">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Phone number">
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country">
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Course of interest">
            <select
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              className={inputClass}
            >
              <option value="">Not sure yet</option>
              {courses.map((c) => (
                <option key={c.slug} value={c.title}>{c.title}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
              className={inputClass}
            >
              {STAGES.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Assigned to">
            <select
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
              className={inputClass}
            >
              {OWNERS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Follow-up note" hint="Internal only — never shown to the family.">
          <textarea
            rows={3}
            value={form.note ?? ""}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            maxLength={400}
            className={inputClass}
            placeholder="e.g. Called 18 Aug, prefers evening classes, will confirm Thursday."
          />
        </Field>
      </form>
    </Modal>
  );
}
