"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { DEMO_USERS, signIn } from "@/lib/admin/demo-auth";
import { Logo } from "@/components/ui/Logo";
import { inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const session = signIn(email, password);
    if (!session) {
      setError("Those credentials do not match a demo account.");
      setBusy(false);
      return;
    }
    router.push("/admin");
  }

  function fill(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("demo1234");
    setError("");
  }

  return (
    <main className="grid min-h-screen bg-cream lg:grid-cols-2">
      {/* Form */}
      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <Logo width={150} plateClassName="hard-shadow" />

          <h1 className="font-display mt-8 text-4xl text-ink">Portal sign in</h1>
          <p className="mt-2 text-ink/70">
            Admin, Principal, Teacher and Student portals.
          </p>

          <form
            onSubmit={handleSubmit}
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
                  placeholder="admin@quranmubarak.com"
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
                  placeholder="demo1234"
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

      {/* Demo credentials */}
      <div className="flex items-center justify-center border-t-4 border-ink bg-ink px-6 py-14 lg:border-t-0 lg:border-l-4">
        <div className="w-full max-w-md">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-gold bg-gold px-4 py-1.5 text-sm font-bold text-ink">
            <KeyRound className="size-4" aria-hidden="true" />
            Demo credentials
          </p>

          <h2 className="font-display mt-5 text-2xl text-cream">
            Choose a role to explore
          </h2>
          <p className="mt-2 text-cream/70">
            Each account opens a different portal with its own navigation and
            permissions. Click one to fill the form.
          </p>

          <ul className="mt-6 space-y-3">
            {DEMO_USERS.map((u) => (
              <li key={u.email}>
                <button
                  type="button"
                  onClick={() => fill(u.email)}
                  className={cn(
                    "w-full cursor-pointer rounded-xl border-2 border-cream/25 bg-cream/5 px-4 py-3.5 text-left transition-colors",
                    "hover:border-gold hover:bg-cream/10",
                  )}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-display text-cream">{u.title}</span>
                    <span className="rounded-full border-2 border-gold px-2.5 py-0.5 text-xs font-bold text-gold">
                      {u.role}
                    </span>
                  </span>
                  <span className="mt-1 block font-mono text-sm text-cream/75">
                    {u.email}
                  </span>
                  <span className="mt-0.5 block font-mono text-sm text-cream/55">
                    demo1234
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-6 flex items-start gap-2 rounded-xl border-2 border-cream/25 px-4 py-3 text-sm text-cream/70">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
            These credentials are public and the session is stored in the browser only.
            This demo has no real authentication — replace it with Firebase Auth before
            handling any real student data.
          </p>
        </div>
      </div>
    </main>
  );
}
