import type { Metadata } from "next";
import { Download, ExternalLink, FileText } from "lucide-react";
import { downloads } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Section";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "Downloads",
  description:
    "Free learning resources — Noorani Qaida in English and Urdu, Essential Duas, and the Tajweedi colour-coded Quran.",
};

export default function DownloadsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free resources"
        title={
          <>
            Downloads &amp; <span className="text-green-deep">learning aids.</span>
          </>
        }
        body="Study material for our students and their families — free to download and use at home."
        breadcrumb={[{ label: "Downloads" }]}
      />

      <Section tone="cream">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {downloads.map((r) => {
              const isExternal = "external" in r && r.external;
              const iconColor = r.accent === "bg-gold" ? "text-ink" : "text-white";

              return (
                <div
                  key={r.title}
                  className="flex h-full flex-col rounded-[2rem] border-4 border-ink bg-white p-7 hard-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`grid size-14 shrink-0 place-items-center rounded-2xl border-2 border-ink ${r.accent}`}
                    >
                      <FileText className={`size-6 ${iconColor}`} aria-hidden="true" />
                    </span>
                    <span className="rounded-full border-2 border-ink bg-cream-deep px-3 py-1 text-xs font-bold tracking-wider text-ink uppercase">
                      PDF · {r.size}
                    </span>
                  </div>

                  <h2 className="font-display mt-6 text-2xl text-ink">{r.title}</h2>
                  <p className="mt-3 flex-1 leading-relaxed text-ink/75">
                    {r.description}
                  </p>

                  <a
                    href={r.file}
                    {...(isExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : { download: true })}
                    className="group mt-6 inline-flex min-h-12 w-fit cursor-pointer items-center gap-2 rounded-full border-2 border-ink bg-green-deep px-6 py-3 font-bold text-white hard-shadow press"
                  >
                    {isExternal ? (
                      <>
                        <ExternalLink className="size-5" aria-hidden="true" />
                        Open {r.title}
                        <span className="sr-only">(opens in a new tab)</span>
                      </>
                    ) : (
                      <>
                        <Download className="size-5" aria-hidden="true" />
                        Download {r.title}
                      </>
                    )}
                  </a>
                </div>
              );
            })}
          </div>

          <p className="mt-10 rounded-2xl border-2 border-ink bg-cream-deep p-6 text-center font-medium text-ink/75">
            Enrolled students receive additional course-specific material directly from
            their teacher in class.
          </p>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
