import type { Metadata } from "next";
import { courses } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Section";
import { CourseCard } from "@/components/ui/CourseCard";
import { CtaBand } from "@/components/sections/CtaBand";
import { Faq } from "@/components/sections/Faq";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Quran Reading, Memorization, Recitation, Translation and Islamic Education — taught one-on-one, live, with certified male and female tutors.",
};

export default function CoursesPage() {
  return (
    <>
      <PageHeader
        eyebrow="What we teach"
        title={
          <>
            Courses <span className="text-green-deep">We Offer</span>
          </>
        }
        body="Five structured courses covering the complete journey — from recognising your first Arabic letter to understanding the Tafseer of the Holy Quran."
        breadcrumb={[{ label: "Courses" }]}
      />

      <Section tone="cream">
        <Container>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand />
      <Faq />
    </>
  );
}
