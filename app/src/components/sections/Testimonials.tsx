import { Quote } from "lucide-react";
import { testimonials } from "@/lib/content";
import { Container, Section, SectionHeading } from "@/components/ui/Section";

const tilts = ["-rotate-1", "rotate-1", "-rotate-1"] as const;
const fills = ["bg-white", "bg-cream-deep", "bg-white"] as const;

export function Testimonials() {
  return (
    <Section tone="cream">
      <Container>
        <SectionHeading
          eyebrow="Parent voices"
          title={
            <>
              Trusted by families <span className="text-green-deep">worldwide.</span>
            </>
          }
        />

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className={`flex h-full flex-col rounded-[2rem] border-4 border-ink p-7 hard-shadow ${fills[i % fills.length]} ${tilts[i % tilts.length]}`}
            >
              <Quote className="size-9 shrink-0 text-green-deep" aria-hidden="true" />
              <blockquote className="mt-5 flex-1 text-lg leading-relaxed text-ink/80">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t-2 border-ink/15 pt-5">
                <span className="font-display grid size-12 shrink-0 place-items-center rounded-full border-2 border-ink bg-green text-lg text-white">
                  {t.name.charAt(0)}
                </span>
                <span>
                  <span className="font-display block text-lg text-ink">{t.name}</span>
                  <span className="block text-sm font-medium text-ink/60">
                    {t.location}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
