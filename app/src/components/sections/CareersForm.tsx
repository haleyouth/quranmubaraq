"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { vacancies } from "@/lib/careers";
import { countries, popularCountries } from "@/lib/countries";
import { Container, Section } from "@/components/ui/Section";
import { DateRoller, calculateAge } from "@/components/ui/DateRoller";
import { cn } from "@/lib/utils";

type Errors = Partial<
  Record<"name" | "email" | "phone" | "country" | "role" | "dob" | "qualifications", string>
>;
type Status = "idle" | "submitting" | "success" | "error";

const fieldBase =
  "w-full min-h-12 rounded-xl border-2 border-ink bg-white px-4 py-3 text-ink placeholder:text-ink/40 transition-colors focus:border-green-deep";

export function CareersForm({ preselect }: { preselect?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [dob, setDob] = useState("");

  function validate(data: FormData): Errors {
    const next: Errors = {};
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const country = String(data.get("country") ?? "");
    const role = String(data.get("role") ?? "");
    const quals = String(data.get("qualifications") ?? "").trim();

    if (name.length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      next.email = "Please enter a valid email address.";
    if (phone.replace(/\D/g, "").length < 7)
      next.phone = "Please enter a valid phone number, including country code.";
    if (!country) next.country = "Please select your country.";
    if (!role) next.role = "Please choose the role you are applying for.";
    if (quals.length < 10)
      next.qualifications = "Please describe your qualifications briefly.";

    // Applicants must be adults; age is computed once here and stored.
    const age = calculateAge(dob);
    if (!dob) next.dob = "Please select your date of birth.";
    else if (age === null) next.dob = "That date does not look right.";
    else if (age < 18) next.dob = "Applicants must be at least 18 years old.";
    else if (age > 80) next.dob = "Please check the year of birth.";

    return next;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const found = validate(data);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const { createApplication } = await import("@/lib/careers");
      await createApplication({
        name: String(data.get("name")).trim(),
        email: String(data.get("email")).trim().toLowerCase(),
        phone: String(data.get("phone")).trim(),
        country: String(data.get("country")),
        role: String(data.get("role")),
        gender: String(data.get("gender") ?? ""),
        dateOfBirth: dob,
        age: calculateAge(dob) ?? undefined,
        qualifications: String(data.get("qualifications")).trim(),
        experienceYears: String(data.get("experienceYears") ?? ""),
        availability: String(data.get("availability") ?? ""),
        message: String(data.get("message") ?? "").trim(),
      });
      setStatus("success");
      form.reset();
      setDob("");
    } catch (err) {
      console.error("Application submission failed:", err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Section id="apply" tone="cream">
        <Container>
          <div className="mx-auto max-w-2xl rounded-[2rem] border-4 border-ink bg-white p-10 text-center hard-shadow-lg md:p-14">
            <span className="mx-auto grid size-20 place-items-center rounded-full border-4 border-ink bg-teal">
              <CheckCircle2 className="size-10 text-white" aria-hidden="true" />
            </span>
            <h2 className="font-display mt-7 text-3xl text-ink">
              Jazakum Allahu Khairan!
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink/75">
              Your application has been received. Our team reviews every
              application and will be in touch if your experience matches a
              current opening.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-8 min-h-11 cursor-pointer font-bold text-ink underline decoration-teal decoration-2 underline-offset-8 hover:text-green-deep"
            >
              Submit another application
            </button>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section id="apply" tone="cream">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="lg:sticky lg:top-32">
            <p className="text-sm font-bold tracking-[0.25em] text-green-deep uppercase">
              Apply
            </p>
            <h2 className="font-display mt-4 text-3xl leading-[1.1] text-ink sm:text-4xl">
              Teach with Quran Mubarak
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink/75">
              Tell us about yourself and the role you are interested in. Every
              application is read by our academic team.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Teach from home, in your own timezone",
                "Flexible hours around your commitments",
                "Paid per session taught, monthly",
                "Ongoing support from our academic team",
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
              All teaching staff are vetted and must acknowledge our child
              safeguarding policy before being assigned any student.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-[2rem] border-4 border-ink bg-white p-7 hard-shadow-lg md:p-10"
          >
            <div className="space-y-6">
              <Field label="Full name" name="name" type="text" placeholder="Ustadha Ayesha Siddiqa" autoComplete="name" error={errors.name} required />
              <Field label="Email address" name="email" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email} required />
              <Field label="Phone number" name="phone" type="tel" placeholder="+92 300 5551200" autoComplete="tel" hint="Include your country code." error={errors.phone} required />

              <DateRoller
                name="dateOfBirth"
                value={dob}
                onChange={setDob}
                error={errors.dob}
                required
                minAge={18}
                maxAge={80}
                label="Date of birth"
              />

              <div>
                <label htmlFor="role" className="mb-2 block font-bold text-ink">
                  Role applying for <span className="text-green-deep">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  defaultValue={preselect ?? ""}
                  aria-invalid={Boolean(errors.role)}
                  className={cn(fieldBase, "cursor-pointer", errors.role && "border-red-600")}
                >
                  <option value="" disabled>Select a role</option>
                  {vacancies.map((v) => (
                    <option key={v.slug} value={v.title}>{v.title}</option>
                  ))}
                  <option value="General application">General application</option>
                </select>
                {errors.role && (
                  <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{errors.role}</p>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
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
                    className={cn(fieldBase, "cursor-pointer", errors.country && "border-red-600")}
                  >
                    <option value="" disabled>Select</option>
                    <optgroup label="Most common">
                      {popularCountries.map((c) => <option key={c} value={c}>{c}</option>)}
                    </optgroup>
                    <optgroup label="All countries">
                      {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                    </optgroup>
                  </select>
                  {errors.country && (
                    <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{errors.country}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className="mb-2 block font-bold text-ink">
                    Gender
                  </label>
                  <select id="gender" name="gender" defaultValue="" className={cn(fieldBase, "cursor-pointer")}>
                    <option value="">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                  <p className="mt-2 text-sm text-ink/55">
                    Families may request a teacher of a particular gender.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="experienceYears" className="mb-2 block font-bold text-ink">
                    Years of teaching experience
                  </label>
                  <select id="experienceYears" name="experienceYears" defaultValue="1-3" className={cn(fieldBase, "cursor-pointer")}>
                    <option>Less than 1</option>
                    <option>1-3</option>
                    <option>3-5</option>
                    <option>5-10</option>
                    <option>More than 10</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="availability" className="mb-2 block font-bold text-ink">
                    Weekly availability
                  </label>
                  <select id="availability" name="availability" defaultValue="10-20 hours" className={cn(fieldBase, "cursor-pointer")}>
                    <option>Under 10 hours</option>
                    <option>10-20 hours</option>
                    <option>20-30 hours</option>
                    <option>Full-time</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="qualifications" className="mb-2 block font-bold text-ink">
                  Qualifications <span className="text-green-deep">*</span>
                </label>
                <textarea
                  id="qualifications"
                  name="qualifications"
                  rows={3}
                  required
                  aria-invalid={Boolean(errors.qualifications)}
                  placeholder="e.g. Hafiza with ijazah in Hafs 'an 'Asim, BA in Islamic Studies."
                  className={cn(fieldBase, errors.qualifications && "border-red-600")}
                />
                {errors.qualifications && (
                  <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{errors.qualifications}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block font-bold text-ink">
                  Anything else <span className="font-medium text-ink/50">(optional)</span>
                </label>
                <textarea id="message" name="message" rows={3} placeholder="Tell us briefly why you would like to teach with us." className={fieldBase} />
              </div>
            </div>

            {status === "error" && (
              <p role="alert" className="mt-6 rounded-xl border-2 border-red-600 bg-red-50 p-4 font-semibold text-red-800">
                Something went wrong sending your application. Please try again,
                or contact us on WhatsApp.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="group mt-8 inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-ink bg-green-deep px-8 py-4 text-lg font-bold text-white hard-shadow-lg press-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  Sending&hellip;
                </>
              ) : (
                <>
                  Submit application
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>
      </Container>
    </Section>
  );
}

function Field({
  label, name, type, placeholder, autoComplete, hint, error, required,
}: {
  label: string; name: string; type: string; placeholder: string;
  autoComplete?: string; hint?: string; error?: string; required?: boolean;
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
      {hint && !error && <p id={hintId} className="mt-2 text-sm text-ink/55">{hint}</p>}
      {error && <p id={errorId} role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
    </div>
  );
}
