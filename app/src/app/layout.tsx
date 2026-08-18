import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Outfit, Shadows_Into_Light } from "next/font/google";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { FirebaseAnalytics } from "@/components/FirebaseAnalytics";
import { site } from "@/lib/content";
import { JsonLd, canonical, organizationSchema } from "@/lib/seo";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const body = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const marker = Shadows_Into_Light({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-shadows",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} – ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "online Quran classes",
    "learn Quran online",
    "Quran memorization",
    "Hifz online",
    "Tajweed course",
    "Islamic education online",
    "female Quran teacher",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} – ${site.tagline}`,
    description: site.description,
    url: site.url,
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} – ${site.tagline}`,
    description: site.description,
    images: ["/brand/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  alternates: { canonical: canonical("/") },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2d1b4d",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${marker.variable}`}
    >
      <body>
        <SiteChrome>{children}</SiteChrome>
        <FirebaseAnalytics />
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
