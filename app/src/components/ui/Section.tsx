import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("mx-auto w-full max-w-7xl px-6", className)}>{children}</div>;
}

export function Section({
  id,
  className,
  tone = "cream",
  children,
}: {
  id?: string;
  className?: string;
  tone?: "cream" | "deep" | "white" | "ink";
  children: React.ReactNode;
}) {
  const tones = {
    cream: "bg-cream text-ink",
    deep: "bg-cream-deep text-ink",
    white: "bg-white text-ink",
    ink: "bg-ink text-cream",
  } as const;

  return (
    <section id={id} className={cn("py-20 md:py-28", tones[tone], className)}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
  tone = "ink",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  body?: string;
  align?: "center" | "left";
  tone?: "ink" | "cream";
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-4 text-sm font-bold tracking-[0.25em] uppercase",
            tone === "ink" ? "text-magenta" : "text-amber",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-display text-4xl leading-[1.1] sm:text-5xl md:text-6xl",
          tone === "ink" ? "text-ink" : "text-cream",
        )}
      >
        {title}
      </h2>
      {body && (
        <p
          className={cn(
            "mt-6 text-lg leading-relaxed",
            tone === "ink" ? "text-ink/75" : "text-cream/80",
          )}
        >
          {body}
        </p>
      )}
    </div>
  );
}
