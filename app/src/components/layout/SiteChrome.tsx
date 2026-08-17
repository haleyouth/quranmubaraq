"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * The admin portal has its own sidebar and top bar, so the marketing header
 * and footer must not render there. Everything under /admin is excluded.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const path = pathname.replace(/\/+$/, "") || "/";
  const isAdmin = path === "/admin" || path.startsWith("/admin/");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {/* Lives here rather than the root layout so it only targets #main,
          which exists on public pages but not inside the admin shell. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:border-2 focus:border-ink focus:bg-gold focus:px-5 focus:py-3 focus:font-bold focus:text-ink"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
