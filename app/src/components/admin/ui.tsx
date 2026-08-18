"use client";

import { cn } from "@/lib/utils";

/* ------------------------------- Page header ------------------------------ */

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">{title}</h1>
          {description && <p className="mt-1.5 text-ink/70">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2 sm:gap-3">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

/* ---------------------------------- Card ---------------------------------- */

export function Panel({
  title,
  description,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("rounded-2xl border-2 border-ink bg-white hard-shadow", className)}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink/12 px-5 py-4">
          <div>
            {title && <h2 className="font-display text-lg text-ink">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-sm text-ink/65">{description}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/* --------------------------------- Button --------------------------------- */

type BtnVariant = "primary" | "outline" | "ghost" | "danger";

const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-green-deep text-white border-2 border-ink hard-shadow press",
  outline: "bg-white text-ink border-2 border-ink hard-shadow press",
  ghost: "bg-transparent text-ink border-2 border-transparent hover:bg-cream-deep",
  danger: "bg-red-700 text-white border-2 border-ink hard-shadow press",
};

export function AdminButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: {
  variant?: BtnVariant;
  size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-bold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-x-0 disabled:hover:translate-y-0",
        size === "sm" ? "min-h-9 px-4 text-sm" : "min-h-11 px-5",
        btnVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- Badge --------------------------------- */

const badgeTones = {
  green: "bg-green text-white",
  greenDeep: "bg-green-deep text-white",
  gold: "bg-gold text-ink",
  teal: "bg-teal text-ink",
  sage: "bg-sage text-ink",
  danger: "bg-red-700 text-white",
  neutral: "bg-cream-deep text-ink",
} as const;

export type BadgeTone = keyof typeof badgeTones;

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-bold whitespace-nowrap",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Maps a domain status string to a badge tone and label. */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: BadgeTone; label: string }> = {
    // sessions
    live: { tone: "danger", label: "Live now" },
    upcoming: { tone: "neutral", label: "Upcoming" },
    completed: { tone: "green", label: "Completed" },
    "no-show": { tone: "danger", label: "No show" },
    // attendance
    present: { tone: "green", label: "Present" },
    absent: { tone: "danger", label: "Absent" },
    late: { tone: "gold", label: "Late" },
    excused: { tone: "sage", label: "Excused" },
    pending: { tone: "neutral", label: "Pending" },
    // users
    active: { tone: "green", label: "Active" },
    disabled: { tone: "danger", label: "Disabled" },
    // leads
    new: { tone: "gold", label: "New" },
    contacted: { tone: "teal", label: "Contacted" },
    trial: { tone: "sage", label: "Trial" },
    enrolled: { tone: "green", label: "Enrolled" },
    lost: { tone: "neutral", label: "Lost" },
    // complaints
    open: { tone: "gold", label: "Open" },
    "in-review": { tone: "teal", label: "In review" },
    resolved: { tone: "green", label: "Resolved" },
    escalated: { tone: "danger", label: "Escalated" },
    // priority
    urgent: { tone: "danger", label: "Urgent" },
    high: { tone: "gold", label: "High" },
    medium: { tone: "teal", label: "Medium" },
    low: { tone: "sage", label: "Low" },
    // leave
    approved: { tone: "green", label: "Approved" },
    rejected: { tone: "danger", label: "Rejected" },
    // invoices
    paid: { tone: "green", label: "Paid" },
    sent: { tone: "teal", label: "Sent" },
    overdue: { tone: "danger", label: "Overdue" },
    draft: { tone: "neutral", label: "Draft" },
  };

  const entry = map[status] ?? { tone: "neutral" as BadgeTone, label: status };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

/* ---------------------------------- Table --------------------------------- */

/**
 * Responsive data table.
 *
 * Below `md` the table collapses to stacked cards: each cell keeps its column
 * name as a `data-label` prefix, so a narrow screen never forces a horizontal
 * scroll through eight columns. Above `md` it is an ordinary table.
 */
export function Table({
  head,
  children,
  empty,
}: {
  head: readonly string[];
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="md:overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm md:min-w-[720px]">
        <thead className="hidden md:table-header-group">
          <tr className="border-b-2 border-ink/15">
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-3 py-3 text-xs font-bold tracking-wider text-ink/60 uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="block md:table-row-group md:divide-y md:divide-ink/10">
          {children}
        </tbody>
      </table>
      {empty && (
        <p className="py-10 text-center text-ink/55">No records match your filters.</p>
      )}
    </div>
  );
}

export function Td({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  /** Column name shown as a prefix in the stacked mobile layout. */
  label?: string;
  className?: string;
}) {
  return (
    <td
      data-label={label}
      className={cn(
        "block px-3 py-1.5 align-middle md:table-cell md:py-3.5",
        // Mobile: show the column name to the left of the value
        label &&
          "before:mr-2 before:inline-block before:min-w-[92px] before:text-xs before:font-bold before:tracking-wider before:text-ink/50 before:uppercase before:content-[attr(data-label)] md:before:hidden",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Tr({ children }: { children: React.ReactNode }) {
  return (
    <tr className="mb-3 block rounded-xl border-2 border-ink/15 bg-white p-2 transition-colors last:mb-0 md:mb-0 md:table-row md:rounded-none md:border-0 md:p-0 md:hover:bg-cream">
      {children}
    </tr>
  );
}

/* --------------------------------- Inputs --------------------------------- */

export const inputClass =
  "w-full min-h-11 rounded-xl border-2 border-ink bg-white px-3.5 py-2 text-ink placeholder:text-ink/40 focus:border-green-deep transition-colors";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/55">{hint}</span>}
    </label>
  );
}

/* ------------------------------- Stat tile -------------------------------- */

export function StatTile({
  label,
  value,
  delta,
  trend,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
}) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-white p-4 hard-shadow sm:p-5">
      <p className="text-xs font-bold tracking-wider text-ink/55 uppercase">{label}</p>
      <p className="font-display mt-2 text-3xl text-ink">{value}</p>
      {delta && (
        <p
          className={cn(
            "mt-1 text-sm font-semibold",
            trend === "up" && "text-green-deep",
            trend === "down" && "text-red-700",
            (!trend || trend === "flat") && "text-ink/60",
          )}
        >
          {delta}
        </p>
      )}
    </div>
  );
}

/* ------------------------------ Demo notice ------------------------------- */

export function DemoNotice({ children }: { children?: React.ReactNode }) {
  return (
    <p className="rounded-xl border-2 border-ink bg-gold px-4 py-3 text-sm font-semibold text-ink">
      {children ??
        "Demo data. Changes are held in memory for this session only and are not saved to a database."}
    </p>
  );
}
