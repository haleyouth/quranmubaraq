"use client";

import { useState } from "react";
import { CheckCircle2, Video } from "lucide-react";
import { todaySessions as seed, type TodaySession } from "@/lib/admin/demo-data";
import {
  AdminButton, AdminPage, DemoNotice, Panel, StatTile, StatusBadge, Table, Td, Tr,
} from "@/components/admin/ui";

const FILTERS = ["all", "live", "upcoming", "completed", "no-show"] as const;

export default function TodayPage() {
  const [rows, setRows] = useState<TodaySession[]>([...seed]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [toast, setToast] = useState("");

  const shown = filter === "all" ? rows : rows.filter((s) => s.status === filter);

  const counts = {
    live: rows.filter((s) => s.status === "live").length,
    upcoming: rows.filter((s) => s.status === "upcoming").length,
    completed: rows.filter((s) => s.status === "completed").length,
    noShow: rows.filter((s) => s.status === "no-show").length,
  };

  function mark(id: string, attendance: TodaySession["attendance"]) {
    setRows((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, attendance, status: attendance === "absent" ? "no-show" : s.status }
          : s,
      ),
    );
    setToast(`Attendance marked ${attendance} for ${id}.`);
    window.setTimeout(() => setToast(""), 3000);
  }

  return (
    <AdminPage
      title="Today's Classes"
      description="Live operational board — every session scheduled today."
    >
      <DemoNotice />

      {toast && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Live now" value={String(counts.live)} delta="In progress" />
        <StatTile label="Upcoming" value={String(counts.upcoming)} delta="Later today" />
        <StatTile label="Completed" value={String(counts.completed)} delta="Attendance marked" trend="up" />
        <StatTile label="No shows" value={String(counts.noShow)} delta="Needs follow-up" trend="down" />
      </div>

      <Panel bodyClassName="p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter sessions">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`min-h-9 cursor-pointer rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold transition-colors ${
                filter === f ? "bg-green-deep text-white" : "bg-white text-ink hover:bg-cream-deep"
              }`}
            >
              {f === "all" ? "All" : f === "no-show" ? "No shows" : f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title={`${shown.length} sessions`} bodyClassName="p-0">
        <Table
          head={["Time", "Student", "Teacher", "Course", "Status", "Attendance", "Actions"]}
          empty={shown.length === 0}
        >
          {shown.map((s) => (
            <Tr key={s.id}>
              <Td className="font-display text-base">{s.time}</Td>
              <Td className="font-semibold">{s.student}</Td>
              <Td className="text-ink/70">{s.teacher}</Td>
              <Td className="text-ink/70">{s.course}</Td>
              <Td><StatusBadge status={s.status} /></Td>
              <Td><StatusBadge status={s.attendance} /></Td>
              <Td>
                <div className="flex flex-wrap gap-1.5">
                  {s.status === "live" && (
                    <AdminButton size="sm">
                      <Video className="size-3.5" aria-hidden="true" />
                      Join
                    </AdminButton>
                  )}
                  {s.attendance === "pending" && (
                    <>
                      <AdminButton size="sm" variant="outline" onClick={() => mark(s.id, "present")}>
                        Present
                      </AdminButton>
                      <AdminButton size="sm" variant="outline" onClick={() => mark(s.id, "late")}>
                        Late
                      </AdminButton>
                      <AdminButton size="sm" variant="danger" onClick={() => mark(s.id, "absent")}>
                        Absent
                      </AdminButton>
                    </>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      <Panel title="Online class settings" description="Defaults applied to every Zoom meeting created by the scheduler.">
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            ["Auto-create Zoom meeting", "Enabled"],
            ["Waiting room", "Enabled"],
            ["Passcode required", "Enabled"],
            ["Join before host", "Disabled"],
            ["Mute participants on entry", "Enabled"],
            ["Auto-record to cloud", "Enabled"],
            ["Join window", "10 minutes before start"],
            ["Auto-attendance threshold", "70% of session duration"],
            ["Recording retention", "90 days"],
          ].map(([label, value]) => (
            <li key={label} className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink/12 bg-cream px-4 py-3">
              <span className="text-sm font-semibold text-ink">{label}</span>
              <span className="text-sm text-ink/65">{value}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </AdminPage>
  );
}
