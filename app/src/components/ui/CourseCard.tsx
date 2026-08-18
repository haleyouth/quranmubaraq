import Link from "next/link";
import { ArrowRight, Clock, CalendarRange, BookOpen } from "lucide-react";
import type { Course } from "@/lib/content";
import { cn } from "@/lib/utils";

const accents = {
  purple: { bar: "bg-green", chip: "bg-green", text: "text-green" },
  magenta: { bar: "bg-green-deep", chip: "bg-green-deep", text: "text-green-deep" },
  teal: { bar: "bg-teal", chip: "bg-teal", text: "text-teal" },
  amber: { bar: "bg-gold", chip: "bg-gold", text: "text-ink" },
} as const;

export function CourseCard({ course }: { course: Course }) {
  const accent = accents[course.accent];
  // Amber needs ink text for contrast; the others take white
  const chipText = course.accent === "amber" ? "text-ink" : "text-white";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border-4 border-ink bg-white hard-shadow transition-transform duration-200 hover:-translate-y-1">
      <div className={cn("h-3 w-full", accent.bar)} aria-hidden="true" />

      <div className="flex flex-1 flex-col p-7">
        <div className="flex items-start justify-between gap-4">
          <span
            className={cn(
              "grid size-14 shrink-0 place-items-center rounded-2xl border-2 border-ink",
              accent.chip,
            )}
          >
            <BookOpen className={cn("size-6", chipText)} aria-hidden="true" />
          </span>
          <span className="rounded-full border-2 border-ink bg-cream-deep px-3 py-1 text-xs font-bold tracking-wider text-ink uppercase">
            {course.level}
          </span>
        </div>

        <h3 className="font-display mt-6 text-xl leading-tight text-ink">
          {course.title}
        </h3>
        <p className="mt-3 flex-1 leading-relaxed text-ink/75">{course.short}</p>

        <dl className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border-2 border-ink bg-cream px-4 py-3">
            <dt className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-ink/60 uppercase">
              <Clock className="size-3.5" aria-hidden="true" />
              Daily
            </dt>
            <dd className="font-display mt-1 text-base text-ink">{course.daily}</dd>
          </div>
          <div className="rounded-xl border-2 border-ink bg-cream px-4 py-3">
            <dt className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-ink/60 uppercase">
              <CalendarRange className="size-3.5" aria-hidden="true" />
              Duration
            </dt>
            <dd className="font-display mt-1 text-base text-ink">{course.duration}</dd>
          </div>
        </dl>

        <Link
          href={`/courses/${course.slug}`}
          className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-ink underline decoration-teal decoration-2 underline-offset-8 transition-colors hover:text-green-deep"
        >
          Course details
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
