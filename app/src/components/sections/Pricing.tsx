"use client";

import { useState } from "react";
import { Check, Users } from "lucide-react";
import { plans } from "@/lib/content";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const currencies = [
  { code: "USD", symbol: "$", key: "usd" },
  { code: "GBP", symbol: "£", key: "gbp" },
] as const;

export function Pricing({ compact = false }: { compact?: boolean }) {
  const [currency, setCurrency] = useState<(typeof currencies)[number]>(currencies[0]);

  return (
    <Section id="fees" tone="deep">
      <Container>
        <SectionHeading
          eyebrow="Fees Structure"
          title={
            <>
              Simple pricing. <span className="text-green-deep">Free admission.</span>
            </>
          }
          body="No admission fee, no contract, and 10% off for every additional sibling. Cancel or pause whenever you need to."
        />

        {/* Currency switcher */}
        <div className="mt-10 flex justify-center">
          <div
            role="group"
            aria-label="Select currency"
            className="inline-flex gap-1 rounded-full border-2 border-ink bg-white p-1 hard-shadow"
          >
            {currencies.map((c) => {
              const active = c.code === currency.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c)}
                  aria-pressed={active}
                  className={cn(
                    "min-h-11 cursor-pointer rounded-full px-6 py-2 font-bold transition-colors",
                    active ? "bg-green-deep text-white" : "text-ink hover:bg-cream-deep",
                  )}
                >
                  {c.symbol} {c.code}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => {
            const price = currency.key === "usd" ? plan.usd : plan.gbp;
            const isFree = price === "0";

            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-[2rem] border-4 border-ink p-8",
                  plan.highlighted
                    ? "bg-ink text-cream hard-shadow-teal md:-translate-y-4"
                    : "bg-white text-ink hard-shadow",
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border-2 border-ink bg-gold px-4 py-1.5 text-xs font-bold tracking-wider text-ink uppercase whitespace-nowrap">
                    Most popular
                  </span>
                )}

                <h3
                  className={cn(
                    "font-display text-2xl",
                    plan.highlighted ? "text-cream" : "text-ink",
                  )}
                >
                  {plan.name}
                </h3>

                <p className="mt-5 flex items-baseline gap-1">
                  <span
                    className={cn(
                      "font-display text-6xl",
                      plan.highlighted ? "text-gold" : "text-green",
                    )}
                  >
                    {currency.symbol}
                    {price}
                  </span>
                  {!isFree && (
                    <span
                      className={cn(
                        "text-lg font-semibold",
                        plan.highlighted ? "text-cream/70" : "text-ink/60",
                      )}
                    >
                      /month
                    </span>
                  )}
                </p>

                <ul
                  className={cn(
                    "mt-8 flex-1 space-y-4 border-t-2 pt-8",
                    plan.highlighted ? "border-cream/20" : "border-ink/15",
                  )}
                >
                  {[
                    { label: "Class length", value: plan.classLength },
                    { label: "Classes", value: plan.frequency },
                    { label: "Admission", value: plan.admission },
                    { label: "Sibling discount", value: plan.sibling },
                  ].map((row) => (
                    <li key={row.label} className="flex items-start gap-3">
                      <Check
                        className={cn(
                          "mt-0.5 size-5 shrink-0",
                          plan.highlighted ? "text-teal" : "text-green-deep",
                        )}
                        aria-hidden="true"
                      />
                      <span>
                        <span
                          className={cn(
                            "block text-xs font-bold tracking-wider uppercase",
                            plan.highlighted ? "text-cream/60" : "text-ink/55",
                          )}
                        >
                          {row.label}
                        </span>
                        <span className="font-semibold">{row.value}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  href="/register"
                  variant={plan.highlighted ? "secondary" : "primary"}
                  className="mt-8 w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        {!compact && (
          <div className="mt-14 flex flex-col items-center gap-4 rounded-[2rem] border-4 border-ink bg-gold p-7 text-center hard-shadow-lg sm:flex-row sm:text-left md:p-8">
            <span className="grid size-16 shrink-0 place-items-center rounded-full border-2 border-ink bg-white hard-shadow">
              <Users className="size-7 text-green" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="font-display text-2xl text-ink">Enrolling more than one child?</p>
              <p className="mt-1 font-medium text-ink/80">
                Every additional sibling receives 10% off their plan, and admission is
                always free.
              </p>
            </div>
            <Button href="/contact-us" variant="outline" className="shrink-0">
              Ask about family rates
            </Button>
          </div>
        )}
      </Container>
    </Section>
  );
}
