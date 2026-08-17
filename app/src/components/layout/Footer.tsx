import Link from "next/link";
import {
  Facebook,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { courses, nav, site, socials } from "@/lib/content";
import { Container } from "@/components/ui/Section";
import { Logo } from "@/components/ui/Logo";

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  skype: MessageCircle,
} as const;

export function Footer() {
  return (
    <footer className="border-t-4 border-ink bg-ink text-cream">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Logo
              width={150}
              plateClassName="border-cream/25 bg-transparent px-0 py-0"
            />
            <p className="mt-5 text-cream/70">
              Teaching the Holy Quran online since {site.founded}. One-on-one live classes
              with certified male and female tutors, in your timezone.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => {
                const Icon = socialIcons[s.icon];
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={`${site.name} on ${s.label}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-11 place-items-center rounded-full border-2 border-cream/30 transition-colors hover:border-gold hover:bg-gold hover:text-ink"
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-labelledby="footer-links">
            <h2 id="footer-links" className="font-display text-lg text-gold">
              Quick Links
            </h2>
            <ul className="mt-5 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream/70 transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Courses */}
          <nav aria-labelledby="footer-courses">
            <h2 id="footer-courses" className="font-display text-lg text-gold">
              Our Courses
            </h2>
            <ul className="mt-5 space-y-3">
              {courses.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/courses/${c.slug}`}
                    className="text-cream/70 transition-colors hover:text-gold"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="font-display text-lg text-gold">Get in Touch</h2>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={site.phoneHref}
                  className="flex items-center gap-3 text-cream/70 transition-colors hover:text-gold"
                >
                  <Phone className="size-5 shrink-0" aria-hidden="true" />
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-3 text-cream/70 transition-colors hover:text-gold"
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
                  className="flex items-center gap-3 text-cream/70 transition-colors hover:text-gold"
                >
                  <MessageCircle className="size-5 shrink-0" aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
            <a
              href={site.portalUrl}
              className="mt-6 inline-flex min-h-11 items-center rounded-full border-2 border-gold bg-gold px-5 py-2.5 font-bold text-ink transition-colors hover:bg-transparent hover:text-gold"
            >
              Student &amp; Teacher Portal
            </a>
          </div>
        </div>

        <div className="mt-14 border-t-2 border-cream/20 pt-8">
          <p className="font-marker text-center text-lg text-gold">
            Start with the Name of Allah
          </p>

          <div className="mt-6 flex flex-col items-center gap-4 text-sm text-cream/60 sm:flex-row sm:justify-between">
            <p>
              &copy; {site.founded}&ndash;{new Date().getFullYear()} {site.name}. All
              rights reserved.
            </p>

            <p>
              Powered by{" "}
              <a
                href="https://thalamux-tech.web.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-cream/80 underline decoration-teal decoration-2 underline-offset-4 transition-colors hover:text-gold"
              >
                ThalamuxTech
              </a>
            </p>

            {/* Discreet staff entry point */}
            <Link
              href="/admin/login"
              aria-label="Staff portal login"
              title="Staff portal"
              className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-cream/25 text-cream/50 transition-colors hover:border-gold hover:bg-gold hover:text-ink"
            >
              <Lock className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
