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
import { marqueeItems } from "@/lib/content";

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
    </>
  );
}
