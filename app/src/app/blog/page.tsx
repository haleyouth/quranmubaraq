import type { Metadata } from "next";
import { PenLine } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles and guidance on learning the Quran, teaching children, and building a household around the Book of Allah.",
};

export default function BlogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title={
          <>
            Guidance for <span className="text-green-deep">learning families.</span>
          </>
        }
        body="Practical articles on teaching children the Quran, building consistency, and making the most of your classes."
        breadcrumb={[{ label: "Blog" }]}
      />

      <Section tone="cream">
        <Container>
          {/* Empty state — the CMS-backed listing replaces this once content is migrated */}
          <div className="mx-auto max-w-2xl rounded-[2rem] border-4 border-ink bg-white p-10 text-center hard-shadow-lg md:p-14">
            <span className="mx-auto grid size-20 place-items-center rounded-full border-4 border-ink bg-green">
              <PenLine className="size-9 text-white" aria-hidden="true" />
            </span>
            <h2 className="font-display mt-7 text-3xl text-ink">
              Articles are on their way
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink/75">
              We are preparing a library of guidance for parents and students. In the
              meantime, our team is always happy to answer your questions directly.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button href="/contact-us">Ask us a question</Button>
              <Button href="/courses" variant="outline">
                Explore our courses
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
