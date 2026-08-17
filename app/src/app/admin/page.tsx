"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Info, Video } from "lucide-react";
import { getSession, type Session } from "@/lib/admin/demo-auth";
import {
  alerts, attendanceTrend, enrolmentFunnel, invoices, kpis, leaveRequests,
  revenueByMonth, teacherProgress, todaySessions,
} from "@/lib/admin/demo-data";
import { AdminPage, Panel, StatTile, StatusBadge, Table, Td, Tr, AdminButton } from "@/components/admin/ui";
import { BarChart, FunnelChart, LineChart } from "@/components/admin/Charts";

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => setSession(getSession()), []);
  if (!session) return null;

  const isStaff = session.role === "admin" || session.role === "principal";
  const live = todaySessions.filter((s) => s.status === "live");

  /* ------------------------------ Student view ----------------------------- */
  if (session.role === "student") {
    const next = todaySessions.find((s) => s.status === "upcoming");
    const myInvoices = invoices.slice(0, 3);

    return (
      <AdminPage
        title={`Assalamu alaikum, ${session.name.split(" ")[0]}`}
        description="Your classes, progress and invoices."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Attendance" value="96%" delta="Last 30 days" trend="up" />
          <StatTile label="Classes this month" value="18" delta="2 remaining" />
          <StatTile label="Current course" value="Reading" delta="Beginner level" />
          <StatTile label="Next invoice" value="$50" delta="Due 1 Sep" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Your next class">
            {next ? (
              <div>
                <p className="font-display text-2xl text-ink">{next.course}</p>
                <p className="mt-1 text-ink/70">
                  {next.time} with {next.teacher}
                </p>
                <AdminButton className="mt-5">
                  <Video className="size-4" aria-hidden="true" />
                  Join class
                </AdminButton>
              </div>
            ) : (
              <p className="text-ink/60">No further classes scheduled today.</p>
            )}
          </Panel>

          <Panel title="Recent progress">
            <ul className="space-y-3">
              {teacherProgress.slice(0, 3).map((p) => (
                <li key={p.student} className="rounded-xl border-2 border-ink/12 bg-cream p-3.5">
                  <p className="font-semibold text-ink">
                    {p.surah} · {p.ayah}
                  </p>
                  <p className="mt-0.5 text-sm text-ink/65">{p.note}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Your invoices">
          <Table head={["Invoice", "Period", "Amount", "Status", "Due"]}>
            {myInvoices.map((inv) => (
              <Tr key={inv.id}>
                <Td className="font-mono text-xs">{inv.id}</Td>
                <Td>{inv.period}</Td>
                <Td className="font-semibold">
                  {inv.currency} {inv.amount}
                </Td>
                <Td><StatusBadge status={inv.status} /></Td>
                <Td className="text-ink/65">{inv.due}</Td>
              </Tr>
            ))}
          </Table>
        </Panel>
      </AdminPage>
    );
  }

  /* ------------------------------ Teacher view ----------------------------- */
  if (session.role === "teacher") {
    const mine = todaySessions.filter((s) => s.teacher === session.name);
    const pending = mine.filter((s) => s.attendance === "pending");

    return (
      <AdminPage
        title={`Assalamu alaikum, ${session.name.split(" ").slice(-1)[0]}`}
        description="Your classes today, attendance to mark, and student progress."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Classes today" value={String(mine.length)} delta={`${pending.length} to mark`} />
          <StatTile label="Active students" value="18" delta="+2 this month" trend="up" />
          <StatTile label="Attendance rate" value="94%" delta="+2%" trend="up" />
          <StatTile label="Earnings (Aug)" value="$630" delta="84 sessions" />
        </div>

        <Panel
          title="Your classes today"
          actions={
            <Link href="/admin/today" className="text-sm font-bold text-ink underline decoration-teal decoration-2 underline-offset-4">
              View all
            </Link>
          }
          bodyClassName="p-0"
        >
          <Table head={["Time", "Student", "Course", "Status", "Attendance", ""]} empty={mine.length === 0}>
            {mine.map((s) => (
              <Tr key={s.id}>
                <Td className="font-semibold">{s.time}</Td>
                <Td>{s.student}</Td>
                <Td className="text-ink/70">{s.course}</Td>
                <Td><StatusBadge status={s.status} /></Td>
                <Td><StatusBadge status={s.attendance} /></Td>
                <Td>
                  <AdminButton size="sm" variant={s.status === "live" ? "primary" : "outline"}>
                    {s.status === "live" ? "Join" : "Open"}
                  </AdminButton>
                </Td>
              </Tr>
            ))}
          </Table>
        </Panel>

        <Panel title="Recent student progress" bodyClassName="p-0">
          <Table head={["Student", "Surah", "Ayah", "Tajweed", "Fluency", "Note"]}>
            {teacherProgress.map((p) => (
              <Tr key={p.student}>
                <Td className="font-semibold">{p.student}</Td>
                <Td>{p.surah}</Td>
                <Td className="text-ink/70">{p.ayah}</Td>
                <Td>{p.tajweed}/5</Td>
                <Td>{p.fluency}/5</Td>
                <Td className="text-ink/65">{p.note}</Td>
              </Tr>
            ))}
          </Table>
        </Panel>
      </AdminPage>
    );
  }

  /* --------------------------- Admin / Principal --------------------------- */
  const shownKpis = isStaff ? kpis : kpis.slice(0, 4);

  return (
    <AdminPage
      title={session.role === "principal" ? "Branch overview" : "Organisation overview"}
      description={
        session.role === "principal"
          ? `${session.branch} — today's operations at a glance.`
          : "All branches — today's operations at a glance."
      }
      actions={
        <AdminButton variant="outline">
          <ArrowRight className="size-4" aria-hidden="true" />
          Export summary
        </AdminButton>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shownKpis.map((k) => (
          <Link key={k.label} href={k.href} className="block">
            <StatTile label={k.label} value={k.value} delta={k.delta} trend={k.trend} />
          </Link>
        ))}
      </div>

      {/* Live now */}
      <Panel
        title={`Live now — ${live.length} classes in progress`}
        actions={
          <Link href="/admin/today" className="text-sm font-bold text-ink underline decoration-teal decoration-2 underline-offset-4">
            Today&rsquo;s board
          </Link>
        }
        bodyClassName="p-0"
      >
        <Table head={["Time", "Student", "Teacher", "Course", "Status", ""]} empty={live.length === 0}>
          {live.map((s) => (
            <Tr key={s.id}>
              <Td className="font-semibold">{s.time}</Td>
              <Td>{s.student}</Td>
              <Td className="text-ink/70">{s.teacher}</Td>
              <Td className="text-ink/70">{s.course}</Td>
              <Td><StatusBadge status={s.status} /></Td>
              <Td>
                <AdminButton size="sm" variant="outline">
                  <Video className="size-3.5" aria-hidden="true" />
                  Observe
                </AdminButton>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      {/* Alerts */}
      <Panel title="Needs attention">
        <ul className="space-y-3">
          {alerts.map((a) => (
            <li key={a.text}>
              <Link
                href={a.href}
                className="flex items-start gap-3 rounded-xl border-2 border-ink/12 bg-cream p-3.5 transition-colors hover:border-ink hover:bg-cream-deep"
              >
                {a.type === "urgent" ? (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-700" aria-hidden="true" />
                ) : a.type === "warning" ? (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                ) : (
                  <Info className="mt-0.5 size-4 shrink-0 text-green" aria-hidden="true" />
                )}
                <span className="text-sm font-semibold text-ink">{a.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isStaff && session.role === "admin" && (
          <Panel title="Revenue" description="Last 12 months (USD)">
            <LineChart
              data={revenueByMonth}
              labelKey="month"
              valueKey="value"
              prefix="$"
              caption="Monthly revenue over the last 12 months"
            />
          </Panel>
        )}

        <Panel title="Attendance" description="Last 7 days">
          <BarChart data={attendanceTrend} caption="Daily attendance rate over the last 7 days" />
        </Panel>

        <Panel title="Enrolment funnel" description="Last 90 days">
          <FunnelChart data={enrolmentFunnel} caption="Enrolment funnel by stage" />
        </Panel>

        <Panel title="Leave awaiting approval" bodyClassName="p-0">
          <Table head={["Teacher", "Type", "Dates", "Affected", "Cover"]}>
            {leaveRequests
              .filter((l) => l.status === "pending")
              .map((l) => (
                <Tr key={l.id}>
                  <Td className="font-semibold">{l.teacher}</Td>
                  <Td>{l.type}</Td>
                  <Td className="text-ink/70">
                    {l.from} → {l.to}
                  </Td>
                  <Td>{l.affected} classes</Td>
                  <Td className="text-ink/65">{l.cover}</Td>
                </Tr>
              ))}
          </Table>
        </Panel>
      </div>
    </AdminPage>
  );
}
