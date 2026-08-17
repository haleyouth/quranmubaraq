import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Section";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "Downloads",
  description:
    "Free learning resources — Noorani Qaida, Tajweed rules, daily Duas and Salah guides for students of Quran Mubarak.",
};

/**
 * Resource files are not yet supplied. Each entry's `file` is null until the
 * PDF is added to /public/downloads — the card then renders as a live link.
 */
const resources = [
  {
    title: "Noorani Qaida",
    description:
      "The complete foundational primer for learning to read Arabic letters and words.",
    size: "PDF",
    file: null,
    accent: "bg-purple",
  },
  {
    title: "Tajweed Rules Summary",
    description:
      "A one-page reference of the essential Tajweed rules covered in the Reading course.",
    size: "PDF",
    file: null,
    accent: "bg-magenta",
  },
  {
    title: "Daily Duas for Children",
    description:
      "Everyday supplications with transliteration and translation, formatted for young learners.",
    size: "PDF",
    file: null,
    accent: "bg-teal",
  },
  {
    title: "Salah Step-by-Step Guide",
    description:
      "An illustrated guide to performing Salah correctly, from wudu through to tasleem.",
    size: "PDF",
    file: null,
    accent: "bg-amber",
  },
] as const;

export default function DownloadsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free resources"
        title={
          <>
            Downloads &amp; <span className="text-magenta">learning aids.</span>
          </>
        }
        body="Supporting material for our students and their families — free to download and use at home."
        breadcrumb={[{ label: "Downloads" }]}
      />

      <Section tone="cream">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {resources.map((r) => {
              const available = r.file !== null;
              const iconColor = r.accent === "bg-amber" ? "text-ink" : "text-white";

              return (
                <div
                  key={r.title}
                  className="flex h-full flex-col rounded-[2rem] border-4 border-ink bg-white p-7 hard-shadow"
                >
                  <span
                    className={`grid size-14 place-items-center rounded-2xl border-2 border-ink ${r.accent}`}
                  >
                    <FileText className={`size-6 ${iconColor}`} aria-hidden="true" />
                  </span>

                  <h2 className="font-display mt-6 text-2xl text-ink">{r.title}</h2>
                  <p className="mt-3 flex-1 leading-relaxed text-ink/75">
                    {r.description}
                  </p>

                  {available ? (
                    <a
                      href={r.file!}
                      download
                      className="group mt-6 inline-flex min-h-12 w-fit cursor-pointer items-center gap-2 rounded-full border-2 border-ink bg-magenta px-6 py-3 font-bold text-white hard-shadow press"
                    >
                      <Download className="size-5" aria-hidden="true" />
                      Download {r.size}
                    </a>
                  ) : (
                    <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border-2 border-ink bg-cream-deep px-5 py-2.5 text-sm font-bold text-ink/70">
                      Coming soon
                    </p>
                  )}
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
