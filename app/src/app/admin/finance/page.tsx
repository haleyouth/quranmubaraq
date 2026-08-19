"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, Send } from "lucide-react";
import { invoices as invSeed, payouts as poSeed, revenueByMonth, type Invoice } from "@/lib/admin/demo-data";
import { plans } from "@/lib/content";
import { getSession, type Session } from "@/lib/admin/demo-auth";
import {
  AdminButton, AdminPage, Panel, StatTile, StatusBadge, Table, Td, Tr,
} from "@/components/admin/ui";
import { LineChart } from "@/components/admin/Charts";

const TABS = ["invoices", "payouts", "plans"] as const;

export default function FinancePage() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => setSession(getSession()), []);

  const [tab, setTab] = useState<(typeof TABS)[number]>("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>([...invSeed]);
  const [toast, setToast] = useState("");

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 3000);
  }

  function markPaid(inv: Invoice) {
    setInvoices((prev) =>
      prev.map((i) => (i.id === inv.id ? { ...i, status: "paid", method: "Bank" } : i)),
    );
    flash(`${inv.id} marked paid.`);
  }

  // Nav hiding is not a boundary — guard the page itself. Students and
  // teachers have no business in the academy ledger.
  const allowed = session?.role === "admin" || session?.role === "principal";

  const outstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((a, i) => a + Number(i.amount), 0);
  const overdue = invoices.filter((i) => i.status === "overdue").length;

  if (session && !allowed) {
    return (
      <AdminPage title="Finance" description="Restricted area.">
        <Panel title="Not available">
          <p className="py-6 text-center text-ink/70">
            Finance is limited to administration and principals. Your own
            invoices are shown on your dashboard.
          </p>
        </Panel>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Finance"
      description="Invoices, payments, teacher payouts and fee plans."
      actions={
        <AdminButton variant="outline" onClick={() => flash("Export queued — CSV will download.")}>
          <Download className="size-4" aria-hidden="true" />
          Export
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
        <StatTile label="Revenue MTD" value="$11,240" delta="+8% vs July" trend="up" />
        <StatTile label="Outstanding" value={`$${outstanding.toFixed(2)}`} delta={`${overdue} overdue`} trend="down" />
        <StatTile label="Collection rate" value="91%" delta="+3%" trend="up" />
        <StatTile label="Teacher cost" value="$2,465" delta="22% of revenue" />
      </div>

      <Panel title="Revenue" description="Last 12 months (USD)">
        <LineChart
          data={revenueByMonth}
          labelKey="month"
          valueKey="value"
          prefix="$"
          caption="Monthly revenue over the last 12 months"
        />
      </Panel>

      <Panel bodyClassName="p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Finance sections">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`min-h-9 cursor-pointer rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold capitalize transition-colors ${
                tab === t ? "bg-green-deep text-white" : "bg-white text-ink hover:bg-cream-deep"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Panel>

      {tab === "invoices" && (
        <Panel title={`${invoices.length} invoices`} bodyClassName="p-0">
          <Table head={["Invoice", "Student", "Period", "Amount", "Due", "Method", "Status", "Actions"]}>
            {invoices.map((i) => (
              <Tr key={i.id}>
                <Td label="Invoice" className="font-mono text-xs">{i.id}</Td>
                <Td label="Student" className="font-semibold">{i.student}</Td>
                <Td label="Period" className="text-ink/70">{i.period}</Td>
                <Td label="Amount" className="font-semibold">{i.currency} {i.amount}</Td>
                <Td label="Due" className={i.status === "overdue" ? "font-bold text-red-700" : "text-ink/65"}>
                  {i.due}
                </Td>
                <Td label="Method" className="text-ink/65">{i.method}</Td>
                <Td label="Status"><StatusBadge status={i.status} /></Td>
                <Td label="Actions">
                  <div className="flex gap-1.5">
                    {i.status !== "paid" && (
                      <>
                        <AdminButton size="sm" onClick={() => markPaid(i)}>
                          Mark paid
                        </AdminButton>
                        <AdminButton
                          size="sm"
                          variant="outline"
                          onClick={() => flash(`Reminder sent for ${i.id}.`)}
                        >
                          <Send className="size-3.5" aria-hidden="true" />
                          Remind
                        </AdminButton>
                      </>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        </Panel>
      )}

      {tab === "payouts" && (
        <Panel title="Teacher payouts" description="Calculated from sessions actually taught." bodyClassName="p-0">
          <Table head={["Ref", "Teacher", "Period", "Sessions", "Hours", "Gross", "Net", "Status"]}>
            {poSeed.map((p) => (
              <Tr key={p.id}>
                <Td label="Ref" className="font-mono text-xs">{p.id}</Td>
                <Td label="Teacher" className="font-semibold">{p.teacher}</Td>
                <Td label="Period" className="text-ink/70">{p.period}</Td>
                <Td label="Sessions">{p.sessions}</Td>
                <Td label="Hours">{p.hours}h</Td>
                <Td label="Gross">${p.gross}</Td>
                <Td label="Net" className="font-semibold">${p.net}</Td>
                <Td label="Status"><StatusBadge status={p.status} /></Td>
              </Tr>
            ))}
          </Table>
        </Panel>
      )}

      {tab === "plans" && (
        <Panel title="Fee plans" description="These values drive the public fees page.">
          <div className="grid gap-5 sm:grid-cols-3">
            {plans.map((p) => (
              <div key={p.name} className="rounded-2xl border-2 border-ink bg-cream p-5">
                <p className="font-display text-lg text-ink">{p.name}</p>
                <p className="font-display mt-2 text-3xl text-green-deep">
                  ${p.usd}
                  <span className="text-base text-ink/55"> / £{p.gbp}</span>
                </p>
                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-ink/60">Length</dt><dd>{p.classLength}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink/60">Frequency</dt><dd>{p.frequency}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink/60">Admission</dt><dd>{p.admission}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink/60">Sibling</dt><dd>{p.sibling}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </AdminPage>
  );
}
