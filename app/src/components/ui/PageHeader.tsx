import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Section";

export function PageHeader({
  eyebrow,
  title,
  body,
  breadcrumb,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  body?: string;
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    <section className="relative overflow-hidden border-b-4 border-ink bg-cream-deep py-16 md:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-ink) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <Container className="relative">
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink/60">
              <li>
                <Link href="/" className="transition-colors hover:text-magenta">
                  Home
                </Link>
              </li>
              {breadcrumb.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  <ChevronRight className="size-4" aria-hidden="true" />
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition-colors hover:text-magenta">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-ink" aria-current="page">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {eyebrow && (
          <p className="text-sm font-bold tracking-[0.25em] text-magenta uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display mt-4 max-w-4xl text-4xl leading-[1.05] text-ink sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {body && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/75">{body}</p>
        )}
      </Container>
    </section>
  );
}
