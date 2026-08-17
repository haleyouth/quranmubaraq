"use client";

import { useState } from "react";
import { CheckCircle2, Download, FileText } from "lucide-react";
import {
  AdminButton, AdminPage, DemoNotice, Panel, Table, Td, Tr, inputClass,
} from "@/components/admin/ui";

const REPORTS = [
  { name: "Attendance summary", desc: "Attendance rates by student, teacher, course and branch.", cat: "Operations" },
  { name: "Attendance exceptions", desc: "No-shows, chronic absence and unexplained gaps.", cat: "Operations" },
  { name: "Teacher utilisation", desc: "Hours taught against capacity, per teacher.", cat: "Staff" },
  { name: "Teacher performance", desc: "Punctuality, retention and parent ratings.", cat: "Staff" },
  { name: "Student progress", desc: "Surah and juz progression with Tajweed ratings.", cat: "Academic" },
  { name: "Enrolment funnel", desc: "Lead to enrolment conversion by source and owner.", cat: "Growth" },
  { name: "Revenue & collections", desc: "Invoiced, collected and outstanding by period.", cat: "Finance" },
  { name: "Ageing / arrears", desc: "Outstanding balances bucketed by age.", cat: "Finance" },
  { name: "Teacher payouts", desc: "Sessions taught, gross, deductions and net.", cat: "Finance" },
  { name: "Leave & cover", desc: "Leave taken by type, and substitute cover rate.", cat: "Staff" },
  { name: "Complaints & SLA", desc: "Volume by category with resolution times.", cat: "Quality" },
  { name: "Churn & retention", desc: "Withdrawals by cohort with stated reasons.", cat: "Growth" },
] as const;

export default function ReportsPage() {
  const [toast, setToast] = useState("");
  const [cat, setCat] = useState("all");

  const cats = ["all", ...Array.from(new Set(REPORTS.map((r) => r.cat)))];
  const shown = cat === "all" ? REPORTS : REPORTS.filter((r) => r.cat === cat);

  function run(name: string) {
    setToast(`"${name}" generated — download will begin shortly.`);
    window.setTimeout(() => setToast(""), 3500);
  }

  return (
    <AdminPage
      title="Reports"
      description="Standard report library, filterable and exportable."
    >
      <DemoNotice />

      {toast && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      <Panel bodyClassName="p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-bold text-ink">Category</span>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className={inputClass}>
              {cats.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c === "all" ? "All categories" : c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink">From</span>
            <input type="date" defaultValue="2026-08-01" className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink">To</span>
            <input type="date" defaultValue="2026-08-17" className={inputClass} />
          </label>
        </div>
      </Panel>

      <Panel title={`${shown.length} reports`} bodyClassName="p-0">
        <Table head={["Report", "Category", "Description", "Export"]}>
          {shown.map((r) => (
            <Tr key={r.name}>
              <Td>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-ink bg-green">
                    <FileText className="size-4 text-white" aria-hidden="true" />
                  </span>
                  <span className="font-semibold text-ink">{r.name}</span>
                </div>
              </Td>
              <Td className="text-ink/70">{r.cat}</Td>
              <Td className="text-ink/65">{r.desc}</Td>
              <Td>
                <div className="flex gap-1.5">
                  <AdminButton size="sm" variant="outline" onClick={() => run(r.name)}>
                    <Download className="size-3.5" aria-hidden="true" />
                    CSV
                  </AdminButton>
                  <AdminButton size="sm" variant="outline" onClick={() => run(r.name)}>
                    PDF
                  </AdminButton>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </AdminPage>
  );
}
