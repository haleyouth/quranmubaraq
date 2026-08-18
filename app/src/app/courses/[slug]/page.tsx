import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CalendarRange, Check, Clock, GraduationCap } from "lucide-react";
import { courses } from "@/lib/content";
import { JsonLd, breadcrumbSchema, courseSchema, pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/ui/CourseCard";
import { CtaBand } from "@/components/sections/CtaBand";

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) return { title: "Course not found" };

  return pageMetadata({
    title: `${course.title} — Online, One-to-One`,
    description: course.metaDescription,
    path: `/courses/${course.slug}`,
  });
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  const related = courses.filter((c) => c.slug !== course.slug).slice(0, 3);


  return (
    <>
      <PageHeader
        eyebrow={`${course.level} · ${course.duration}`}
        title={course.title}
        body={course.short}
        breadcrumb={[{ label: "Courses", href: "/courses" }, { label: course.title }]}
      />

      <Section tone="cream">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-display text-2xl text-ink">About this course</h2>
              <p className="mt-5 text-base leading-relaxed text-ink/75">
                {course.description}
              </p>

              <h2 className="font-display mt-12 text-2xl text-ink">
                What your child will achieve
              </h2>
              <ul className="mt-6 space-y-4">
                {course.outcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex items-start gap-4 rounded-2xl border-2 border-ink bg-white p-5 hard-shadow"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-teal">
                      <Check className="size-4 text-white" aria-hidden="true" />
                    </span>
                    <span className="font-semibold text-ink/85">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sticky summary */}
            <aside className="lg:sticky lg:top-32 lg:self-start">
              <div className="rounded-[2rem] border-4 border-ink bg-white p-8 hard-shadow-lg">
                <h2 className="font-display text-xl text-ink">Course at a glance</h2>

                <dl className="mt-6 space-y-4">
                  {[
                    { icon: Clock, label: "Daily class", value: course.daily },
                    { icon: CalendarRange, label: "Duration", value: course.duration },
                    { icon: GraduationCap, label: "Level", value: course.level },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 rounded-xl border-2 border-ink bg-cream px-4 py-3"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-white">
                        <Icon className="size-4 text-green" aria-hidden="true" />
                      </span>
                      <div>
                        <dt className="text-xs font-bold tracking-wider text-ink/55 uppercase">
                          {label}
                        </dt>
                        <dd className="font-display text-base text-ink">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 rounded-2xl border-2 border-ink bg-gold p-5 text-center">
                  <p className="font-display text-lg text-ink">First week free</p>
                  <p className="mt-1 text-sm font-medium text-ink/80">
                    Three trial classes, no card required.
                  </p>
                </div>

                <Button href="/register" size="lg" className="mt-6 w-full">
                  Start free trial
                  <ArrowRight
                    className="size-5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>

                <Link
                  href="/fees"
                  className="mt-4 block text-center font-bold text-ink underline decoration-teal decoration-2 underline-offset-8 hover:text-green-deep"
                >
                  See fees structure
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <h2 className="font-display text-2xl text-ink">Other courses</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand />

      <JsonLd
        data={[
          courseSchema(course),
          breadcrumbSchema([
            { name: "Courses", path: "courses" },
            { name: course.title, path: `courses/${course.slug}` },
          ]),
        ]}
      />
    </>
  );
}
