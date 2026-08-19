"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Briefcase, CheckCircle2, ClipboardList, Inbox,
  Mail, Phone, RefreshCw, Search, TriangleAlert,
} from "lucide-react";
import { getSession, type Session } from "@/lib/admin/demo-auth";
import { leads as leadSeed } from "@/lib/admin/demo-data";
import { listLeads } from "@/lib/leads";
import { listApplications, type StoredApplication } from "@/lib/careers";
import { calculateAge } from "@/components/ui/DateRoller";
import {
  AdminButton, AdminPage, Badge, Panel, StatTile,
  Table, Td, Tr, inputClass,
} from "@/components/admin/ui";

/**
 * Every form the public site can submit, in one inbox.
 *
 * Each form type keeps its own dedicated screen for detailed work; this page
 * exists so nothing arrives unnoticed simply because it landed in a section
 * nobody had open.
 */
type FormType = "trial" | "application";

type Submission = {
  id: string;
  type: FormType;
  name: string;
  email: string;
  phone: string;
  country: string;
  /** Course of interest, or the role applied for. */
  subject: string;
  status: string;
  age?: number | null;
  createdAt: Date | null;
  live: boolean;
  href: string;
};

const TYPE_META: Record<FormType, { label: string; icon: typeof Inbox; tone: "green" | "greenDeep"; href: string }> = {
  trial: { label: "Trial class", icon: ClipboardList, tone: "green", href: "/admin/leads" },
  application: { label: "Job application", icon: Briefcase, tone: "greenDeep", href: "/admin/applications" },
};

/** Demo applications, mirroring the applications screen. */
const APP_SEED: StoredApplication[] = [
  {
    id: "AP-DEMO-1", name: "Ustadha Ruqayyah Anwar", email: "r.anwar@example.com",
    phone: "+92 300 5559911", country: "Pakistan", role: "Female Quran Teacher",
    gender: "female", dateOfBirth: "1994-04-12", age: 32,
    qualifications: "Hafiza with ijazah in Hafs 'an 'Asim; BA Islamic Studies.",
    experienceYears: "5-10", availability: "20-30 hours", message: "",
    status: "new", source: "careers", createdAt: new Date("2026-08-17"),
  },
  {
    id: "AP-DEMO-2", name: "Ustadh Salman Rafiq", email: "s.rafiq@example.com",
    phone: "+44 7700 900443", country: "United Kingdom", role: "Male Quran Teacher",
    gender: "male", dateOfBirth: "1988-11-03", age: 37,
    qualifications: "Hafiz, Madinah graduate, ijazah in three qira'at.",
    experienceYears: "More than 10", availability: "10-20 hours", message: "",
    status: "interview", source: "careers", createdAt: new Date("2026-08-15"),
  },
];

