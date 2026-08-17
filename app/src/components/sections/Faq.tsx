import { ChevronDown } from "lucide-react";
import { faqs } from "@/lib/content";
import { Container, Section, SectionHeading } from "@/components/ui/Section";

export function Faq() {
  return (
    <Section id="faq" tone="white">
      <Container>
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              Common <span className="text-magenta">questions.</span>
            </>
          }
        />

        {/* Native details/summary — keyboard accessible with no JS */}
        <div className="mx-auto mt-14 max-w-3xl space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border-4 border-ink bg-cream hard-shadow open:bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 text-left [&::-webkit-details-marker]:hidden">
                <h3 className="font-display text-lg text-ink md:text-xl">{faq.q}</h3>
                <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-white transition-transform duration-200 group-open:rotate-180 group-open:bg-magenta group-open:text-white">
                  <ChevronDown className="size-5" aria-hidden="true" />
                </span>
              </summary>
              <div className="border-t-2 border-ink/15 px-6 py-5">
                <p className="leading-relaxed text-ink/75">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
