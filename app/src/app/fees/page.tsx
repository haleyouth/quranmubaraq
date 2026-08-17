import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "Fees Structure",
  description:
    "Transparent monthly fees in USD and GBP. Free admission, free trial week, and 10% off for every additional sibling.",
};

export default function FeesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Fees Structure"
        title={
          <>
            Fair, transparent <span className="text-green-deep">pricing.</span>
          </>
        }
        body="Admission is free, there is no contract, and your first week of classes costs nothing at all."
        breadcrumb={[{ label: "Fees Structure" }]}
      />
      <Pricing />
      <Faq />
      <CtaBand />
    </>
  );
}
