"use client";

import { attendanceTrend, students, todaySessions } from "@/lib/admin/demo-data";
import {
  AdminPage, Panel, StatTile, StatusBadge, Table, Td, Tr,
} from "@/components/admin/ui";
import { BarChart } from "@/components/admin/Charts";

export default function AttendancePage() {
  const flagged = students.filter((s) => s.attendance < 85);

  return (
    <AdminPage
      title="Attendance"
      description="Attendance rates, exceptions and students needing follow-up."
    >

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
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
              <Td label="Student" className="font-semibold">{s.name}</Td>
              <Td label="Guardian" className="text-ink/70">{s.guardian}</Td>
              <Td label="Course" className="text-ink/70">{s.course}</Td>
              <Td label="Teacher" className="text-ink/70">{s.teacher}</Td>
              <Td label="Attendance">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full border border-ink bg-cream">
                    <div className="h-full bg-gold" style={{ width: `${s.attendance}%` }} />
                  </div>
                  <span className="text-xs font-bold text-red-700">{s.attendance}%</span>
                </div>
              </Td>
              <Td label="Status"><StatusBadge status={s.status} /></Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      <Panel title="Today's attendance register" bodyClassName="p-0">
        <Table head={["Time", "Student", "Teacher", "Course", "Session", "Attendance"]}>
          {todaySessions.map((s) => (
            <Tr key={s.id}>
              <Td label="Time" className="font-display">{s.time}</Td>
              <Td label="Student" className="font-semibold">{s.student}</Td>
              <Td label="Teacher" className="text-ink/70">{s.teacher}</Td>
              <Td label="Course" className="text-ink/70">{s.course}</Td>
              <Td label="Session"><StatusBadge status={s.status} /></Td>
              <Td label="Attendance"><StatusBadge status={s.attendance} /></Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </AdminPage>
  );
}
