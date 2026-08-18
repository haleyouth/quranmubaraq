import { JsonLd, breadcrumbSchema, offerSchema, pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata = pageMetadata({
  title: "Fees — Online Quran Classes from $40 a Month",
  description:
    "Transparent monthly fees in USD and GBP. Free admission, a free trial week, and 10% off for every additional sibling. 3 or 5 classes per week, 30 minutes each.",
  path: "/fees",
  keywords: ["Quran class fees", "online Quran course price", "Quran tuition cost"],
});

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
      <JsonLd
        data={[offerSchema(), breadcrumbSchema([{ name: "Fees Structure", path: "fees" }])]}
      />
    </>
  );
}
