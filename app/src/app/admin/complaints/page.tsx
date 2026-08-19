"use client";

import { useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { complaints as seed, type Complaint, type ComplaintStatus } from "@/lib/admin/demo-data";
import {
  AdminButton, AdminPage, Badge, Field, Panel, StatTile,
  StatusBadge, Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";

const CATEGORIES = [
  "Teaching Quality", "Punctuality", "Technical", "Billing",
  "Behaviour", "Scheduling", "Facilities", "Other",
];

export default function ComplaintsPage() {
  const [rows, setRows] = useState<Complaint[]>([...seed]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Complaint | null>(null);
  const [toast, setToast] = useState("");

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 3000);
  }

  function setStatus(c: Complaint, status: ComplaintStatus) {
    setRows((prev) => prev.map((r) => (r.id === c.id ? { ...r, status } : r)));
    flash(`${c.id} marked ${status}.`);
  }

  const openCount = rows.filter((c) => c.status === "open" || c.status === "in-review").length;
  const urgent = rows.filter((c) => c.priority === "urgent").length;
  const escalated = rows.filter((c) => c.status === "escalated").length;
  const resolved = rows.filter((c) => c.status === "resolved").length;

  return (
    <AdminPage
      title="Complaints"
      description="Cases raised by parents, students and teachers, with SLA tracking."
      actions={
        <AdminButton onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Log complaint
        </AdminButton>
      }
    >

      {toast && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        <StatTile label="Open cases" value={String(openCount)} delta="Awaiting action" />
        <StatTile label="Urgent" value={String(urgent)} delta="2h SLA" trend="down" />
        <StatTile label="Escalated" value={String(escalated)} delta="Needs principal" trend="down" />
        <StatTile label="Resolved" value={String(resolved)} delta="This month" trend="up" />
      </div>

      <Panel title={`${rows.length} complaints`} bodyClassName="p-0">
        <Table head={["Ticket", "Subject", "Category", "Raised by", "Priority", "Status", "SLA", "Actions"]}>
          {rows.map((c) => (
            <Tr key={c.id}>
              <Td label="Ticket" className="font-mono text-xs">{c.id}</Td>
              <Td label="Subject">
                <button
                  type="button"
                  onClick={() => setDetail(c)}
                  className="cursor-pointer text-left font-semibold text-ink underline decoration-teal decoration-2 underline-offset-4 hover:text-green-deep"
                >
                  {c.subject}
                </button>
                {c.against !== "—" && (
                  <p className="text-xs text-ink/55">Against: {c.against}</p>
                )}
              </Td>
              <Td label="Category"><Badge tone="sage">{c.category}</Badge></Td>
              <Td label="Raised by" className="text-ink/70">{c.raisedBy}</Td>
              <Td label="Priority"><StatusBadge status={c.priority} /></Td>
              <Td label="Status"><StatusBadge status={c.status} /></Td>
              <Td label="SLA" className={c.sla.includes("min") ? "font-bold text-red-700" : "text-ink/65"}>
                {c.sla}
              </Td>
              <Td label="Actions">
                <select
                  value={c.status}
                  onChange={(e) => setStatus(c, e.target.value as ComplaintStatus)}
                  aria-label={`Change status for ${c.id}`}
                  className={`${inputClass} min-h-9 w-32 py-1 text-sm`}
                >
                  <option value="open">Open</option>
                  <option value="in-review">In review</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      {/* Detail */}
      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.subject ?? ""}
        description={detail ? `${detail.id} · ${detail.category}` : undefined}
        footer={<AdminButton variant="outline" onClick={() => setDetail(null)}>Close</AdminButton>}
      >
        {detail && (
          <dl className="space-y-3 text-sm">
            {[
              ["Raised by", detail.raisedBy],
              ["Against", detail.against],
              ["Priority", detail.priority],
              ["Status", detail.status],
              ["Assignee", detail.assignee],
              ["Created", detail.created],
              ["SLA", detail.sla],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b-2 border-ink/10 pb-2">
                <dt className="font-bold text-ink/60">{k}</dt>
                <dd className="text-right text-ink capitalize">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>

      {/* New complaint */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Log a complaint"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton
              onClick={() => {
                setOpen(false);
                flash("Complaint logged and assigned a ticket number.");
              }}
            >
              Create ticket
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Subject">
            <input className={inputClass} placeholder="Short summary of the issue" />
          </Field>
          <Field label="Category">
            <select className={inputClass}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Priority" hint="Sets the first-response SLA: Urgent 2h, High 6h, Medium 24h, Low 72h.">
            <select className={inputClass}>
              <option>Low</option><option>Medium</option>
              <option>High</option><option>Urgent</option>
            </select>
          </Field>
          <Field label="Description">
            <textarea rows={4} className={inputClass} placeholder="What happened?" />
          </Field>
        </div>
      </Modal>
    </AdminPage>
  );
}
