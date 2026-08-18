import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { courses } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Section";
import { CourseCard } from "@/components/ui/CourseCard";
import { CtaBand } from "@/components/sections/CtaBand";
import { Faq } from "@/components/sections/Faq";

export const metadata = pageMetadata({
  title: "Online Quran Courses — Reading, Hifz, Tajweed & Tafseer",
  description:
    "Five structured online courses: Quran Reading with 100% Tajweed, Memorization (Hifz), Recitation, Translation with Tafseer, and Islamic Education. One-to-one live classes.",
  path: "/courses",
  keywords: ["online Quran course", "Hifz course online", "Tajweed classes", "Quran Tafseer course"],
});

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
      <JsonLd data={breadcrumbSchema([{ name: "Courses", path: "courses" }])} />
    </>
  );
}
