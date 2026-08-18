"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen, Briefcase, CalendarDays, ChartColumn, ClipboardList, CreditCard, FileText,
  Eye, GraduationCap, LayoutDashboard, LogOut, Menu, MessageSquareWarning,
  MessageCircle, PanelLeftClose, PanelLeftOpen, Plane, Settings, ShieldAlert, UserRound,
  Users, X,
} from "lucide-react";
import {
  getImpersonation,
  getSession,
  ROLE_NAV,
  signOut,
  stopImpersonation,
  type Impersonation,
  type Session,
} from "@/lib/admin/demo-auth";
import { InlineClock } from "@/components/admin/DateTimePanel";
import { AyahBar } from "@/components/admin/AyahBar";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "today", label: "Today's Classes", href: "/admin/today", icon: CalendarDays },
  { key: "messages", label: "Messages", href: "/admin/messages", icon: MessageCircle },
  { key: "leads", label: "Leads", href: "/admin/leads", icon: ClipboardList },
  { key: "applications", label: "Applications", href: "/admin/applications", icon: Briefcase },
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

const COLLAPSE_KEY = "qm_admin_sidebar_collapsed";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Restore the collapsed preference across navigations and reloads
  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const [impersonation, setImpersonation] = useState<Impersonation | null>(null);

  // Demo session lives in localStorage, so it can only be read after mount.
  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/admin/login");
      return;
    }
    setSession(s);
    setImpersonation(getImpersonation());
    setReady(true);
  }, [router, pathname]);

  function handleReturn() {
    if (stopImpersonation()) {
      setSession(getSession());
      setImpersonation(null);
      router.push("/admin");
    }
  }

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
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r-4 border-ink bg-ink transition-all lg:translate-x-0",
          collapsed ? "w-72 lg:w-20" : "w-72",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 border-b-2 border-cream/15 px-5 py-4",
            collapsed ? "lg:justify-center lg:px-2" : "justify-between",
          )}
        >
          {/* Full logo always — it scales down rather than being replaced */}
          <Logo
            width={collapsed ? 56 : 120}
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

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={cn(
              "hidden size-9 cursor-pointer place-items-center rounded-full border-2 border-cream/30 text-cream transition-colors hover:border-gold hover:bg-gold hover:text-ink lg:grid",
              collapsed && "lg:hidden",
            )}
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="mx-auto mt-3 hidden size-9 cursor-pointer place-items-center rounded-full border-2 border-cream/30 text-cream transition-colors hover:border-gold hover:bg-gold hover:text-ink lg:grid"
          >
            <PanelLeftOpen className="size-4" />
          </button>
        )}

        <p
          className={cn(
            "px-5 pt-4 pb-2 text-xs font-bold tracking-[0.2em] text-gold uppercase",
            collapsed && "lg:hidden",
          )}
        >
          {PORTAL_LABEL[session.role]}
        </p>

        <nav aria-label="Portal" className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {items.map((item) => {
            // trailingSlash: true means pathname is e.g. "/admin/teachers/"
            const path = pathname.replace(/\/+$/, "") || "/";
            const active =
              item.href === "/admin" ? path === "/admin" : path.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  collapsed && "lg:justify-center lg:px-0",
                  active
                    ? "bg-gold text-ink"
                    : "text-cream/75 hover:bg-cream/10 hover:text-cream",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className={collapsed ? "lg:sr-only" : undefined}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className={cn("border-t-2 border-cream/15 p-4", collapsed && "lg:px-2")}>
          <div className={cn("flex items-center gap-3", collapsed && "lg:justify-center")}>
            <span
              className="font-display grid size-10 shrink-0 place-items-center rounded-full border-2 border-cream/30 bg-green text-sm text-white"
              title={collapsed ? session.name : undefined}
            >
              {session.avatarInitials}
            </span>
            <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
              <p className="truncate text-sm font-bold text-cream">{session.name}</p>
              <p className="truncate text-xs text-cream/60">{session.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            title={collapsed ? "Sign out" : undefined}
            className={cn(
              "mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-cream/30 px-4 py-2 text-sm font-bold text-cream/80 transition-colors hover:border-gold hover:bg-gold hover:text-ink",
              collapsed && "lg:px-0",
            )}
          >
            <LogOut className="size-4 shrink-0" aria-hidden="true" />
            <span className={collapsed ? "lg:sr-only" : undefined}>Sign out</span>
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
      <div className={cn("transition-all", collapsed ? "lg:pl-20" : "lg:pl-72")}>
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b-2 border-ink bg-cream/95 px-5 py-3 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid size-10 cursor-pointer place-items-center rounded-full border-2 border-ink bg-white hard-shadow press lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="hidden items-center gap-4 lg:flex">
            <p className="text-sm font-semibold text-ink/65">{session.branch}</p>
            <InlineClock />
          </div>

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
          <AyahBar />

          {/* Impersonation takes priority — it must never be missed */}
          {impersonation ? (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-green-deep px-4 py-3 text-white">
              <p className="flex items-start gap-2 text-sm font-semibold">
                <Eye className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  Viewing as <strong>{impersonation.target.name}</strong> (
                  {impersonation.target.title}). You are seeing exactly what they see.
                  Signed in as {impersonation.actor.name}.
                </span>
              </p>
              <button
                type="button"
                onClick={handleReturn}
                className="inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border-2 border-white bg-white px-4 py-1.5 text-sm font-bold text-green-deep transition-colors hover:bg-transparent hover:text-white"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                Return to my account
              </button>
            </div>
          ) : (
            <p className="mb-6 flex items-start gap-2 rounded-xl border-2 border-ink bg-gold px-4 py-3 text-sm font-semibold text-ink">
              <UserRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Demo portal — signed in as <strong>{session.title}</strong>. Data is
                fictional and sign-in is not secure. Do not enter real information.
              </span>
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
