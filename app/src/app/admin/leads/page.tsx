"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Inbox, Mail, Phone, RefreshCw, TriangleAlert } from "lucide-react";
import { leads as seed, type Lead, type LeadStatus } from "@/lib/admin/demo-data";
import { listLeads, updateLeadStatus, type StoredLead } from "@/lib/leads";
import {
  AdminButton, AdminPage, DemoNotice, Panel, StatusBadge, Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { FunnelChart } from "@/components/admin/Charts";
import { enrolmentFunnel } from "@/lib/admin/demo-data";

const STAGES: LeadStatus[] = ["new", "contacted", "trial", "enrolled", "lost"];

export default function LeadsPage() {
  const [rows, setRows] = useState<Lead[]>([...seed]);
  const [toast, setToast] = useState("");

  // Real website submissions from Firestore
  const [live, setLive] = useState<StoredLead[]>([]);
  const [liveState, setLiveState] = useState<"loading" | "ok" | "denied" | "error">(
    "loading",
  );

  async function loadLive() {
    setLiveState("loading");
    try {
      setLive(await listLeads());
      setLiveState("ok");
    } catch (err) {
      // Rules deny reads until a real staff session exists — expected for now
      const code = (err as { code?: string })?.code ?? "";
      setLiveState(code === "permission-denied" ? "denied" : "error");
    }
  }

  useEffect(() => {
    loadLive();
  }, []);

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 3000);
  }

  function advance(lead: Lead, status: LeadStatus) {
    setRows((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    flash(`${lead.name} moved to ${status}.`);
  }

  async function advanceLive(lead: StoredLead, status: LeadStatus) {
    try {
      await updateLeadStatus(lead.id, status);
      setLive((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status } : l)),
      );
      flash(`${lead.name} moved to ${status}.`);
    } catch {
      flash("Could not update — staff sign-in required.");
    }
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

      {/* Real submissions from the website registration form */}
      <Panel
        title="Website submissions"
        description="Live registrations from the public form, newest first."
        actions={
          <AdminButton size="sm" variant="outline" onClick={loadLive}>
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Refresh
          </AdminButton>
        }
        bodyClassName={liveState === "ok" && live.length > 0 ? "p-0" : undefined}
      >
        {liveState === "loading" && (
          <p className="py-6 text-center text-ink/60">Loading submissions&hellip;</p>
        )}

        {liveState === "denied" && (
          <div className="flex items-start gap-3 rounded-xl border-2 border-ink bg-gold px-4 py-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden="true" />
            <div className="text-sm text-ink">
              <p className="font-bold">Staff sign-in required to read submissions.</p>
              <p className="mt-1">
                Registrations from the website are being saved to Firestore, but the
                security rules only release them to an authenticated staff account.
                Connect Firebase Auth (CRM plan §5.1) and this table will populate
                automatically — no further code changes needed.
              </p>
            </div>
          </div>
        )}

        {liveState === "error" && (
          <p className="rounded-xl border-2 border-ink bg-cream-deep px-4 py-3 text-sm font-semibold text-ink">
            Could not reach Firestore. Check the Firebase configuration in{" "}
            <code className="font-mono">.env.local</code>.
          </p>
        )}

        {liveState === "ok" && live.length === 0 && (
          <div className="py-10 text-center">
            <Inbox className="mx-auto size-8 text-ink/35" aria-hidden="true" />
            <p className="mt-3 font-semibold text-ink">No submissions yet</p>
            <p className="mt-1 text-sm text-ink/60">
              New registrations from the website will appear here immediately.
            </p>
          </div>
        )}

        {liveState === "ok" && live.length > 0 && (
          <Table head={["Submitted", "Name", "Contact", "Country", "Course", "Status", "Move to"]}>
            {live.map((l) => (
              <Tr key={l.id}>
                <Td className="text-xs text-ink/60">
                  {l.createdAt ? l.createdAt.toLocaleString("en-GB") : "—"}
                </Td>
                <Td className="font-semibold">{l.name}</Td>
                <Td>
                  <a href={`mailto:${l.email}`} className="block text-sm text-ink/80 hover:text-green-deep">
                    {l.email}
                  </a>
                  <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="text-xs text-ink/55 hover:text-green-deep">
                    {l.phone}
                  </a>
                </Td>
                <Td className="text-ink/70">{l.country}</Td>
                <Td className="text-ink/70">{l.course || "—"}</Td>
                <Td><StatusBadge status={l.status} /></Td>
                <Td>
                  <select
                    value={l.status}
                    onChange={(e) => advanceLive(l, e.target.value as LeadStatus)}
                    aria-label={`Change status for ${l.name}`}
                    className={`${inputClass} min-h-9 w-36 py-1 text-sm`}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title={`${rows.length} demo leads`} bodyClassName="p-0">
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
