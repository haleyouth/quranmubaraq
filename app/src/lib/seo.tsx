import type { Metadata } from "next";
import { courses, faqs, plans, site, socials } from "@/lib/content";

/**
 * SEO helpers.
 *
 * Two audiences are served deliberately:
 *  - Search engines: canonical URLs, OpenGraph, and JSON-LD entities that
 *    map onto the schema.org types Google actually renders.
 *  - Generative engines (GEO): the same JSON-LD plus explicit, quotable
 *    question-and-answer text. LLM crawlers extract factual claims far more
 *    reliably from structured Q&A than from marketing prose, so the FAQ and
 *    course facts are stated once, unambiguously, in machine-readable form.
 */

const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;

/** Absolute canonical for a route, so every page declares one exactly once. */
export function canonical(path = "/") {
  const clean = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
  return `${site.url}${clean}`;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
}): Metadata {
  const url = canonical(path);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: site.name,
      locale: "en_GB",
      images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand/og-image.png"],
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                  JSON-LD                                   */
/* -------------------------------------------------------------------------- */

/** Organization + WebSite, emitted once in the root layout. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["EducationalOrganization", "OnlineBusiness"],
        "@id": ORG_ID,
        name: site.name,
        alternateName: "Quran Mubarak Online Quran Academy",
        description: site.description,
        url: site.url,
        logo: {
          "@type": "ImageObject",
          url: `${site.url}/icon-512.png`,
          width: 512,
          height: 512,
        },
        image: `${site.url}/brand/og-image.png`,
        foundingDate: String(site.founded),
        founder: { "@type": "Person", name: site.founder },
        email: site.email,
        telephone: site.phone,
        sameAs: socials.map((s) => s.href),
        areaServed: {
          "@type": "GeoShape",
          name: "Worldwide",
        },
        knowsLanguage: ["en", "ur", "ar"],
        slogan: "Start with the Name of Allah",
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "admissions",
            telephone: site.phone,
            email: site.email,
            availableLanguage: ["English", "Urdu", "Arabic"],
            areaServed: "Worldwide",
          },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Online Quran and Islamic education courses",
          itemListElement: courses.map((c) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Course",
              name: c.title,
              description: c.short,
              url: canonical(`courses/${c.slug}`),
            },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: { "@id": ORG_ID },
        inLanguage: "en-GB",
      },
    ],
  };
}

/** Course schema with the provider and delivery mode search engines expect. */
export function courseSchema(course: (typeof courses)[number]) {
  const durationMonths = /year/i.test(course.duration)
    ? parseInt(course.duration, 10) * 12
    : parseInt(course.duration, 10);

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    url: canonical(`courses/${course.slug}`),
    provider: { "@type": "EducationalOrganization", name: site.name, "@id": ORG_ID },
    educationalLevel: course.level,
    teaches: course.outcomes,
    inLanguage: "en",
    isAccessibleForFree: false,
    offers: {
      "@type": "Offer",
      category: "Paid",
      price: plans[1].usd,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: canonical("fees"),
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `P${durationMonths || 6}M`,
      instructor: { "@type": "Organization", name: site.name },
    },
  };
}

/** FAQPage — the entity most often surfaced in AI answers and rich results. */
export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Breadcrumbs, so search results show the site hierarchy rather than a bare URL. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: canonical(c.path),
    })),
  };
}

/** Price list, so fees are quotable as fact rather than inferred from a table. */
export function offerSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} fee plans`,
    itemListElement: plans.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Offer",
        name: p.name,
        price: p.usd,
        priceCurrency: "USD",
        description: `${p.classLength} per class, ${p.frequency}. Admission ${p.admission}. Sibling discount ${p.sibling}.`,
        availability: "https://schema.org/InStock",
        url: canonical("fees"),
        seller: { "@id": ORG_ID },
      },
    })),
  };
}

export function articleSchema(post: {
  title: string;
  excerpt: string;
  published: string;
  slug: string;
  readingMinutes: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published,
    dateModified: post.published,
    url: canonical(`blog/${post.slug}`),
    wordCount: post.readingMinutes * 200,
    author: { "@type": "Organization", name: site.name, "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    image: `${site.url}/brand/og-image.png`,
    inLanguage: "en-GB",
    isPartOf: { "@id": SITE_ID },
  };
}

/** Renders one or more JSON-LD blocks. */
export function JsonLd({ data }: { data: object | object[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
