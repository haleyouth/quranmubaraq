import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { getPost, posts } from "@/lib/blog";
import { JsonLd, articleSchema, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CtaBand } from "@/components/sections/CtaBand";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found" };

  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);


  return (
    <>
      <PageHeader
        eyebrow={post.category}
        title={post.title}
        breadcrumb={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
      />

      <Section tone="cream">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            <article>
              <div className="flex flex-wrap items-center gap-4 border-b-2 border-ink/15 pb-5 text-sm text-ink/60">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" aria-hidden="true" />
                  <time dateTime={post.published}>
                    {new Date(post.published).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" aria-hidden="true" />
                  {post.readingMinutes} min read
                </span>
                <span>By {post.author}</span>
              </div>

              <p className="mt-7 text-lg leading-relaxed font-medium text-ink/85">
                {post.excerpt}
              </p>

              <div className="mt-8 space-y-8">
                {post.body.map((block, i) => (
                  <section key={i}>
                    {block.heading && (
                      <h2 className="font-display mt-10 text-xl text-ink md:text-2xl">
                        {block.heading}
                      </h2>
                    )}
                    <div className="mt-4 space-y-5">
                      {block.paragraphs.map((p, j) => (
                        <p key={j} className="text-base leading-relaxed text-ink/75">
                          {p}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-12 rounded-[2rem] border-4 border-ink bg-gold p-7 hard-shadow-lg">
                <p className="font-display text-xl text-ink">
                  Ready to start your child&rsquo;s journey?
                </p>
                <p className="mt-2 font-medium text-ink/80">
                  Three free 30-minute classes with a certified teacher. No card
                  required.
                </p>
                <Button href="/register" className="mt-5">
                  Start free trial
                  <ArrowRight
                    className="size-5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-32 lg:self-start">
              <div className="rounded-[2rem] border-4 border-ink bg-white p-7 hard-shadow">
                <h2 className="font-display text-lg text-ink">More articles</h2>
                <ul className="mt-5 space-y-4">
                  {related.map((p) => (
                    <li key={p.slug} className="border-b-2 border-ink/10 pb-4 last:border-0 last:pb-0">
                      <Link
                        href={`/blog/${p.slug}`}
                        className="font-semibold text-ink hover:text-green-deep hover:underline hover:decoration-teal hover:decoration-2 hover:underline-offset-4"
                      >
                        {p.title}
                      </Link>
                      <p className="mt-1 text-sm text-ink/60">
                        {p.category} · {p.readingMinutes} min read
                      </p>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/blog"
                  className="mt-6 inline-block font-bold text-ink underline decoration-teal decoration-2 underline-offset-8 hover:text-green-deep"
                >
                  All articles &rarr;
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <CtaBand />

      <JsonLd
        data={[
          articleSchema(post),
          breadcrumbSchema([
            { name: "Blog", path: "blog" },
            { name: post.title, path: `blog/${post.slug}` },
          ]),
        ]}
      />
    </>
  );
}
