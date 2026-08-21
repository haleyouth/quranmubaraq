"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "@/lib/admin/auth";
import { Logo } from "@/components/ui/Logo";
import { inputClass } from "@/components/admin/ui";
import { LoginAside } from "@/components/admin/LoginAside";

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
  const [showPassword, setShowPassword] = useState(false);

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

              <div>
                <label htmlFor="password" className="mb-1.5 block font-bold text-ink">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className={`${inputClass} pr-12`}
                  />
                  {/*
                    Outside the <label> on purpose: nested inside it, clicking
                    the button would also toggle focus into the input.
                  */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-ink/55 transition-colors hover:bg-cream-deep hover:text-ink"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" aria-hidden="true" />
                    ) : (
                      <Eye className="size-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
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

      <LoginAside />
    </main>
  );
}
