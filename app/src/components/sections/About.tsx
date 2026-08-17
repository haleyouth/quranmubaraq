import { Award, Heart, Globe2 } from "lucide-react";
import { about } from "@/lib/content";
import { Container, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export function About() {
  return (
    <Section id="about" tone="cream">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="font-marker text-3xl text-purple">{about.bismillah}</p>
            <h2 className="font-display mt-4 text-4xl leading-[1.1] text-ink sm:text-5xl md:text-6xl">
              {about.heading}
            </h2>
            <p className="mt-4 text-xl font-semibold text-magenta">{about.subheading}</p>

            <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/75">
              {about.body.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/about-us" variant="outline">
                More about us
              </Button>
              <Button href="/register">Book a free trial</Button>
            </div>
          </div>

          {/* Stats + value tiles */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              {about.stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`rounded-[2rem] border-4 border-ink p-7 text-center hard-shadow ${
                    i % 2 === 0 ? "bg-white" : "bg-cream-deep"
                  }`}
                >
                  <p className="font-display text-4xl text-purple">{stat.value}</p>
                  <p className="mt-2 font-semibold text-ink/70">{stat.label}</p>
                </div>
              ))}
            </div>

            <ul className="space-y-4">
              {[
                {
                  icon: Heart,
                  color: "text-magenta",
                  title: "Taught with care",
                  body: "Patient teachers who build confidence, not pressure.",
                },
                {
                  icon: Award,
                  color: "text-purple",
                  title: "Qualified Huffaz",
                  body: "Every teacher is certified and vetted before they teach.",
                },
                {
                  icon: Globe2,
                  color: "text-teal",
                  title: "Families worldwide",
                  body: "Classes scheduled in your local timezone, wherever you are.",
                },
              ].map(({ icon: Icon, color, title, body }) => (
                <li
                  key={title}
                  className="flex items-start gap-4 rounded-2xl border-2 border-ink bg-white p-5 hard-shadow"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-ink bg-cream">
                    <Icon className={`size-5 ${color}`} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display text-lg text-ink">{title}</p>
                    <p className="text-ink/70">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
