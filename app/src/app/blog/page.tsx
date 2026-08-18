import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { posts } from "@/lib/blog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Section";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata = pageMetadata({
  title: "Blog — Guidance on Teaching Children the Quran",
  description:
    "Practical articles for Muslim families: helping children love the Quran, what Tajweed really is, choosing an online academy, and what to expect when starting Hifz.",
  path: "/blog",
  keywords: ["Quran learning blog", "teaching children Quran", "Hifz advice for parents"],
});

const accents = {
  green: "bg-green",
  "green-deep": "bg-green-deep",
  teal: "bg-teal",
  gold: "bg-gold",
} as const;

export default function BlogPage() {
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title={
          <>
            Guidance for <span className="text-green-deep">learning families.</span>
          </>
        }
        body="Practical articles on teaching children the Quran, building consistency, and making the most of your classes."
        breadcrumb={[{ label: "Blog" }]}
      />

      <Section tone="cream">
        <Container>
          {/* Featured */}
          <article className="rounded-[2rem] border-4 border-ink bg-white p-7 hard-shadow-lg md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border-2 border-ink bg-gold px-3 py-1 text-xs font-bold tracking-wider text-ink uppercase">
                Latest
              </span>
              <span className="rounded-full border-2 border-ink bg-cream-deep px-3 py-1 text-xs font-bold tracking-wider text-ink uppercase">
                {featured.category}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-ink/60">
                <Clock className="size-4" aria-hidden="true" />
                {featured.readingMinutes} min read
              </span>
            </div>

            <h2 className="font-display mt-5 text-2xl leading-tight text-ink md:text-3xl">
              <Link
                href={`/blog/${featured.slug}`}
                className="hover:text-green-deep hover:underline hover:decoration-teal hover:decoration-2 hover:underline-offset-8"
              >
                {featured.title}
              </Link>
            </h2>

            <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink/75">
              {featured.excerpt}
            </p>

            <Link
              href={`/blog/${featured.slug}`}
              className="group mt-7 inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-ink bg-green-deep px-6 py-3 font-bold text-white hard-shadow press"
            >
              Read article
              <ArrowRight
                className="size-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </article>

          {/* Grid */}
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <article
                key={post.slug}
                className="group flex h-full flex-col overflow-hidden rounded-[2rem] border-4 border-ink bg-white hard-shadow transition-transform duration-200 hover:-translate-y-1"
              >
                <div
                  className={`h-3 w-full ${accents[post.accent]}`}
                  aria-hidden="true"
                />
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border-2 border-ink bg-cream-deep px-3 py-1 text-xs font-bold tracking-wider text-ink uppercase">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-ink/55">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {post.readingMinutes} min
                    </span>
                  </div>

                  <h2 className="font-display mt-5 text-xl leading-tight text-ink">
                    <Link href={`/blog/${post.slug}`} className="hover:text-green-deep">
                      {post.title}
                    </Link>
                  </h2>

                  <p className="mt-3 flex-1 leading-relaxed text-ink/75">
                    {post.excerpt}
                  </p>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-ink underline decoration-teal decoration-2 underline-offset-8 transition-colors hover:text-green-deep"
                  >
                    Read article
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand />
      <JsonLd data={breadcrumbSchema([{ name: "Blog", path: "blog" }])} />
    </>
  );
}
