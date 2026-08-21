"use client";

import { useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { site } from "@/lib/content";
import { ROLE_NAV, type Role } from "@/lib/admin/auth";
import {
  AdminButton, AdminPage, Badge, Field, Panel, Table, Td, Tr, inputClass,
} from "@/components/admin/ui";

const TABS = ["organisation", "roles", "integrations", "audit"] as const;

const AUDIT = [
  { at: "2026-08-17 14:22", actor: "Qasim Shafiq Mir", action: "teacher.disable", entity: "T-106 Ustadha Hafsa Noor" },
  { at: "2026-08-17 13:05", actor: "Bilal Ahmed", action: "complaint.escalate", entity: "QM-2026-0041" },
  { at: "2026-08-17 11:48", actor: "Qasim Shafiq Mir", action: "user.impersonate", entity: "T-101 Ustadha Ayesha Siddiqa" },
  { at: "2026-08-17 09:30", actor: "System", action: "invoice.generate", entity: "42 invoices for Aug 2026" },
  { at: "2026-08-16 16:12", actor: "Bilal Ahmed", action: "leave.approve", entity: "LV-085" },
] as const;

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("organisation");
  const [toast, setToast] = useState("");

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 3000);
  }

  return (
    <AdminPage title="Settings" description="Organisation, roles, integrations and audit trail.">

      {toast && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      <Panel bodyClassName="p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Settings sections">
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

      {tab === "organisation" && (
        <Panel title="Organisation" description="These values appear across the public website.">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              flash("Organisation settings saved.");
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field label="Academy name"><input defaultValue={site.name} className={inputClass} /></Field>
            <Field label="Tagline"><input defaultValue={site.tagline} className={inputClass} /></Field>
            <Field label="Contact email"><input type="email" defaultValue={site.email} className={inputClass} /></Field>
            <Field label="Contact phone"><input type="tel" defaultValue={site.phone} className={inputClass} /></Field>
            <Field label="Default timezone">
              <select className={inputClass}>
                <option>Asia/Karachi</option><option>Europe/London</option>
                <option>America/New_York</option><option>Australia/Sydney</option>
              </select>
            </Field>
            <Field label="Default currency">
              <select className={inputClass}><option>USD</option><option>GBP</option></select>
            </Field>
            <div className="sm:col-span-2">
              <AdminButton type="submit">Save changes</AdminButton>
            </div>
          </form>
        </Panel>
      )}

      {tab === "roles" && (
        <Panel title="Roles & permissions" description="Which modules each role can reach.">
          <div className="overflow-x-auto">
            <Table head={["Role", "Portal", "Modules"]}>
              {(
                [
                  ["admin", "Super Admin"],
                  ["principal", "Principal"],
                  ["teacher", "Quran Teacher"],
                  ["student", "Student"],
                ] as [Role, string][]
              ).map(([role, title]) => (
                <Tr key={role}>
                  <Td label="Role" className="font-semibold capitalize">{role}</Td>
                  <Td label="Portal" className="text-ink/70">{title}</Td>
                  <Td label="Modules">
                    <div className="flex flex-wrap gap-1.5">
                      {ROLE_NAV[role].map((m) => (
                        <Badge key={m} tone="sage">{m}</Badge>
                      ))}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          </div>
          <p className="mt-5 flex items-start gap-2 rounded-xl border-2 border-ink bg-gold px-4 py-3 text-sm font-semibold text-ink">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Navigation is hidden per role for clarity, but the boundary is the
            Firestore security rules, which read each caller&rsquo;s role from
            their own profile. A user cannot change their own role.
          </p>
        </Panel>
      )}

      {tab === "integrations" && (
        <Panel title="Integrations">
          <ul className="space-y-3">
            {[
              ["Zoom", "Server-to-Server OAuth — creates meetings and records attendance", "Not connected"],
              ["Stripe", "Card payments and subscriptions", "Not connected"],
              ["Resend", "Transactional email", "Not connected"],
              ["Twilio", "SMS and WhatsApp reminders", "Not connected"],
              ["Firebase Auth", "Portal authentication", "Pending — demo auth in use"],
              ["Firestore", "Application database", "Connected"],
            ].map(([name, desc, status]) => (
              <li key={name} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink/15 bg-cream px-4 py-3">
                <div>
                  <p className="font-semibold text-ink">{name}</p>
                  <p className="text-sm text-ink/65">{desc}</p>
                </div>
                <Badge tone={status === "Connected" ? "green" : status.startsWith("Pending") ? "gold" : "neutral"}>
                  {status}
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === "audit" && (
        <Panel title="Audit log" description="Every privileged action is recorded." bodyClassName="p-0">
          <Table head={["When", "Actor", "Action", "Entity"]}>
            {AUDIT.map((a) => (
              <Tr key={a.at}>
                <Td label="When" className="font-mono text-xs text-ink/70">{a.at}</Td>
                <Td label="Actor" className="font-semibold">{a.actor}</Td>
                <Td label="Action"><Badge tone={a.action.includes("impersonate") ? "gold" : "sage"}>{a.action}</Badge></Td>
                <Td label="Entity" className="text-ink/70">{a.entity}</Td>
              </Tr>
            ))}
          </Table>
        </Panel>
      )}
    </AdminPage>
  );
}
