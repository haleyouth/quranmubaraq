import { Hero } from "@/components/sections/Hero";
import { Steps } from "@/components/sections/Steps";
import { About } from "@/components/sections/About";
import { Courses } from "@/components/sections/Courses";
import { Features } from "@/components/sections/Features";
import { Pricing } from "@/components/sections/Pricing";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { CtaBand } from "@/components/sections/CtaBand";
import { RegistrationForm } from "@/components/sections/RegistrationForm";
import { Marquee } from "@/components/ui/Marquee";
import { marqueeItems, site } from "@/lib/content";
import { JsonLd, faqSchema, offerSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `${site.name} — Learn Quran Online with Certified Teachers`,
  description:
    "Online Quran classes since 2011. One-to-one live lessons in Tajweed, Hifz and recitation with certified male and female teachers. Free trial week, no card required.",
  path: "/",
  keywords: [
    "online Quran classes",
    "learn Quran online",
    "one to one Quran teacher",
    "Quran memorization online",
    "Hifz classes online",
    "Tajweed course online",
    "female Quran teacher online",
    "Islamic studies for children",
    "free Quran trial class",
  ],
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee items={marqueeItems} />
      <Steps />
      <About />
      <Courses />
      <Features />
      <Pricing compact />
      <Testimonials />
      <CtaBand />
      <Faq />
      <RegistrationForm />
      <JsonLd data={[faqSchema(), offerSchema()]} />
    </>
  );
}
