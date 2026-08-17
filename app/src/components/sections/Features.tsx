import {
  ChartLine,
  Clock,
  Gift,
  GraduationCap,
  UserRound,
  UsersRound,
} from "lucide-react";
import { features } from "@/lib/content";
import { Container, Section, SectionHeading } from "@/components/ui/Section";

const icons = {
  "user-round": UserRound,
  "graduation-cap": GraduationCap,
  "users-round": UsersRound,
  clock: Clock,
  gift: Gift,
  "chart-line": ChartLine,
} as const;

// Rotate accent colours so the grid reads as one system without repeating
const accentCycle = ["bg-purple", "bg-magenta", "bg-teal", "bg-amber"] as const;

export function Features() {
  return (
    <Section tone="cream">
      <Container>
        <SectionHeading
          eyebrow="Why families choose us"
          title={
            <>
              Built around <span className="text-magenta">your family.</span>
            </>
          }
          body="Over a decade of teaching Muslim families online has taught us what actually matters — and what does not."
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = icons[feature.icon as keyof typeof icons];
            const accent = accentCycle[i % accentCycle.length];
            const iconColor = accent === "bg-amber" ? "text-ink" : "text-white";

            return (
              <div
                key={feature.title}
                className="rounded-[2rem] border-4 border-ink bg-white p-7 hard-shadow transition-transform duration-200 hover:-translate-y-1"
              >
                <span
                  className={`grid size-14 place-items-center rounded-2xl border-2 border-ink ${accent}`}
                >
                  <Icon className={`size-6 ${iconColor}`} aria-hidden="true" />
                </span>
                <h3 className="font-display mt-6 text-xl text-ink">{feature.title}</h3>
                <p className="mt-3 leading-relaxed text-ink/75">{feature.body}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
