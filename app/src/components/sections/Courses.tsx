import { ArrowRight } from "lucide-react";
import { featuredCourses } from "@/lib/content";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { CourseCard } from "@/components/ui/CourseCard";
import { Button } from "@/components/ui/Button";

export function Courses() {
  return (
    <Section id="courses" tone="white">
      <Container>
        <SectionHeading
          eyebrow="What we teach"
          title={
            <>
              Courses <span className="text-magenta">We Offer</span>
            </>
          }
          body="Every course is taught one-on-one and live, so the pace is set by your child — not by a class of thirty."
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button href="/courses" variant="outline" size="lg" className="hard-shadow-lg press-lg">
            View all 5 courses
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
