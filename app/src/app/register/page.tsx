import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { RegistrationForm } from "@/components/sections/RegistrationForm";
import { Steps } from "@/components/sections/Steps";

export const metadata: Metadata = {
  title: "Register for a free trial",
  description:
    "Register in under a minute for three free 30-minute Quran classes. No card required, no obligation to continue.",
};

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
