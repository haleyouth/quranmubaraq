import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { hero, site } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

export function Hero() {
  return (
    <section className="islamic-pattern relative overflow-hidden border-b-4 border-ink bg-cream">
      {/* Soft colour wash behind the girih lattice */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-[28rem] rounded-full bg-gold/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 size-[24rem] rounded-full bg-teal/20 blur-3xl"
      />

      <Container className="relative py-16 md:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
          {/* Copy */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-bold text-ink hard-shadow">
              <Sparkles className="size-4 text-green-deep" aria-hidden="true" />
              {hero.eyebrow}
            </p>

            <h1 className="font-display mt-7 text-4xl leading-[1.05] text-ink sm:text-4xl md:text-5xl xl:text-6xl">
              {hero.headline.before}{" "}
              <span className="relative inline-block text-green-deep">
                {hero.headline.highlight}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 h-3 w-full text-teal"
                >
                  <path
                    d="M2 8 C 50 2, 150 2, 198 7"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              {hero.headline.after}
            </h1>

            <p className="mt-8 max-w-xl text-base leading-relaxed text-ink/75 md:text-lg">
              {hero.subtext}
            </p>

            <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Button href={hero.primaryCta.href} size="lg" className="hard-shadow-lg press-lg">
                {hero.primaryCta.label}
                <ArrowRight
                  className="size-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
              <a
                href={hero.secondaryCta.href}
                className="text-base font-bold text-ink underline decoration-teal decoration-2 underline-offset-8 transition-colors hover:text-teal"
              >
                {hero.secondaryCta.label}
              </a>
            </div>

            {/* Trust card — amber fill with ink text (8.9:1) */}
            <div className="mt-12 inline-flex max-w-2xl -rotate-1 flex-col items-start gap-4 rounded-[2rem] border-4 border-ink bg-gold p-6 text-left hard-shadow-lg sm:flex-row sm:items-center md:p-8">
              <span className="grid size-16 shrink-0 place-items-center rounded-full border-2 border-ink bg-white hard-shadow">
                <BookOpen className="size-7 text-green" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-xl text-ink">{hero.trustCard.title}</p>
                <p className="mt-1 font-medium text-ink/80">{hero.trustCard.body}</p>
              </div>
            </div>
          </div>

          {/* Visual panel */}
          <div className="relative hidden lg:block">
            <div className="relative rotate-2 rounded-[3rem] border-4 border-ink bg-white p-8 hard-shadow-teal">
              <p className="font-marker text-center text-xl text-green">
                Bismillahir Rahmanir Raheem
              </p>
              <p
                dir="rtl"
                lang="ar"
                className="mt-8 text-center text-3xl leading-[1.9] text-ink"
              >
                اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
              </p>
              <p className="mt-6 text-center text-base font-semibold text-ink/70">
                &ldquo;Read! In the name of your Lord who created.&rdquo;
              </p>
              <p className="mt-2 text-center text-sm font-bold tracking-[0.2em] text-green-deep uppercase">
                Surah Al-&lsquo;Alaq 96:1
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t-2 border-ink/15 pt-8">
                <div className="rounded-2xl border-2 border-ink bg-cream p-4 text-center">
                  <p className="font-display text-2xl text-green">{site.founded}</p>
                  <p className="text-sm font-semibold text-ink/70">Teaching since</p>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-cream p-4 text-center">
                  <p className="font-display text-2xl text-green-deep">1-on-1</p>
                  <p className="text-sm font-semibold text-ink/70">Live classes</p>
                </div>
              </div>
            </div>

            {/*
              Banner spanning the card width. Bobs gently and cross-fades
              between magenta/white and white/ink. Both animations are
              disabled under prefers-reduced-motion by the global guard.
            */}
            <span
              lang="ar"
              dir="rtl"
              className="absolute -top-10 right-6 left-6 grid h-16 place-items-center rounded-2xl border-4 border-ink bg-green-deep text-2xl text-white hard-shadow [animation:bob_3.5s_ease-in-out_infinite,bismillah-shift_5s_ease-in-out_infinite]"
            >
              ﷽
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