export default function SubmissionsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [rows, setRows] = useState<Submission[]>([]);
  const [liveState, setLiveState] = useState<"loading" | "ok" | "denied" | "error">("loading");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | FormType>("all");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setSession(getSession());
    void load();
  }, []);

  async function load() {
    setLiveState("loading");

    const demo: Submission[] = [
      ...leadSeed.map((l) => ({
        id: l.id, type: "trial" as const, name: l.name, email: l.email,
        phone: l.phone, country: l.country, subject: l.course,
        status: l.status, createdAt: new Date(l.created),
        live: false, href: "/admin/leads",
      })),
      ...APP_SEED.map((a) => ({
        id: a.id, type: "application" as const, name: a.name, email: a.email,
        phone: a.phone, country: a.country, subject: a.role,
        status: a.status, age: a.age ?? calculateAge(a.dateOfBirth),
        createdAt: a.createdAt, live: false, href: "/admin/applications",
      })),
    ];

    // Both collections are read independently, so one failing does not hide
    // the other. Permission denial is expected until Auth is connected.
    const [leadsRes, appsRes] = await Promise.allSettled([listLeads(), listApplications()]);

    const liveRows: Submission[] = [];
    if (leadsRes.status === "fulfilled") {
      liveRows.push(
        ...leadsRes.value.map((l) => ({
          id: l.id, type: "trial" as const, name: l.name, email: l.email,
          phone: l.phone, country: l.country, subject: l.course ?? "",
          status: l.status, age: l.dateOfBirth ? calculateAge(l.dateOfBirth) : (l.age ?? null),
          createdAt: l.createdAt, live: true, href: "/admin/leads",
        })),
      );
    }
    if (appsRes.status === "fulfilled") {
      liveRows.push(
        ...appsRes.value.map((a) => ({
          id: a.id, type: "application" as const, name: a.name, email: a.email,
          phone: a.phone, country: a.country, subject: a.role,
          status: a.status, age: a.age ?? calculateAge(a.dateOfBirth),
          createdAt: a.createdAt, live: true, href: "/admin/applications",
        })),
      );
    }

    const denied =
      (leadsRes.status === "rejected" &&
        (leadsRes.reason as { code?: string })?.code === "permission-denied") ||
      (appsRes.status === "rejected" &&
        (appsRes.reason as { code?: string })?.code === "permission-denied");

    setRows(
      [...liveRows, ...demo].sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      ),
    );
    setLiveState(
      leadsRes.status === "fulfilled" || appsRes.status === "fulfilled"
        ? "ok"
        : denied
          ? "denied"
          : "error",
    );
  }

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q);
        const matchesType = typeFilter === "all" || r.type === typeFilter;
        return matchesQuery && matchesType;
      }),
    [rows, query, typeFilter],
  );

  const trials = rows.filter((r) => r.type === "trial").length;
  const apps = rows.filter((r) => r.type === "application").length;
  const fresh = rows.filter((r) => r.status === "new").length;
  const liveCount = rows.filter((r) => r.live).length;

  if (session && session.role !== "admin" && session.role !== "principal") {
    return (
      <AdminPage title="Submissions" description="Restricted area.">
        <Panel title="Not available">
          <p className="py-6 text-center text-ink/70">
            Form submissions are limited to administration and principals.
          </p>
        </Panel>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Submissions"
      description="Every form submitted from the website, in one place."
      actions={
        <AdminButton variant="outline" onClick={() => void load()}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh
        </AdminButton>
      }
    >
      {toast && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      {liveState === "denied" && (
        <p className="flex items-start gap-3 rounded-xl border-2 border-ink bg-gold px-4 py-3 text-sm text-ink">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <strong className="block">Staff sign-in required to load live submissions.</strong>
            Website forms are being saved, but the security rules only release
            them to an authenticated staff account.
          </span>
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total submissions" value={String(rows.length)} />
        <StatTile label="Trial requests" value={String(trials)} delta="Registration form" />
        <StatTile label="Job applications" value={String(apps)} delta="Careers form" />
        <StatTile label="Awaiting action" value={String(fresh)} delta={`${liveCount} live`} trend={fresh ? "down" : "flat"} />
      </div>

      {/* Route to the dedicated screens for detailed work */}
      <div className="grid gap-5 sm:grid-cols-2">
        {(Object.keys(TYPE_META) as FormType[]).map((t) => {
          const meta = TYPE_META[t];
          const Icon = meta.icon;
          const count = rows.filter((r) => r.type === t).length;
          return (
            <Link
              key={t}
              href={meta.href}
              className="group flex items-center gap-4 rounded-2xl border-2 border-ink bg-white p-5 hard-shadow press"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-green text-white">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="font-display block text-lg text-ink">{meta.label}s</span>
                <span className="block text-sm text-ink/60">
                  {count} submission{count === 1 ? "" : "s"} · manage in detail
                </span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-ink/40 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          );
        })}
      </div>

      <Panel bodyClassName="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, country or subject"
              aria-label="Search submissions"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | FormType)}
            aria-label="Filter by form type"
            className={`${inputClass} sm:w-52`}
          >
            <option value="all">All form types</option>
            <option value="trial">Trial class requests</option>
            <option value="application">Job applications</option>
          </select>
        </div>
      </Panel>

      <Panel
        title={`${filtered.length} submission${filtered.length === 1 ? "" : "s"}`}
        description={liveState === "loading" ? "Loading…" : undefined}
        bodyClassName="p-0"
      >
        <Table
          head={["Form", "Name", "Contact", "Subject", "Age", "Country", "Status", "Received", ""]}
          empty={filtered.length === 0}
        >
          {filtered.map((r) => {
            const meta = TYPE_META[r.type];
            const Icon = meta.icon;
            return (
              <Tr key={`${r.type}-${r.id}`}>
                <Td label="Form">
                  <span className="flex items-center gap-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg border-2 border-ink bg-cream-deep">
                      <Icon className="size-3.5 text-ink" aria-hidden="true" />
                    </span>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </span>
                </Td>
                <Td label="Name">
                  <p className="flex items-center gap-2 font-semibold text-ink">
                    {r.name}
                    {r.live && <Badge tone="green">Live</Badge>}
                  </p>
                </Td>
                <Td label="Contact">
                  <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 text-sm text-ink/80 hover:text-green-deep">
                    <Mail className="size-3.5" aria-hidden="true" />
                    {r.email}
                  </a>
                  <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/55 hover:text-green-deep">
                    <Phone className="size-3" aria-hidden="true" />
                    {r.phone}
                  </a>
                </Td>
                <Td label="Subject" className="text-ink/70">{r.subject || "—"}</Td>
                <Td label="Age">{r.age ?? "—"}</Td>
                <Td label="Country" className="text-ink/70">{r.country}</Td>
                <Td label="Status"><Badge tone="neutral">{r.status}</Badge></Td>
                <Td label="Received" className="text-ink/65">
                  {r.createdAt ? r.createdAt.toLocaleDateString("en-GB") : "—"}
                </Td>
                <Td label="">
                  <Link
                    href={r.href}
                    className="text-sm font-bold text-ink underline decoration-teal decoration-2 underline-offset-4 hover:text-green-deep"
                  >
                    Manage
                  </Link>
                </Td>
              </Tr>
            );
          })}
        </Table>
      </Panel>
    </AdminPage>
  );
}
