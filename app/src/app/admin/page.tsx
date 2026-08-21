"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarDays, Info, Video } from "lucide-react";
import { useSession } from "@/lib/admin/session-context";
import { useClasses } from "@/lib/admin/use-classes";
import {
  alerts, attendanceTrend, enrolmentFunnel, invoices, kpis,
  leaveRequests, revenueByMonth,
} from "@/lib/admin/demo-data";
import {
  filterForRole, sessionsForDay, sessionsForRange, addDays,
  STATUS_LABEL, type ClassSession,
} from "@/lib/admin/schedule";
import {
  AdminButton, AdminPage, Badge, Panel, StatTile, StatusBadge, Table, Td, Tr,
} from "@/components/admin/ui";
import { BarChart, DonutChart, FunnelChart, LineChart } from "@/components/admin/Charts";
import { DateTimePanel } from "@/components/admin/DateTimePanel";
import { CalendarView } from "@/components/admin/CalendarView";
import { JoinClassDialog } from "@/components/admin/JoinClassDialog";

export default function AdminDashboard() {
  const { session } = useSession();
  const [joining, setJoining] = useState<ClassSession | null>(null);
  const { defs } = useClasses();

  // Schedule is derived from the current clock, so it is computed after
  // mount only — the static export has no idea what "now" is at view time.
  const [today, setToday] = useState<ClassSession[]>([]);
  const [week, setWeek] = useState<ClassSession[]>([]);

  useEffect(() => {

    const refresh = () => {
      const now = new Date();
      setToday(sessionsForDay(now, now, defs));
      setWeek(sessionsForRange(now, addDays(now, 6), now, defs));
    };
    refresh();

    // Keeps "live now" accurate as classes start and end
    const id = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(id);
  }, [defs]);

  const mine = useMemo(
    () => (session ? filterForRole(today, session.role, session.name) : []),
    [today, session],
  );

  if (!session) return null;

  const isStaff = session.role === "admin" || session.role === "principal";
  const live = today.filter((s) => s.status === "live");

  /* ------------------------------ Student view ---------------------------- */
  if (session.role === "student") {
    const upcoming = mine.filter((s) => s.status === "scheduled" || s.status === "live");
    const next = upcoming[0];
    const myWeek = filterForRole(week, session.role, session.name);
    const done = mine.filter((s) => s.status === "completed").length;

    return (
      <AdminPage
        title={`Assalamu alaikum, ${session.name.split(" ")[0]}`}
        description="Your classes, progress and invoices."
      >
        <DateTimePanel filter={(x) => x.studentName === session.name} />

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <StatTile label="Classes today" value={String(mine.length)} delta={`${done} completed`} />
          <StatTile label="This week" value={String(myWeek.length)} delta="Scheduled" />
          <StatTile label="Attendance" value="96%" delta="Last 30 days" trend="up" />
          <StatTile label="Next invoice" value="$50" delta="Due 1 Sep" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Your next class">
            {next ? (
              <div>
                <p className="font-display text-2xl text-ink">{next.course}</p>
                <p className="mt-1 text-ink/70">
                  {next.start}–{next.end} with {next.teacherName}
                </p>
                <Badge tone={next.status === "live" ? "danger" : "neutral"} className="mt-3">
                  {STATUS_LABEL[next.status]}
                </Badge>
                <AdminButton className="mt-5" onClick={() => setJoining(next)}>
                  <Video className="size-4" aria-hidden="true" />
                  Join class
                </AdminButton>
              </div>
            ) : (
              <p className="py-4 text-ink/60">No further classes scheduled today.</p>
            )}
          </Panel>

          <Panel title="Today's schedule" bodyClassName="p-0">
            <Table head={["Time", "Course", "Teacher", "Status", ""]} empty={mine.length === 0}>
              {mine.map((s) => (
                <Tr key={s.id}>
                  <Td label="Time" className="font-display">{s.start}</Td>
                  <Td label="Course" className="font-semibold">{s.course}</Td>
                  <Td label="Teacher" className="text-ink/70">{s.teacherName}</Td>
                  <Td label="Status"><StatusBadge status={s.attendance} /></Td>
                  <Td>
                    {(s.status === "live" || s.status === "scheduled") && (
                      <AdminButton size="sm" variant={s.status === "live" ? "primary" : "outline"} onClick={() => setJoining(s)}>
                        <Video className="size-3.5" aria-hidden="true" />
                        Join
                      </AdminButton>
                    )}
                  </Td>
                </Tr>
              ))}
            </Table>
          </Panel>
        </div>

        <Panel title="My calendar" description="Click any day to see your classes.">
          <CalendarView
            title="Your class schedule"
            filter={(s) => s.studentName === session.name}
            onJoin={setJoining}
          />
        </Panel>

        <Panel title="Your invoices" bodyClassName="p-0">
          <Table head={["Invoice", "Period", "Amount", "Status", "Due"]}>
            {invoices.slice(0, 3).map((inv) => (
              <Tr key={inv.id}>
                <Td label="Invoice" className="font-mono text-xs">{inv.id}</Td>
                <Td label="Period">{inv.period}</Td>
                <Td label="Amount" className="font-semibold">{inv.currency} {inv.amount}</Td>
                <Td label="Status"><StatusBadge status={inv.status} /></Td>
                <Td label="Due" className="text-ink/65">{inv.due}</Td>
              </Tr>
            ))}
          </Table>
        </Panel>

        <JoinClassDialog session={joining} onClose={() => setJoining(null)} />
      </AdminPage>
    );
  }

  /* ------------------------------ Teacher view ---------------------------- */
  if (session.role === "teacher") {
    const pending = mine.filter((s) => s.attendance === "pending" && s.status !== "scheduled");
    const myWeek = filterForRole(week, session.role, session.name);
    const completed = mine.filter((s) => s.status === "completed").length;

    return (
      <AdminPage
        title={`Assalamu alaikum, ${session.name.split(" ").slice(-1)[0]}`}
        description="Your classes today, attendance to mark, and student progress."
      >
        <DateTimePanel filter={(x) => x.teacherName === session.name} />

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <StatTile label="Classes today" value={String(mine.length)} delta={`${completed} completed`} />
          <StatTile label="This week" value={String(myWeek.length)} delta="Scheduled" />
          <StatTile label="To mark" value={String(pending.length)} delta="Needs attendance" trend={pending.length ? "down" : "flat"} />
          <StatTile label="Earnings (Aug)" value="$630" delta="84 sessions" />
        </div>

        <Panel
          title="Your classes today"
          actions={
            <Link href="/admin/today" className="inline-flex min-h-11 items-center text-sm font-bold text-ink underline decoration-teal decoration-2 underline-offset-4 sm:min-h-0">
              Mark attendance
            </Link>
          }
          bodyClassName="p-0"
        >
          <Table head={["Time", "Student", "Course", "Status", "Attendance", ""]} empty={mine.length === 0}>
            {mine.map((s) => (
              <Tr key={s.id}>
                <Td label="Time" className="font-display">{s.start}</Td>
                <Td label="Student" className="font-semibold">{s.studentName}</Td>
                <Td label="Course" className="text-ink/70">{s.course}</Td>
                <Td label="Status"><Badge tone={s.status === "live" ? "danger" : "neutral"}>{STATUS_LABEL[s.status]}</Badge></Td>
                <Td label="Attendance"><StatusBadge status={s.attendance} /></Td>
                <Td>
                  {(s.status === "live" || s.status === "scheduled") && (
                    <AdminButton size="sm" variant={s.status === "live" ? "primary" : "outline"} onClick={() => setJoining(s)}>
                      <Video className="size-3.5" aria-hidden="true" />
                      Join
                    </AdminButton>
                  )}
                </Td>
              </Tr>
            ))}
          </Table>
        </Panel>

        <Panel title="My teaching calendar" description="Click any day to see your classes.">
          <CalendarView
            title="Your class schedule"
            filter={(s) => s.teacherName === session.name}
            onJoin={setJoining}
          />
        </Panel>

        <JoinClassDialog session={joining} onClose={() => setJoining(null)} />
      </AdminPage>
    );
  }

  /* --------------------------- Admin / Principal -------------------------- */
  const shownKpis = isStaff ? kpis : kpis.slice(0, 4);
  const outcomes = [
    { label: "Completed", value: today.filter((s) => s.status === "completed").length, color: "var(--color-green)" },
    { label: "Scheduled", value: today.filter((s) => s.status === "scheduled").length, color: "var(--color-cream-deep)" },
    { label: "Live", value: live.length, color: "var(--color-green-deep)" },
    { label: "Missed", value: today.filter((s) => s.status.startsWith("missed")).length, color: "var(--color-gold)" },
  ];

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
      <DateTimePanel />

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {shownKpis.map((k) => (
          <Link key={k.label} href={k.href} className="block">
            <StatTile label={k.label} value={k.value} delta={k.delta} trend={k.trend} />
          </Link>
        ))}
      </div>

      <Panel
        title={`Live now — ${live.length} classes in progress`}
        actions={
          <Link href="/admin/today" className="inline-flex min-h-11 items-center text-sm font-bold text-ink underline decoration-teal decoration-2 underline-offset-4 sm:min-h-0">
            Today&rsquo;s board
          </Link>
        }
        bodyClassName="p-0"
      >
        <Table head={["Time", "Student", "Teacher", "Course", "Status", ""]} empty={live.length === 0}>
          {live.map((s) => (
            <Tr key={s.id}>
              <Td label="Time" className="font-display">{s.start}</Td>
              <Td label="Student" className="font-semibold">{s.studentName}</Td>
              <Td label="Teacher" className="text-ink/70">{s.teacherName}</Td>
              <Td label="Course" className="text-ink/70">{s.course}</Td>
              <Td label="Status"><Badge tone="danger">Live now</Badge></Td>
              <Td>
                <AdminButton size="sm" variant="outline" onClick={() => setJoining(s)}>
                  <Video className="size-3.5" aria-hidden="true" />
                  Observe
                </AdminButton>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

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

      <Panel
        title="All classes calendar"
        description="Every scheduled class across the academy. Click a day for detail."
        actions={<CalendarDays className="size-5 text-ink/40" aria-hidden="true" />}
      >
        <CalendarView title="Academy-wide schedule" onJoin={setJoining} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {session.role === "admin" && (
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

        <Panel title="Today's outcomes" description="Class status breakdown">
          <DonutChart
            data={outcomes}
            caption="Today's class outcomes"
            centerLabel="Classes"
            centerValue={String(today.length)}
          />
        </Panel>

        <Panel title="Attendance" description="Last 7 days">
          <BarChart data={attendanceTrend} caption="Daily attendance rate over the last 7 days" />
        </Panel>

        <Panel title="Enrolment funnel" description="Last 90 days">
          <FunnelChart data={enrolmentFunnel} caption="Enrolment funnel by stage" />
        </Panel>

        <Panel title="Leave awaiting approval" bodyClassName="p-0">
          <Table head={["Teacher", "Type", "Dates", "Affected", "Cover"]}>
            {leaveRequests.filter((l) => l.status === "pending").map((l) => (
              <Tr key={l.id}>
                <Td label="Teacher" className="font-semibold">{l.teacher}</Td>
                <Td label="Type">{l.type}</Td>
                <Td label="Dates" className="text-ink/70">{l.from} → {l.to}</Td>
                <Td label="Affected">{l.affected} classes</Td>
                <Td label="Cover" className="text-ink/65">{l.cover}</Td>
              </Tr>
            ))}
          </Table>
        </Panel>
      </div>

      <JoinClassDialog session={joining} onClose={() => setJoining(null)} />
    </AdminPage>
  );
}
