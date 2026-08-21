"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, Eye, FileText, Printer, Send } from "lucide-react";
import { useSession } from "@/lib/admin/session-context";
import {
  REPORTS, buildReport, downloadCsv, type ReportData, type ReportDef,
} from "@/lib/admin/reports";
import { addDays } from "@/lib/admin/schedule";
import {
  AdminButton, AdminPage, Badge, Panel, StatTile,
  Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";
import { ReportSheet } from "@/components/admin/ReportSheet";

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
  const { session } = useSession();
  const [cat, setCat] = useState("all");
  // Empty until mount, else the export would ship build-time dates
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [preview, setPreview] = useState<{ def: ReportDef; data: ReportData } | null>(null);
  const [requests, setRequests] = useState<Request[]>(SEED_REQUESTS);
  const [toast, setToast] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const n = new Date();
    setNow(n);
    setFrom(addDays(n, -30).toISOString().slice(0, 10));
    setTo(n.toISOString().slice(0, 10));
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
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink">To</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        {/* Presets, because these are the ranges staff actually ask for */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "Last 7 days", days: 7 },
            { label: "Last 30 days", days: 30 },
            { label: "Last 90 days", days: 90 },
            { label: "This year", days: 0 },
          ].map((p2) => (
            <button
              key={p2.label}
              type="button"
              onClick={() => {
                const now = new Date();
                const start =
                  p2.days === 0
                    ? new Date(now.getFullYear(), 0, 1)
                    : addDays(now, -p2.days);
                setFrom(start.toISOString().slice(0, 10));
                setTo(now.toISOString().slice(0, 10));
              }}
              className="min-h-9 cursor-pointer rounded-full border-2 border-ink bg-white px-3 text-xs font-bold text-ink transition-colors hover:bg-cream-deep"
            >
              {p2.label}
            </button>
          ))}
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
        {preview && now && (
          <ReportSheet
            data={preview.data}
            generatedBy={session?.name ?? ""}
            now={now}
          />
        )}
      </Modal>
    </AdminPage>
  );
}
