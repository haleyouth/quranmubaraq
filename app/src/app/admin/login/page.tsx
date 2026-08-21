"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { signIn } from "@/lib/admin/auth";
import { Logo } from "@/components/ui/Logo";
import { inputClass } from "@/components/admin/ui";

/** Firebase error codes, translated into something a person can act on. */
function friendlyError(code: string, fallback: string) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password do not match an account.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Could not reach the server. Please check your connection.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact administration.";
    default:
      return fallback;
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      await signIn(email, password);
      router.push("/admin");
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      const message = (err as Error)?.message ?? "Sign in failed.";
      setError(friendlyError(code, message));
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-cream lg:grid-cols-2">
      {/* Form */}
      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <Logo width={150} plateClassName="hard-shadow" />

          <h1 className="font-display mt-8 text-3xl text-ink sm:text-4xl">
            Portal sign in
          </h1>
          <p className="mt-2 text-ink/70">
            Admin, Principal, Teacher and Student portals.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 rounded-2xl border-4 border-ink bg-white p-6 hard-shadow-lg md:p-8"
          >
            <div className="space-y-5">
              <label className="block">
                <span className="mb-1.5 block font-bold text-ink">Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  placeholder="you@quranmubarak.com"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block font-bold text-ink">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className={inputClass}
                />
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl border-2 border-red-700 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="group mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-ink bg-green-deep px-6 py-3 font-bold text-white hard-shadow press disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  Signing in&hellip;
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight
                    className="size-5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </>
              )}
            </button>
          </form>

          <Link
            href="/"
            className="mt-6 inline-block font-bold text-ink underline decoration-teal decoration-2 underline-offset-8 hover:text-green-deep"
          >
            &larr; Back to website
          </Link>
        </div>
      </div>

      {/* Reassurance panel */}
      <div className="islamic-pattern-strong flex items-center justify-center border-t-4 border-ink bg-ink px-6 py-14 lg:border-t-0 lg:border-l-4">
        <div className="w-full max-w-md">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-gold bg-gold px-4 py-1.5 text-sm font-bold text-ink">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Secure sign in
          </p>

          <h2 className="font-display mt-5 text-2xl text-cream">
            One portal, four roles
          </h2>
          <p className="mt-2 text-cream/70">
            Your account decides what you see. Teachers reach their own classes
            and students, principals their branch, and administration the whole
            academy.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-cream/75">
            {[
              ["Administration", "Full oversight across every branch."],
              ["Principal", "Their branch: teachers, students and schedules."],
              ["Teacher", "Today's classes, attendance and their students."],
              ["Student", "Their schedule, progress, invoices and messages."],
            ].map(([role, detail]) => (
              <li
                key={role}
                className="rounded-xl border-2 border-cream/20 bg-cream/5 px-4 py-3"
              >
                <span className="font-display block text-cream">{role}</span>
                <span className="text-cream/65">{detail}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-cream/55">
            Do not have an account? Ask your principal or the academy
            administration to create one for you.
          </p>
        </div>
      </div>
    </main>
  );
}
