import { Briefcase, Check, Clock, MapPin } from "lucide-react";
import { vacancies } from "@/lib/careers";
import { site } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CareersForm } from "@/components/sections/CareersForm";
import { JsonLd, breadcrumbSchema, canonical, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Careers — Teach Quran Online with Quran Mubarak",
  description:
    "Join our teaching team. Openings for female and male Quran teachers, Islamic studies teachers and an admissions coordinator. Remote, flexible hours.",
  path: "/careers",
  keywords: [
    "online Quran teacher jobs",
    "Quran teaching vacancies",
    "remote Islamic studies teacher",
    "hafiz teaching job",
  ],
});

const accents = {
  green: "bg-green",
  "green-deep": "bg-green-deep",
  teal: "bg-teal",
  gold: "bg-gold",
} as const;

/** JobPosting entities, so vacancies can surface in Google Jobs. */
function jobSchemas() {
  return vacancies.map((v) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: v.title,
    description: `${v.summary} Responsibilities: ${v.responsibilities.join("; ")}. Requirements: ${v.requirements.join("; ")}.`,
    employmentType: v.type.toUpperCase().replace("-", "_"),
    hiringOrganization: {
      "@type": "Organization",
      name: site.name,
      sameAs: site.url,
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: { "@type": "Country", name: "Worldwide" },
    directApply: true,
    url: canonical("careers"),
  }));
}

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title={
          <>
            Teach with <span className="text-green-deep">Quran Mubarak.</span>
          </>
        }
        body="We are always looking for qualified, patient teachers who want to help families build a lasting relationship with the Book of Allah."
        breadcrumb={[{ label: "Careers" }]}
      />

      <Section tone="cream">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {vacancies.map((v) => (
              <article
                key={v.slug}
                className="flex h-full flex-col overflow-hidden rounded-[2rem] border-4 border-ink bg-white hard-shadow"
              >
                <div className={`h-3 w-full ${accents[v.accent]}`} aria-hidden="true" />

                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`grid size-12 shrink-0 place-items-center rounded-2xl border-2 border-ink ${accents[v.accent]}`}
                    >
                      <Briefcase
                        className={`size-5 ${v.accent === "gold" ? "text-ink" : "text-white"}`}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="rounded-full border-2 border-ink bg-cream-deep px-3 py-1 text-xs font-bold tracking-wider text-ink uppercase">
                      {v.type}
                    </span>
                  </div>

                  <h2 className="font-display mt-5 text-xl text-ink">{v.title}</h2>

                  <p className="mt-2 flex items-center gap-1.5 text-sm text-ink/60">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {v.location}
                  </p>

                  <p className="mt-4 leading-relaxed text-ink/75">{v.summary}</p>

                  <div className="mt-5">
                    <h3 className="text-xs font-bold tracking-wider text-ink/55 uppercase">
                      What you will do
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      {v.responsibilities.map((r) => (
                        <li key={r} className="flex items-start gap-2 text-sm text-ink/75">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 flex-1">
                    <h3 className="text-xs font-bold tracking-wider text-ink/55 uppercase">
                      What we ask for
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      {v.requirements.map((r) => (
                        <li key={r} className="flex items-start gap-2 text-sm text-ink/75">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-green" aria-hidden="true" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button href="#apply" className="mt-6 w-full">
                    Apply for this role
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-10 flex flex-col items-center gap-3 rounded-2xl border-2 border-ink bg-cream-deep p-6 text-center font-medium text-ink/75 sm:flex-row sm:text-left">
            <Clock className="size-5 shrink-0 text-green" aria-hidden="true" />
            Do not see a role that fits? Submit a general application below — we
            keep every application on file and contact suitable candidates when
            an opening appears.
          </p>
        </Container>
      </Section>

      <CareersForm />

      <JsonLd
        data={[
          ...jobSchemas(),
          breadcrumbSchema([{ name: "Careers", path: "careers" }]),
        ]}
      />
    </>
  );
}
