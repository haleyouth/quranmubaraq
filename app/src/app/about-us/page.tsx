import type { Metadata } from "next";
import { about, site } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { About } from "@/components/sections/About";
import { Features } from "@/components/sections/Features";
import { Testimonials } from "@/components/sections/Testimonials";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "About us",
  description: about.body[0],
};

const milestones = [
  {
    year: "2011",
    title: "Quran Mubarak is founded",
    body: `${site.founder} begins teaching a handful of students online, with a simple conviction: one-on-one attention beats a crowded classroom.`,
  },
  {
    year: "2015",
    title: "Female teaching staff joins",
    body: "Growing demand from families for female teachers leads us to build a dedicated female teaching team.",
  },
  {
    year: "2019",
    title: "Curriculum expands to five courses",
    body: "Translation and Islamic Education join Reading, Memorization and Recitation, completing the learning journey.",
  },
  {
    year: "Today",
    title: "Families across the world",
    body: "Students in the UK, US, Canada, Australia and the Gulf learn with us daily, each in their own timezone.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Since 2011"
        title={
          <>
            About <span className="text-green-deep">Quran Mubarak</span>
          </>
        }
        body={about.subheading}
        breadcrumb={[{ label: "About us" }]}
      />

      <About />

      <Section tone="deep">
        <Container>
          <SectionHeading
            eyebrow="Our story"
            title={
              <>
                A decade of <span className="text-green-deep">teaching.</span>
              </>
            }
          />

          <ol className="mx-auto mt-16 max-w-3xl space-y-6">
            {milestones.map((m, i) => (
              <li key={m.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <span className="font-display grid size-16 shrink-0 place-items-center rounded-2xl border-4 border-ink bg-green text-sm text-white hard-shadow">
                    {m.year}
                  </span>
                  {i < milestones.length - 1 && (
                    <span aria-hidden="true" className="mt-2 w-1 flex-1 bg-ink/20" />
                  )}
                </div>
                <div className="flex-1 rounded-[2rem] border-4 border-ink bg-white p-7 hard-shadow">
                  <h3 className="font-display text-2xl text-ink">{m.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink/75">{m.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Features />
      <Testimonials />
      <CtaBand />
    </>
  );
}
