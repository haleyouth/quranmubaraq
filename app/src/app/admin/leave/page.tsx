"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Plus, TriangleAlert } from "lucide-react";
import { leaveRequests as seed, teachers, type Leave, type LeaveStatus } from "@/lib/admin/demo-data";
import {
  AdminButton, AdminPage, Field, Panel, StatTile,
  StatusBadge, Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";

export default function LeavePage() {
  const [rows, setRows] = useState<Leave[]>([...seed]);
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState<Leave | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [today, setToday] = useState("");

  // Today is only knowable on the client with output: "export"
  useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);

  const dayCount =
    from && to
      ? Math.max(
          1,
          Math.round(
            (new Date(`${to}T00:00:00`).getTime() -
              new Date(`${from}T00:00:00`).getTime()) /
              86400000,
          ) + 1,
        )
      : 0;
  const [toast, setToast] = useState("");

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 3500);
  }

  function decide(l: Leave, status: LeaveStatus) {
    setRows((prev) => prev.map((r) => (r.id === l.id ? { ...r, status } : r)));
    flash(
      status === "approved"
        ? `${l.id} approved. ${l.affected} classes need substitute cover.`
        : `${l.id} rejected.`,
    );
  }

  function assignCover(l: Leave, substitute: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === l.id ? { ...r, cover: substitute, status: "approved" } : r)),
    );
    flash(`${substitute} assigned to cover ${l.affected} classes.`);
  }

  const pending = rows.filter((l) => l.status === "pending");
  const uncovered = rows.filter(
    (l) => l.status === "approved" && l.cover.toLowerCase().includes("not"),
  ).length;

  return (
    <AdminPage
      title="Leave Management"
      description="Requests, approvals and substitute cover for affected classes."
      actions={
        <AdminButton onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Request leave
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
        <StatTile label="Pending approval" value={String(pending.length)} delta="Awaiting decision" />
        <StatTile label="Classes affected" value={String(pending.reduce((a, l) => a + l.affected, 0))} delta="If all approved" trend="down" />
        <StatTile label="Uncovered" value={String(uncovered)} delta="Need substitutes" trend="down" />
        <StatTile label="Approved (Aug)" value={String(rows.filter((l) => l.status === "approved").length)} />
      </div>

      {pending.length > 0 && (
        <p className="flex items-start gap-2 rounded-xl border-2 border-ink bg-gold px-4 py-3 text-sm font-semibold text-ink">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {pending.length} requests await a decision, affecting{" "}
          {pending.reduce((a, l) => a + l.affected, 0)} scheduled classes. Approving
          without assigning cover will cancel those classes and notify parents.
        </p>
      )}

      <Panel title={`${rows.length} leave requests`} bodyClassName="p-0">
        <Table head={["Ref", "Teacher", "Type", "Dates", "Days", "Affected", "Cover", "Status", "Actions"]}>
          {rows.map((l) => (
            <Tr key={l.id}>
              <Td label="Ref" className="font-mono text-xs">{l.id}</Td>
              <Td label="Teacher" className="font-semibold">{l.teacher}</Td>
              <Td label="Type">{l.type}</Td>
              <Td label="Dates" className="text-ink/70">{l.from} → {l.to}</Td>
              <Td label="Days">{l.days}</Td>
              <Td label="Affected">
                <span className={l.affected > 15 ? "font-bold text-red-700" : ""}>
                  {l.affected} classes
                </span>
              </Td>
              <Td label="Cover" className={l.cover.toLowerCase().includes("not") ? "font-semibold text-red-700" : "text-ink/70"}>
                {l.cover}
              </Td>
              <Td label="Status"><StatusBadge status={l.status} /></Td>
              <Td label="Actions">
                <div className="flex flex-wrap gap-1.5">
                  {l.status === "pending" ? (
                    <>
                      <AdminButton size="sm" onClick={() => decide(l, "approved")}>
                        Approve
                      </AdminButton>
                      <AdminButton size="sm" variant="danger" onClick={() => decide(l, "rejected")}>
                        Reject
                      </AdminButton>
                    </>
                  ) : (
                    l.status === "approved" && (
                      <AdminButton size="sm" variant="outline" onClick={() => setCover(l)}>
                        Assign cover
                      </AdminButton>
                    )
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      {/* Cover assignment */}
      <Modal
        open={Boolean(cover)}
        onClose={() => setCover(null)}
        title="Assign substitute"
        description={cover ? `${cover.affected} classes need cover while ${cover.teacher} is away.` : undefined}
      >
        {cover && (
          <ul className="space-y-2">
            {teachers
              .filter((t) => t.status === "active" && t.name !== cover.teacher)
              .map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      assignCover(cover, t.name);
                      setCover(null);
                    }}
                    className="w-full cursor-pointer rounded-xl border-2 border-ink bg-white px-4 py-3 text-left transition-colors hover:bg-cream-deep"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-ink">{t.name}</span>
                      <span className="text-xs text-ink/60">{30 - t.load}h free</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-ink/55">
                      {t.specializations.join(", ")}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </Modal>

      {/* New request */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Request leave"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton
              onClick={() => {
                setOpen(false);
                flash("Leave request submitted for approval.");
              }}
            >
              Submit request
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Leave type">
            <select className={inputClass}>
              <option>Sick</option><option>Annual</option><option>Emergency</option>
              <option>Unpaid</option><option>Bereavement</option>
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First day away">
              <input
                type="date"
                value={from}
                min={today}
                onChange={(e) => {
                  setFrom(e.target.value);
                  // Keep the range valid rather than letting it invert
                  if (to && e.target.value > to) setTo(e.target.value);
                }}
                className={inputClass}
              />
            </Field>
            <Field label="Last day away">
              <input
                type="date"
                value={to}
                min={from || today}
                onChange={(e) => setTo(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          {from && to && (
            <p className="rounded-xl border-2 border-ink/15 bg-cream px-4 py-2.5 text-sm font-semibold text-ink">
              {dayCount} day{dayCount === 1 ? "" : "s"} away ·{" "}
              {new Date(`${from}T00:00:00`).toLocaleDateString("en-GB", {
                weekday: "short", day: "numeric", month: "short",
              })}
              {" to "}
              {new Date(`${to}T00:00:00`).toLocaleDateString("en-GB", {
                weekday: "short", day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          )}
          <Field label="Reason">
            <textarea rows={3} className={inputClass} placeholder="Brief reason for the request" />
          </Field>
          <p className="rounded-xl border-2 border-ink/15 bg-cream p-3 text-sm text-ink/70">
            Affected classes are calculated on submission so the approver can arrange
            cover before the leave is granted.
          </p>
        </div>
      </Modal>
    </AdminPage>
  );
}
