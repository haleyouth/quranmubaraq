import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { RegistrationForm } from "@/components/sections/RegistrationForm";
import { Steps } from "@/components/sections/Steps";

export const metadata = pageMetadata({
  title: "Register for a Free Quran Trial Class — No Card Required",
  description:
    "Register in under a minute for three free 30-minute Quran classes with a certified teacher. No card details, no obligation, scheduled in your timezone.",
  path: "/register",
  keywords: ["free Quran trial class", "register online Quran class", "book Quran lesson"],
});

export default function RegisterPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free trial"
        title={
          <>
            Register for your <span className="text-green-deep">free trial.</span>
          </>
        }
        body="Three free 30-minute classes with a certified teacher. No card details, no obligation."
        breadcrumb={[{ label: "Register" }]}
      />
      <RegistrationForm />
      <Steps />
    </>
  );
}
