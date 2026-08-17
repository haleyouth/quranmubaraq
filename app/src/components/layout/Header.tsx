"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, Phone, X } from "lucide-react";
import { nav, site } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Utility bar */}
      <div className="hidden border-b-2 border-ink bg-ink text-cream md:block">
        <Container className="flex items-center justify-between py-2 text-sm">
          <div className="flex items-center gap-6">
            <a
              href={site.phoneHref}
              className="flex items-center gap-2 transition-colors hover:text-amber"
            >
              <Phone className="size-4" aria-hidden="true" />
              {site.phone}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-2 transition-colors hover:text-amber"
            >
              <Mail className="size-4" aria-hidden="true" />
              {site.email}
            </a>
          </div>
          <p className="font-medium">Free trial week · No card required</p>
        </Container>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-20 border-b-4 border-ink bg-cream/95 backdrop-blur-sm">
        <Container className="flex items-center justify-between gap-4 py-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
            aria-label={`${site.name} — home`}
          >
            <span
              className="font-display grid size-11 place-items-center rounded-2xl border-2 border-ink bg-purple text-xl text-white hard-shadow"
              aria-hidden="true"
            >
              ق
            </span>
            <span className="leading-tight">
              <span className="font-display block text-xl text-ink">{site.name}</span>
              <span className="block text-xs font-medium tracking-[0.2em] text-ink/60 uppercase">
                {site.tagline}
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-2 text-[15px] font-semibold transition-colors",
                    active
                      ? "text-magenta underline decoration-teal decoration-2 underline-offset-8"
                      : "text-ink hover:text-magenta",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={site.portalUrl}
              className="hidden rounded-full px-3 py-2 text-[15px] font-bold text-ink underline decoration-teal decoration-2 underline-offset-8 transition-colors hover:text-teal sm:inline-block"
            >
              Sign in
            </a>
            <Button href="/register" size="sm" className="hidden sm:inline-flex">
              Free trial
            </Button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-11 cursor-pointer place-items-center rounded-full border-2 border-ink bg-white hard-shadow press lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-[calc(var(--spacing)*0)] bottom-0 z-30 overflow-y-auto border-t-4 border-ink bg-cream pt-24 lg:hidden"
        >
          <Container className="flex flex-col gap-2 pb-10">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border-2 border-ink bg-white px-5 py-4 text-lg font-bold text-ink hard-shadow press"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              <Button href="/register" size="lg">
                Start free trial
              </Button>
              <Button href={site.portalUrl} variant="outline" size="lg">
                Sign in to portal
              </Button>
            </div>
            <div className="mt-6 space-y-2 text-ink/75">
              <a href={site.phoneHref} className="flex items-center gap-2 font-medium">
                <Phone className="size-4" aria-hidden="true" /> {site.phone}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-2 font-medium"
              >
                <Mail className="size-4" aria-hidden="true" /> {site.email}
              </a>
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
