import Link from "next/link";
import { Facebook, Mail, MessageCircle, Phone, Twitter, Youtube } from "lucide-react";
import { courses, nav, site } from "@/lib/content";
import { Container } from "@/components/ui/Section";

const socialIcons = {
  Facebook,
  Twitter,
  YouTube: Youtube,
  Skype: MessageCircle,
} as const;

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/quranmubarak" },
  { label: "Twitter", href: "https://twitter.com/quranmubarak" },
  { label: "YouTube", href: "https://youtube.com/@quranmubarak" },
  { label: "Skype", href: "skype:quranmubarak?chat" },
] as const;

export function Footer() {
  return (
    <footer className="border-t-4 border-ink bg-ink text-cream">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span
                className="font-display grid size-11 place-items-center rounded-2xl border-2 border-cream bg-purple text-xl text-white"
                aria-hidden="true"
              >
                ق
              </span>
              <span className="leading-tight">
                <span className="font-display block text-xl text-cream">{site.name}</span>
                <span className="block text-xs font-medium tracking-[0.2em] text-cream/60 uppercase">
                  {site.tagline}
                </span>
              </span>
            </div>
            <p className="mt-5 text-cream/70">
              Teaching the Holy Quran online since {site.founded}. One-on-one live classes
              with certified male and female tutors, in your timezone.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((s) => {
                const Icon = socialIcons[s.label as keyof typeof socialIcons];
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    {...(s.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="grid size-11 place-items-center rounded-full border-2 border-cream/30 transition-colors hover:border-amber hover:bg-amber hover:text-ink"
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-labelledby="footer-links">
            <h2 id="footer-links" className="font-display text-lg text-amber">
              Quick Links
            </h2>
            <ul className="mt-5 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream/70 transition-colors hover:text-amber"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Courses */}
          <nav aria-labelledby="footer-courses">
            <h2 id="footer-courses" className="font-display text-lg text-amber">
              Our Courses
            </h2>
            <ul className="mt-5 space-y-3">
              {courses.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/courses/${c.slug}`}
                    className="text-cream/70 transition-colors hover:text-amber"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="font-display text-lg text-amber">Get in Touch</h2>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={site.phoneHref}
                  className="flex items-center gap-3 text-cream/70 transition-colors hover:text-amber"
                >
                  <Phone className="size-5 shrink-0" aria-hidden="true" />
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-3 text-cream/70 transition-colors hover:text-amber"
                >
                  <Mail className="size-5 shrink-0" aria-hidden="true" />
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-cream/70 transition-colors hover:text-amber"
                >
                  <MessageCircle className="size-5 shrink-0" aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
            <a
              href={site.portalUrl}
              className="mt-6 inline-flex min-h-11 items-center rounded-full border-2 border-amber bg-amber px-5 py-2.5 font-bold text-ink transition-colors hover:bg-transparent hover:text-amber"
            >
              Student &amp; Teacher Portal
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t-2 border-cream/20 pt-8 text-sm text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {site.founded}–{new Date().getFullYear()} {site.name}. All rights
            reserved.
          </p>
          <p className="font-marker text-base text-amber">
            Start with the Name of Allah
          </p>
        </div>
      </Container>
    </footer>
  );
}
