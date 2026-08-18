"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { courses, registrationForm } from "@/lib/content";
import { countries, popularCountries } from "@/lib/countries";
import { Container, Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<"name" | "email" | "phone" | "country", string>>;
type Status = "idle" | "submitting" | "success" | "error";

const fieldBase =
  "w-full min-h-12 rounded-xl border-2 border-ink bg-white px-4 py-3 text-ink placeholder:text-ink/40 transition-colors focus:border-green-deep";

export function RegistrationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  function validate(data: FormData): Errors {
    const next: Errors = {};
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const country = String(data.get("country") ?? "");

    if (name.length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      next.email = "Please enter a valid email address.";
    // Permissive on purpose — international formats vary widely
    if (phone.replace(/\D/g, "").length < 7)
      next.phone = "Please enter a valid phone number, including country code.";
    if (!country) next.country = "Please select your country.";

    return next;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const found = validate(data);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // Move focus to the first invalid field for screen-reader users
      const first = Object.keys(found)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const { createLead } = await import("@/lib/leads");
      await createLead({
        name: String(data.get("name")).trim(),
        email: String(data.get("email")).trim().toLowerCase(),
        phone: String(data.get("phone")).trim(),
        country: String(data.get("country")),
        course: String(data.get("course") ?? ""),
        teacherPreference: String(data.get("teacherPreference") ?? ""),
      });
      setStatus("success");
      form.reset();
    } catch (err) {
      console.error("Lead submission failed:", err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Section id="register" tone="cream">
        <Container>
          <div className="mx-auto max-w-2xl rounded-[2rem] border-4 border-ink bg-white p-10 text-center hard-shadow-lg md:p-14">
            <span className="mx-auto grid size-20 place-items-center rounded-full border-4 border-ink bg-teal">
              <CheckCircle2 className="size-10 text-white" aria-hidden="true" />
            </span>
            <h2 className="font-display mt-7 text-3xl text-ink">
              Jazakum Allahu Khairan!
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink/75">
              Your registration has been received. Our team will contact you within one
              working day to arrange your three free trial classes.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-8 min-h-11 cursor-pointer font-bold text-ink underline decoration-teal decoration-2 underline-offset-8 hover:text-green-deep"
            >
              Register another student
            </button>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section id="register" tone="cream">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
          {/* Pitch */}
          <div className="lg:sticky lg:top-32">
            <p className="text-sm font-bold tracking-[0.25em] text-green-deep uppercase">
              Free trial
            </p>
            <h2 className="font-display mt-4 text-3xl leading-[1.1] text-ink sm:text-4xl">
              {registrationForm.heading}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink/75">
              {registrationForm.body}
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Three free 30-minute classes",
                "No card details required",
                "Male or female teacher — your choice",
                "Scheduled in your local timezone",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-teal">
                    <CheckCircle2 className="size-4 text-white" aria-hidden="true" />
                  </span>
                  <span className="font-semibold text-ink/80">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 flex items-start gap-3 rounded-2xl border-2 border-ink bg-cream-deep p-5 text-sm text-ink/75">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green" aria-hidden="true" />
              Your details are used only to arrange your classes. We never sell or share
              your information.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-[2rem] border-4 border-ink bg-white p-7 hard-shadow-lg md:p-10"
          >
            <div className="space-y-6">
              <Field
                label="Full name"
                name="name"
                type="text"
                placeholder="Ahmad Ibrahim"
                autoComplete="name"
                error={errors.name}
                required
              />
              <Field
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email}
                required
              />
              <Field
                label="Phone number"
                name="phone"
                type="tel"
                placeholder="+44 7700 900000"
                autoComplete="tel"
                hint="Include your country code so we can reach you."
                error={errors.phone}
                required
              />

              {/* Country */}
              <div>
                <label htmlFor="country" className="mb-2 block font-bold text-ink">
                  Country <span className="text-green-deep">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  defaultValue=""
                  aria-invalid={Boolean(errors.country)}
                  aria-describedby={errors.country ? "country-error" : undefined}
                  className={cn(
                    fieldBase,
                    "cursor-pointer",
                    errors.country && "border-red-600",
                  )}
                >
                  <option value="" disabled>
                    Select your country
                  </option>
                  <optgroup label="Most common">
                    {popularCountries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="All countries">
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                </select>
                {errors.country && (
                  <p id="country-error" role="alert" className="mt-2 text-sm font-semibold text-red-700">
                    {errors.country}
                  </p>
                )}
              </div>

              {/* Course — optional */}
              <div>
                <label htmlFor="course" className="mb-2 block font-bold text-ink">
                  Course of interest{" "}
                  <span className="font-medium text-ink/50">(optional)</span>
                </label>
                <select
                  id="course"
                  name="course"
                  defaultValue=""
                  className={cn(fieldBase, "cursor-pointer")}
                >
                  <option value="">Not sure yet — please advise</option>
                  {courses.map((c) => (
                    <option key={c.slug} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher preference */}
              <fieldset>
                <legend className="mb-3 font-bold text-ink">
                  Teacher preference{" "}
                  <span className="font-medium text-ink/50">(optional)</span>
                </legend>
                <div className="flex flex-wrap gap-3">
                  {["No preference", "Male teacher", "Female teacher"].map((opt, i) => (
                    <label
                      key={opt}
                      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-2 font-semibold text-ink transition-colors has-checked:bg-green-deep has-checked:text-white"
                    >
                      <input
                        type="radio"
                        name="teacherPreference"
                        value={opt}
                        defaultChecked={i === 0}
                        className="size-4 accent-green-deep"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {status === "error" && (
              <p
                role="alert"
                className="mt-6 rounded-xl border-2 border-red-600 bg-red-50 p-4 font-semibold text-red-800"
              >
                Something went wrong sending your registration. Please try again, or
                contact us directly on WhatsApp.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="group mt-8 inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-ink bg-green-deep px-8 py-4 text-base font-bold text-white hard-shadow-lg press-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  Sending&hellip;
                </>
              ) : (
                <>
                  Register for free trial
                  <ArrowRight
                    className="size-5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-sm text-ink/60">
              Free to register · No card required · No obligation
            </p>
          </form>
        </div>
      </Container>
    </Section>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  hint,
  error,
  required,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div>
      <label htmlFor={name} className="mb-2 block font-bold text-ink">
        {label} {required && <span className="text-green-deep">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={cn(error && errorId, hint && hintId) || undefined}
        className={cn(fieldBase, error && "border-red-600")}
      />
      {hint && !error && (
        <p id={hintId} className="mt-2 text-sm text-ink/55">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
