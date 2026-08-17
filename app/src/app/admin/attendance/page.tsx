"use client";

import { attendanceTrend, students, todaySessions } from "@/lib/admin/demo-data";
import {
  AdminPage, DemoNotice, Panel, StatTile, StatusBadge, Table, Td, Tr,
} from "@/components/admin/ui";
import { BarChart } from "@/components/admin/Charts";

export default function AttendancePage() {
  const flagged = students.filter((s) => s.attendance < 85);

  return (
    <AdminPage
      title="Attendance"
      description="Attendance rates, exceptions and students needing follow-up."
    >
      <DemoNotice />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Attendance (7d)" value="91%" delta="+3%" trend="up" />
        <StatTile label="Marked today" value={`${todaySessions.filter((s) => s.attendance !== "pending").length}/${todaySessions.length}`} delta="Sessions" />
        <StatTile label="No shows today" value={String(todaySessions.filter((s) => s.attendance === "absent").length)} delta="Needs follow-up" trend="down" />
        <StatTile label="Below 85%" value={String(flagged.length)} delta="Students flagged" trend="down" />
      </div>

      <Panel title="Attendance rate" description="Last 7 days">
        <BarChart data={attendanceTrend} caption="Daily attendance rate over the last 7 days" />
      </Panel>

      <Panel
        title="Students needing attention"
        description="Attendance below the 85% threshold."
        bodyClassName="p-0"
      >
        <Table head={["Student", "Guardian", "Course", "Teacher", "Attendance", "Status"]} empty={flagged.length === 0}>
          {flagged.map((s) => (
            <Tr key={s.id}>
              <Td className="font-semibold">{s.name}</Td>
              <Td className="text-ink/70">{s.guardian}</Td>
              <Td className="text-ink/70">{s.course}</Td>
              <Td className="text-ink/70">{s.teacher}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full border border-ink bg-cream">
                    <div className="h-full bg-gold" style={{ width: `${s.attendance}%` }} />
                  </div>
                  <span className="text-xs font-bold text-red-700">{s.attendance}%</span>
                </div>
              </Td>
              <Td><StatusBadge status={s.status} /></Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      <Panel title="Today's attendance register" bodyClassName="p-0">
        <Table head={["Time", "Student", "Teacher", "Course", "Session", "Attendance"]}>
          {todaySessions.map((s) => (
            <Tr key={s.id}>
              <Td className="font-display">{s.time}</Td>
              <Td className="font-semibold">{s.student}</Td>
              <Td className="text-ink/70">{s.teacher}</Td>
              <Td className="text-ink/70">{s.course}</Td>
              <Td><StatusBadge status={s.status} /></Td>
              <Td><StatusBadge status={s.attendance} /></Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </AdminPage>
  );
}
