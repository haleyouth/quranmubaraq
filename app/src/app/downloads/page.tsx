import { pageMetadata } from "@/lib/seo";
import { BookOpen, Download, ExternalLink, FileText } from "lucide-react";
import { downloads } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Section";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata = pageMetadata({
  title: "Free Quran Learning Downloads — Qaida, Duas & Tajweed Quran",
  description:
    "Free PDF resources: Noorani Qaida in English and Urdu, Essential Duas with transliteration, and the colour-coded Tajweedi Quran. Read online or download.",
  path: "/downloads",
  keywords: ["Noorani Qaida PDF", "free Islamic PDF download", "Tajweed Quran PDF", "Islamic duas PDF"],
});

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

                  <h2 className="font-display mt-6 text-xl text-ink">{r.title}</h2>
                  <p className="mt-3 flex-1 leading-relaxed text-ink/75">
                    {r.description}
                  </p>

                  {/* Read in the browser first; downloading is the option, not the default */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={r.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border-2 border-ink bg-green-deep px-6 py-3 font-bold text-white hard-shadow press"
                    >
                      <BookOpen className="size-5" aria-hidden="true" />
                      Read online
                      <span className="sr-only">
                        — {r.title} (opens in a new tab)
                      </span>
                    </a>

                    {!isExternal && (
                      <a
                        href={r.file}
                        download
                        className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border-2 border-ink bg-white px-5 py-3 font-bold text-ink hard-shadow press"
                      >
                        <Download className="size-5" aria-hidden="true" />
                        Download
                        <span className="sr-only"> {r.title}</span>
                      </a>
                    )}

                    {isExternal && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-ink/55">
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        Hosted externally
                      </span>
                    )}
                  </div>
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
