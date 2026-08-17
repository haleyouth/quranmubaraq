"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen, CalendarDays, ChartColumn, ClipboardList, CreditCard, FileText,
  GraduationCap, LayoutDashboard, LogOut, Menu, MessageSquareWarning, Plane,
  Settings, ShieldAlert, UserRound, Users, X,
} from "lucide-react";
import { getSession, ROLE_NAV, signOut, type Session } from "@/lib/admin/demo-auth";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "today", label: "Today's Classes", href: "/admin/today", icon: CalendarDays },
  { key: "leads", label: "Leads", href: "/admin/leads", icon: ClipboardList },
  { key: "students", label: "Students", href: "/admin/students", icon: Users },
  { key: "teachers", label: "Teachers", href: "/admin/teachers", icon: GraduationCap },
  { key: "classes", label: "Classes", href: "/admin/classes", icon: BookOpen },
  { key: "attendance", label: "Attendance", href: "/admin/attendance", icon: ChartColumn },
  { key: "complaints", label: "Complaints", href: "/admin/complaints", icon: MessageSquareWarning },
  { key: "leave", label: "Leave", href: "/admin/leave", icon: Plane },
  { key: "finance", label: "Finance", href: "/admin/finance", icon: CreditCard },
  { key: "reports", label: "Reports", href: "/admin/reports", icon: FileText },
  { key: "policies", label: "Rules & Policies", href: "/admin/policies", icon: ShieldAlert },
  { key: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
] as const;

const PORTAL_LABEL = {
  admin: "Admin Portal",
  principal: "Principal Portal",
  teacher: "Teacher Portal",
  student: "Student Portal",
} as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Demo session lives in localStorage, so it can only be read after mount.
  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/admin/login");
      return;
    }
    setSession(s);
    setReady(true);
  }, [router]);

  useEffect(() => setOpen(false), [pathname]);

  if (!ready || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream">
        <p className="text-ink/60">Loading portal&hellip;</p>
      </div>
    );
  }

  const allowed = ROLE_NAV[session.role];
  const items = NAV.filter((n) => allowed.includes(n.key));

  function handleSignOut() {
    signOut();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r-4 border-ink bg-ink transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b-2 border-cream/15 px-5 py-4">
          <Logo
            width={120}
            href="/admin"
            plateClassName="border-cream/25 bg-transparent px-0 py-0"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid size-9 cursor-pointer place-items-center rounded-full border-2 border-cream/30 text-cream lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="px-5 pt-4 pb-2 text-xs font-bold tracking-[0.2em] text-gold uppercase">
          {PORTAL_LABEL[session.role]}
        </p>

        <nav aria-label="Portal" className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {items.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-gold text-ink"
                    : "text-cream/75 hover:bg-cream/10 hover:text-cream",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t-2 border-cream/15 p-4">
          <div className="flex items-center gap-3">
            <span className="font-display grid size-10 shrink-0 place-items-center rounded-full border-2 border-cream/30 bg-green text-sm text-white">
              {session.avatarInitials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-cream">{session.name}</p>
              <p className="truncate text-xs text-cream/60">{session.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-cream/30 px-4 py-2 text-sm font-bold text-cream/80 transition-colors hover:border-gold hover:bg-gold hover:text-ink"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b-2 border-ink bg-cream/95 px-5 py-3 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid size-10 cursor-pointer place-items-center rounded-full border-2 border-ink bg-white hard-shadow press lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <p className="hidden text-sm font-semibold text-ink/65 lg:block">
            {session.branch}
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-bold text-ink underline decoration-teal decoration-2 underline-offset-4 hover:text-green-deep"
            >
              View website
            </Link>
            <span className="font-display grid size-9 place-items-center rounded-full border-2 border-ink bg-green text-xs text-white">
              {session.avatarInitials}
            </span>
          </div>
        </header>

        <div className="p-5 md:p-7">
          {/* Demo build warning — deliberately prominent */}
          <p className="mb-6 flex items-start gap-2 rounded-xl border-2 border-ink bg-gold px-4 py-3 text-sm font-semibold text-ink">
            <UserRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Demo portal — signed in as <strong>{session.title}</strong>. Data is
            fictional and sign-in is not secure. Do not enter real information.
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
