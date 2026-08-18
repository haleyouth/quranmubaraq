import { ArrowRight, MessageCircle } from "lucide-react";
import { cta } from "@/lib/content";
import { Container, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export function CtaBand() {
  return (
    <Section tone="ink" className="islamic-pattern-strong relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-[26rem] rounded-full bg-green/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 size-[22rem] rounded-full bg-green-deep/30 blur-3xl"
      />

      <Container className="relative">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-marker text-3xl text-gold">Start with the Name of Allah</p>
          <h2 className="font-display mt-5 text-4xl leading-[1.1] text-cream sm:text-5xl md:text-6xl">
            {cta.heading}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-cream/80">
            {cta.body}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Button
              href={cta.primary.href}
              variant="secondary"
              size="lg"
              className="hard-shadow-lg press-lg"
            >
              {cta.primary.label}
              <ArrowRight
                className="size-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Button>
            <a
              href={cta.secondary.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-lg font-bold text-cream underline decoration-teal decoration-2 underline-offset-8 transition-colors hover:text-teal"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              {cta.secondary.label}
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
