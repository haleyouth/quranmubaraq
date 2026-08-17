"use client";

import { useState } from "react";
import { CheckCircle2, Mail, Phone } from "lucide-react";
import { leads as seed, type Lead, type LeadStatus } from "@/lib/admin/demo-data";
import {
  AdminButton, AdminPage, DemoNotice, Panel, StatusBadge, Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { FunnelChart } from "@/components/admin/Charts";
import { enrolmentFunnel } from "@/lib/admin/demo-data";

const STAGES: LeadStatus[] = ["new", "contacted", "trial", "enrolled", "lost"];

export default function LeadsPage() {
  const [rows, setRows] = useState<Lead[]>([...seed]);
  const [toast, setToast] = useState("");

  function advance(lead: Lead, status: LeadStatus) {
    setRows((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    setToast(`${lead.name} moved to ${status}.`);
    window.setTimeout(() => setToast(""), 3000);
  }

  return (
    <AdminPage
      title="Leads"
      description="Trial registrations from the website, and their progress to enrolment."
    >
      <DemoNotice>
        Demo data. Live registrations from the website write to the Firestore{" "}
        <code className="font-mono">leads</code> collection and will appear here once the
        CRM backend is connected.
      </DemoNotice>

      {toast && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Panel title="Conversion funnel" description="Last 90 days">
          <FunnelChart data={enrolmentFunnel} caption="Enrolment funnel by stage" />
        </Panel>

        <Panel title="Pipeline by stage" bodyClassName="p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {STAGES.map((s) => {
              const n = rows.filter((l) => l.status === s).length;
              return (
                <div key={s} className="rounded-xl border-2 border-ink bg-cream p-3 text-center">
                  <p className="font-display text-2xl text-ink">{n}</p>
                  <p className="mt-0.5 text-xs font-bold text-ink/60 capitalize">{s}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel title={`${rows.length} leads`} bodyClassName="p-0">
        <Table head={["Lead", "Contact", "Country", "Course", "Owner", "Status", "Move to"]}>
          {rows.map((l) => (
            <Tr key={l.id}>
              <Td>
                <p className="font-semibold text-ink">{l.name}</p>
                <p className="text-xs text-ink/55">{l.id} · {l.created}</p>
              </Td>
              <Td>
                <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 text-sm text-ink/80 hover:text-green-deep">
                  <Mail className="size-3.5" aria-hidden="true" />
                  {l.email}
                </a>
                <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/55 hover:text-green-deep">
                  <Phone className="size-3" aria-hidden="true" />
                  {l.phone}
                </a>
              </Td>
              <Td className="text-ink/70">{l.country}</Td>
              <Td className="text-ink/70">{l.course}</Td>
              <Td className="text-ink/70">{l.owner}</Td>
              <Td><StatusBadge status={l.status} /></Td>
              <Td>
                <select
                  value={l.status}
                  onChange={(e) => advance(l, e.target.value as LeadStatus)}
                  aria-label={`Change status for ${l.name}`}
                  className={`${inputClass} min-h-9 w-36 py-1 text-sm`}
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </AdminPage>
  );
}
