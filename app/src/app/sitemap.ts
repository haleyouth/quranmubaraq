import type { MetadataRoute } from "next";
import { courses, site } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/courses", priority: 0.9 },
    { path: "/fees", priority: 0.9 },
    { path: "/register", priority: 0.9 },
    { path: "/about-us", priority: 0.7 },
    { path: "/contact-us", priority: 0.7 },
    { path: "/downloads", priority: 0.5 },
    { path: "/blog", priority: 0.5 },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: `${site.url}${r.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: r.priority,
    })),
    ...courses.map((c) => ({
      url: `${site.url}/courses/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
