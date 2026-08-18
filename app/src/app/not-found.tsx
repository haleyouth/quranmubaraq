import { Compass } from "lucide-react";
import { Container, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Section tone="cream" className="py-28 md:py-36">
      <Container>
        <div className="mx-auto max-w-2xl rounded-[2rem] border-4 border-ink bg-white p-10 text-center hard-shadow-lg md:p-14">
          <span className="mx-auto grid size-20 place-items-center rounded-full border-4 border-ink bg-green-deep">
            <Compass className="size-9 text-white" aria-hidden="true" />
          </span>
          <p className="font-display mt-7 text-4xl text-green">404</p>
          <h1 className="font-display mt-3 text-2xl text-ink">
            We couldn&rsquo;t find that page
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/75">
            The page you are looking for may have moved or no longer exists. Let&rsquo;s
            get you back on track.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button href="/">Back to home</Button>
            <Button href="/courses" variant="outline">
              Browse courses
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
