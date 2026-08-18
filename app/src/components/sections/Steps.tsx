import { steps } from "@/lib/content";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

const accents = {
  purple: { badge: "bg-green", shadow: "hard-shadow" },
  magenta: { badge: "bg-green-deep", shadow: "hard-shadow" },
  teal: { badge: "bg-teal", shadow: "hard-shadow" },
} as const;

export function Steps() {
  return (
    <Section id="journey" tone="deep">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Start in <span className="text-green-deep">3 easy steps.</span>
            </>
          }
          body="From first enquiry to your first class, the whole process takes a day or two — and costs nothing until you decide to continue."
        />

        <ol className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Connecting rail — desktop only, decorative */}
          <div
            aria-hidden="true"
            className="absolute top-10 right-[16%] left-[16%] hidden h-1 bg-ink/20 md:block"
          />

          {steps.map((step) => {
            const accent = accents[step.accent as keyof typeof accents];
            return (
              <li key={step.number} className="relative flex flex-col items-center">
                <span
                  className={`font-display relative z-10 grid size-20 place-items-center rounded-2xl border-4 border-ink text-2xl text-white ${accent.badge} ${accent.shadow}`}
                >
                  {step.number}
                </span>

                <div className="mt-6 w-full flex-1 rounded-[2rem] border-4 border-ink bg-white p-7 text-center hard-shadow">
                  <h3 className="font-display text-xl text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm font-bold tracking-[0.15em] text-green-deep uppercase">
                    {step.subtitle}
                  </p>
                  <p className="mt-4 leading-relaxed text-ink/75">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-14 text-center">
          <Button href="/register" size="lg" className="hard-shadow-lg press-lg">
            Start step one — it&rsquo;s free
            <ArrowRight
              className="size-5 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Button>
        </div>
      </Container>
    </Section>
  );
}
