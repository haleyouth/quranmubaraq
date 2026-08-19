"use client";

import { useState } from "react";
import { CheckCircle2, FileText, Plus } from "lucide-react";
import { policies } from "@/lib/admin/demo-data";
import {
  AdminButton, AdminPage, Badge, Field, Panel, StatTile,
  Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";

export default function PoliciesPage() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 3000);
  }

  const outstanding = policies.reduce((a, p) => a + (p.total - p.acknowledged), 0);

  return (
    <AdminPage
      title="Rules & Regulations"
      description="Policy documents, versions and acknowledgment tracking."
      actions={
        <AdminButton onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          New policy
        </AdminButton>
      }
    >

      {toast && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Published policies" value={String(policies.length)} />
        <StatTile label="Awaiting acknowledgment" value={String(outstanding)} delta="Across all staff" trend="down" />
        <StatTile label="Fully acknowledged" value={String(policies.filter((p) => p.acknowledged === p.total).length)} trend="up" />
        <StatTile label="Staff covered" value="19" delta="All teachers" />
      </div>

      <Panel title={`${policies.length} policies`} bodyClassName="p-0">
        <Table head={["Policy", "Category", "Version", "Audience", "Acknowledged", "Updated", "Actions"]}>
          {policies.map((p) => {
            const pct = Math.round((p.acknowledged / p.total) * 100);
            return (
              <Tr key={p.id}>
                <Td label="Policy">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-ink bg-green">
                      <FileText className="size-4 text-white" aria-hidden="true" />
                    </span>
                    <span className="font-semibold text-ink">{p.title}</span>
                  </div>
                </Td>
                <Td label="Category"><Badge tone="sage">{p.category}</Badge></Td>
                <Td label="Version">v{p.version}</Td>
                <Td label="Audience" className="text-ink/70">{p.audience}</Td>
                <Td label="Acknowledged">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full border border-ink bg-cream">
                      <div
                        className={pct === 100 ? "h-full bg-green" : "h-full bg-gold"}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold">{p.acknowledged}/{p.total}</span>
                  </div>
                </Td>
                <Td label="Updated" className="text-ink/65">{p.updated}</Td>
                <Td label="Actions">
                  {p.acknowledged < p.total && (
                    <AdminButton size="sm" variant="outline" onClick={() => flash(`Reminder sent for "${p.title}".`)}>
                      Remind
                    </AdminButton>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Table>
      </Panel>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New policy"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={() => { setOpen(false); flash("Policy created as a draft."); }}>
              Create policy
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title"><input className={inputClass} placeholder="e.g. Online Class Etiquette" /></Field>
          <Field label="Category">
            <select className={inputClass}>
              <option>Safeguarding</option><option>Conduct</option>
              <option>Operations</option><option>Finance</option>
            </select>
          </Field>
          <Field label="Audience">
            <select className={inputClass}>
              <option>All</option><option>All staff</option>
              <option>Teachers</option><option>Students</option>
            </select>
          </Field>
          <Field label="Content"><textarea rows={5} className={inputClass} placeholder="Policy text…" /></Field>
          <label className="flex items-center gap-3 rounded-xl border-2 border-ink/15 bg-cream p-3">
            <input type="checkbox" defaultChecked className="size-4 accent-green-deep" />
            <span className="text-sm font-semibold text-ink">
              Require acknowledgment from the selected audience
            </span>
          </label>
        </div>
      </Modal>
    </AdminPage>
  );
}
