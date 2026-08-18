"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Download, Eye, FileText, Printer, Send } from "lucide-react";
import { getSession, type Session } from "@/lib/admin/demo-auth";
import { site } from "@/lib/content";
import {
  REPORTS, buildReport, downloadCsv, type ReportData, type ReportDef,
} from "@/lib/admin/reports";
import { addDays } from "@/lib/admin/schedule";
import {
  AdminButton, AdminPage, Badge, DemoNotice, Panel, StatTile,
  Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";

/** Requests from students awaiting principal approval before release. */
type Request = {
  id: string;
  student: string;
  report: string;
  requested: string;
  status: "pending" | "approved" | "declined";
};

const SEED_REQUESTS: Request[] = [
  { id: "RR-014", student: "Yusuf Ibrahim", report: "Student Progress Report", requested: "2026-08-16", status: "pending" },
  { id: "RR-013", student: "Maryam Khan", report: "Attendance Summary", requested: "2026-08-15", status: "approved" },
  { id: "RR-012", student: "Ahmad Raza", report: "Student Progress Report", requested: "2026-08-12", status: "approved" },
];

export default function ReportsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [cat, setCat] = useState("all");
  // Empty until mount, else the export would ship build-time dates
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [preview, setPreview] = useState<{ def: ReportDef; data: ReportData } | null>(null);
  const [requests, setRequests] = useState<Request[]>(SEED_REQUESTS);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setSession(getSession());
    const now = new Date();
    setFrom(addDays(now, -30).toISOString().slice(0, 10));
    setTo(now.toISOString().slice(0, 10));
  }, []);

  const isStudent = session?.role === "student";
  const isPrincipal = session?.role === "principal" || session?.role === "admin";

  const available = useMemo(
    () => REPORTS.filter((r) => (isStudent ? r.studentVisible : true)),
    [isStudent],
  );

  const cats = ["all", ...Array.from(new Set(available.map((r) => r.category)))];
  const shown = cat === "all" ? available : available.filter((r) => r.category === cat);

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 3500);
  }

  function run(def: ReportDef) {
    const data = buildReport(def.key, {
      from: new Date(`${from}T00:00:00`),
      to: new Date(`${to}T23:59:59`),
      studentName: isStudent ? session?.name : undefined,
    });
    setPreview({ def, data });
  }

  function approve(r: Request, status: Request["status"]) {
    setRequests((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)));
    flash(
      status === "approved"
        ? `${r.report} released to ${r.student}.`
        : `Request from ${r.student} declined.`,
    );
  }

  const myApproved = requests.filter(
    (r) => r.student === session?.name && r.status === "approved",
  );

  return (
    <AdminPage
      title="Reports"
      description={
        isStudent
          ? "Request a report. Once your principal approves it, you can view and download it here."
          : "Generate, preview and export reports across the academy."
      }
    >
      <DemoNotice />

      {toast && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      {/* Principal approval queue */}
      {isPrincipal && (
        <Panel
          title="Report requests"
          description="Students cannot download a report until it is approved here."
          bodyClassName="p-0"
        >
          <Table head={["Ref", "Student", "Report", "Requested", "Status", "Action"]}>
            {requests.map((r) => (
              <Tr key={r.id}>
                <Td label="Ref" className="font-mono text-xs">{r.id}</Td>
                <Td label="Student" className="font-semibold">{r.student}</Td>
                <Td label="Report" className="text-ink/70">{r.report}</Td>
                <Td label="Requested" className="text-ink/65">{r.requested}</Td>
                <Td label="Status">
                  <Badge
                    tone={
                      r.status === "approved" ? "green"
                      : r.status === "declined" ? "danger" : "gold"
                    }
                  >
                    {r.status}
                  </Badge>
                </Td>
                <Td label="Action">
                  {r.status === "pending" && (
                    <div className="flex flex-wrap gap-1.5">
                      <AdminButton size="sm" onClick={() => approve(r, "approved")}>
                        Approve
                      </AdminButton>
                      <AdminButton size="sm" variant="danger" onClick={() => approve(r, "declined")}>
                        Decline
                      </AdminButton>
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
          </Table>
        </Panel>
      )}

      {/* Student's approved reports */}
      {isStudent && (
        <Panel
          title="Approved for you"
          description={
            myApproved.length
              ? "These reports have been approved and are ready to view."
              : "No reports approved yet. Request one below."
          }
          bodyClassName={myApproved.length ? "p-0" : undefined}
        >
          {myApproved.length > 0 ? (
            <Table head={["Report", "Approved", "Action"]}>
              {myApproved.map((r) => {
                const def = REPORTS.find((d) => d.name === r.report);
                return (
                  <Tr key={r.id}>
                    <Td label="Report" className="font-semibold">{r.report}</Td>
                    <Td label="Approved" className="text-ink/65">{r.requested}</Td>
                    <Td label="Action">
                      {def && (
                        <AdminButton size="sm" onClick={() => run(def)}>
                          <Eye className="size-3.5" aria-hidden="true" />
                          View
                        </AdminButton>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Table>
          ) : (
            <p className="py-4 text-center text-ink/60">
              Your principal releases reports once approved.
            </p>
          )}
        </Panel>
      )}

      {/* Filters */}
      <Panel bodyClassName="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block lg:col-span-2">
            <span className="mb-1.5 block text-sm font-bold text-ink">Category</span>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className={inputClass}>
              {cats.map((c) => (
                <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink">From</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink">To</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
          </label>
        </div>
      </Panel>

      <Panel title={`${shown.length} reports`} bodyClassName="p-0">
        <Table head={["Report", "Category", "Description", "Actions"]}>
          {shown.map((r) => (
            <Tr key={r.key}>
              <Td label="Report">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-ink bg-green">
                    <FileText className="size-4 text-white" aria-hidden="true" />
                  </span>
                  <span className="font-semibold text-ink">{r.name}</span>
                </div>
              </Td>
              <Td label="Category" className="text-ink/70">{r.category}</Td>
              <Td label="Description" className="text-ink/65">{r.description}</Td>
              <Td label="Actions">
                <div className="flex flex-wrap gap-1.5">
                  <AdminButton size="sm" onClick={() => run(r)}>
                    <Eye className="size-3.5" aria-hidden="true" />
                    Preview
                  </AdminButton>
                  {isStudent && (
                    <AdminButton
                      size="sm"
                      variant="outline"
                      onClick={() => flash(`Request for "${r.name}" sent for approval.`)}
                    >
                      <Send className="size-3.5" aria-hidden="true" />
                      Request
                    </AdminButton>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      {/* Branded preview */}
      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.data.title ?? ""}
        description={preview?.data.subtitle}
        size="lg"
        footer={
          preview && (
            <>
              <AdminButton variant="outline" onClick={() => setPreview(null)}>Close</AdminButton>
              <AdminButton variant="outline" onClick={() => window.print()}>
                <Printer className="size-4" aria-hidden="true" />
                Print / PDF
              </AdminButton>
              <AdminButton
                onClick={() => {
                  downloadCsv(preview.data, `${preview.def.key}-${from}-to-${to}.csv`);
                  flash("CSV downloaded.");
                }}
              >
                <Download className="size-4" aria-hidden="true" />
                Download CSV
              </AdminButton>
            </>
          )
        }
      >
        {preview && (
          <div id="report-print" className="space-y-5">
            {/* Letterhead */}
            <header className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-ink pb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-xl border-2 border-ink bg-ink px-3 py-2">
                  <Image
                    src="/brand/logo.png"
                    alt={site.name}
                    width={110}
                    height={58}
                    className="h-auto w-[110px]"
                  />
                </span>
                <div>
                  <p className="font-display text-lg text-ink">{site.name}</p>
                  <p className="text-xs text-ink/60">{site.tagline}</p>
                </div>
              </div>
              <div className="text-right text-xs text-ink/60">
                <p className="font-bold text-ink">{preview.data.title}</p>
                <p>{preview.data.subtitle}</p>
                <p>Generated {new Date().toLocaleString("en-GB")}</p>
                <p>By {session?.name}</p>
              </div>
            </header>

            {/* Summary */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {preview.data.summary.map((s) => (
                <StatTile key={s.label} label={s.label} value={s.value} />
              ))}
            </div>

            {/* Rows */}
            <div className="overflow-x-auto rounded-xl border-2 border-ink">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-ink bg-cream-deep">
                    {preview.data.columns.map((c) => (
                      <th key={c} scope="col" className="px-3 py-2.5 text-xs font-bold tracking-wider text-ink uppercase">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {preview.data.rows.map((row, i) => (
                    <tr key={i} className={i % 2 ? "bg-cream/50" : "bg-white"}>
                      {preview.data.columns.map((c) => (
                        <td key={c} className="px-3 py-2.5 align-top text-ink/80">
                          {String(row[c] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {preview.data.rows.length === 0 && (
                    <tr>
                      <td colSpan={preview.data.columns.length} className="px-3 py-8 text-center text-ink/55">
                        No data in this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="border-t-2 border-ink/15 pt-3 text-xs text-ink/55">
              <p>
                {site.name} · {site.phone} · {site.email}
              </p>
              <p className="mt-0.5">
                This report is confidential and intended only for the named recipient.
              </p>
            </footer>
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}
