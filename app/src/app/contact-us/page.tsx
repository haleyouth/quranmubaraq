import type { Metadata } from "next";
import { Mail, MessageCircle, Phone, Clock } from "lucide-react";
import { site } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Section";
import { RegistrationForm } from "@/components/sections/RegistrationForm";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Get in touch with ${site.name} by phone, email or WhatsApp. We reply within one working day.`,
};

const channels = [
  {
    icon: Phone,
    label: "Phone",
    value: site.phone,
    href: site.phoneHref,
    note: "Call us during office hours",
    accent: "bg-purple",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with us",
    href: site.whatsapp,
    note: "Usually the fastest way to reach us",
    accent: "bg-teal",
  },
  {
    icon: Mail,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    note: "We reply within one working day",
    accent: "bg-magenta",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title={
          <>
            We&rsquo;d love to <span className="text-magenta">hear from you.</span>
          </>
        }
        body="Questions about a course, timings, fees or teachers? Reach us on whichever channel suits you best."
        breadcrumb={[{ label: "Contact Us" }]}
      />

      <Section tone="cream">
        <Container>
          <div className="grid gap-8 md:grid-cols-3">
            {channels.map(({ icon: Icon, label, value, href, note, accent }) => (
              <a
                key={label}
                href={href}
                {...(href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group rounded-[2rem] border-4 border-ink bg-white p-7 hard-shadow press"
              >
                <span
                  className={`grid size-14 place-items-center rounded-2xl border-2 border-ink ${accent}`}
                >
                  <Icon className="size-6 text-white" aria-hidden="true" />
                </span>
                <h2 className="font-display mt-6 text-xl text-ink">{label}</h2>
                <p className="mt-2 text-lg font-bold text-magenta">{value}</p>
                <p className="mt-2 text-sm text-ink/65">{note}</p>
              </a>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 rounded-[2rem] border-4 border-ink bg-amber p-7 text-center hard-shadow-lg sm:flex-row sm:text-left">
            <span className="grid size-16 shrink-0 place-items-center rounded-full border-2 border-ink bg-white hard-shadow">
              <Clock className="size-7 text-purple" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-2xl text-ink">
                Classes run seven days a week
              </p>
              <p className="mt-1 font-medium text-ink/80">
                We schedule around your family in your local timezone — early mornings,
                evenings and weekends included.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <RegistrationForm />
    </>
  );
}
