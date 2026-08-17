"use client";

import { useState } from "react";
import { CheckCircle2, Plus, Video } from "lucide-react";
import { todaySessions, teachers, students } from "@/lib/admin/demo-data";
import { courses } from "@/lib/content";
import {
  AdminButton, AdminPage, Badge, DemoNotice, Field, Panel, StatTile,
  StatusBadge, Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["07:00", "08:00", "09:00", "10:00", "11:00", "17:00", "18:00", "19:00"];

export default function ClassesPage() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Wed", "Fri"]);

  function flash(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 3500);
  }

  // Deterministic pseudo-schedule so the grid renders consistently
  const grid = SLOTS.map((slot, si) => ({
    slot,
    cells: DAYS.map((day, di) => {
      const idx = (si * 7 + di) % todaySessions.length;
      const busy = (si + di) % 3 !== 0;
      return busy ? todaySessions[idx] : null;
    }),
  }));

  return (
    <AdminPage
      title="Classes"
      description="Recurring class schedules, teacher assignment and conflict checking."
      actions={
        <AdminButton onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Create class
        </AdminButton>
      }
    >
      <DemoNotice />

      {toast && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Active classes" value="186" delta="Across 5 courses" />
        <StatTile label="One-on-one" value="171" delta="92% of all classes" />
        <StatTile label="Group classes" value="15" delta="8% of all classes" />
        <StatTile label="Unassigned slots" value="4" delta="Need a teacher" trend="down" />
      </div>

      <Panel
        title="Weekly schedule"
        description="All times shown in your local timezone. Grey cells are free."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr>
                <th scope="col" className="px-2 py-2 text-left text-xs font-bold text-ink/55 uppercase">
                  Time
                </th>
                {DAYS.map((d) => (
                  <th key={d} scope="col" className="px-2 py-2 text-center text-xs font-bold text-ink/55 uppercase">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map(({ slot, cells }) => (
                <tr key={slot}>
                  <th scope="row" className="px-2 py-1.5 text-left font-display text-sm text-ink">
                    {slot}
                  </th>
                  {cells.map((cell, i) => (
                    <td key={i} className="p-1">
                      {cell ? (
                        <div className="rounded-lg border-2 border-ink bg-green px-2 py-1.5 text-xs text-white">
                          <p className="truncate font-bold">{cell.student}</p>
                          <p className="truncate opacity-85">{cell.course}</p>
                        </div>
                      ) : (
                        <div className="rounded-lg border-2 border-dashed border-ink/20 px-2 py-1.5 text-center text-xs text-ink/35">
                          Free
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Teacher utilisation" bodyClassName="p-0">
        <Table head={["Teacher", "Students", "Weekly hours", "Utilisation", "Specializations", "Status"]}>
          {teachers.map((t) => {
            const pct = Math.round((t.load / 30) * 100);
            return (
              <Tr key={t.id}>
                <Td className="font-semibold">{t.name}</Td>
                <Td>{t.students}</Td>
                <Td>{t.load}h / 30h</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full border border-ink bg-cream">
                      <div
                        className={pct > 85 ? "h-full bg-gold" : "h-full bg-green"}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold">{pct}%</span>
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    {t.specializations.map((s) => <Badge key={s} tone="sage">{s}</Badge>)}
                  </div>
                </Td>
                <Td><StatusBadge status={t.status} /></Td>
              </Tr>
            );
          })}
        </Table>
      </Panel>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create class"
        description="A Zoom meeting is created automatically on save."
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton
              onClick={() => {
                setOpen(false);
                flash("Class created. Zoom meeting provisioned and parents notified.");
              }}
            >
              Create class
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Student">
            <select className={inputClass}>
              {students.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Course">
            <select className={inputClass}>
              {courses.map((c) => <option key={c.slug}>{c.title}</option>)}
            </select>
          </Field>
          <Field label="Teacher" hint="Only teachers with free capacity are listed.">
            <select className={inputClass}>
              {teachers.filter((t) => t.status === "active" && t.load < 30).map((t) => (
                <option key={t.id}>{t.name} — {30 - t.load}h free</option>
              ))}
            </select>
          </Field>
          <Field label="Repeats on">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const on = selectedDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      setSelectedDays((prev) =>
                        on ? prev.filter((x) => x !== d) : [...prev, d],
                      )
                    }
                    aria-pressed={on}
                    className={`min-h-9 cursor-pointer rounded-full border-2 border-ink px-3 py-1.5 text-sm font-bold transition-colors ${
                      on ? "bg-green text-white" : "bg-white text-ink"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start time"><input type="time" defaultValue="09:00" className={inputClass} /></Field>
            <Field label="Duration">
              <select className={inputClass}><option>30 minutes</option><option>1 hour</option></select>
            </Field>
          </div>
          <p className="flex items-start gap-2 rounded-xl border-2 border-ink/15 bg-cream p-3 text-sm text-ink/70">
            <Video className="mt-0.5 size-4 shrink-0 text-green" aria-hidden="true" />
            Conflicts are checked against teacher availability, the student&rsquo;s other
            classes and branch hours before the class is saved.
          </p>
        </div>
      </Modal>
    </AdminPage>
  );
}
