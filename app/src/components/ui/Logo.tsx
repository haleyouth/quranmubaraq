import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * The supplied logo is white artwork on transparency (170x90), so it is only
 * legible on a dark ground. Every usage therefore sits on an ink plate rather
 * than directly on the cream page background.
 */
export function Logo({
  className,
  plateClassName,
  width = 150,
  href = "/",
}: {
  className?: string;
  plateClassName?: string;
  width?: number;
  href?: string | null;
}) {
  const height = Math.round((width * 90) / 170);

  const mark = (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border-2 border-ink bg-ink px-4 py-2.5",
        plateClassName,
      )}
    >
      <Image
        src="/brand/logo.png"
        alt={`${site.name} — ${site.tagline}`}
        width={width}
        height={height}
        priority
        className="h-auto w-full"
      />
    </span>
  );

  if (href === null) {
    return <span className={cn("inline-block", className)}>{mark}</span>;
  }

  return (
    <Link
      href={href}
      className={cn("inline-block shrink-0", className)}
      aria-label={`${site.name} — home`}
    >
      {mark}
    </Link>
  );
}
