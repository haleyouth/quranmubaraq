"use client";

import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SessionProvider } from "@/lib/admin/session-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  /*
   * The login page renders standalone, outside the authenticated shell.
   * `trailingSlash: true` means the live path is "/admin/login/", so strip
   * any trailing slash before comparing — an exact match on "/admin/login"
   * silently fails in production and traps the user on the loading state.
   */
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/admin/login") return <>{children}</>;

  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
