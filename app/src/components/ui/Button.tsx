import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  // Magenta on white text = 4.6:1 — passes AA for normal text
  primary: "bg-magenta text-white border-2 border-ink hard-shadow press hover:bg-magenta/95",
  secondary: "bg-amber text-ink border-2 border-ink hard-shadow press hover:bg-amber/90",
  outline: "bg-white text-ink border-2 border-ink hard-shadow press hover:bg-cream-deep",
  ghost: "bg-transparent text-ink border-2 border-transparent hover:bg-cream-deep",
};

const sizes: Record<Size, string> = {
  // All sizes clear the 44px minimum touch target
  sm: "px-5 py-2.5 text-sm min-h-11",
  md: "px-6 py-3 text-base min-h-12",
  lg: "px-8 py-4 text-lg min-h-14",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = BaseProps & {
  href: string;
} & Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;

type ButtonAsButton = BaseProps & {
  href?: never;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export type ButtonProps = ButtonAsLink | ButtonAsButton;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full font-bold cursor-pointer",
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0",
    variants[variant],
    sizes[size],
    className,
  );

  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props as ButtonAsLink;
    const isExternal = /^(https?:|tel:|mailto:|skype:)/.test(href);

    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { ...rest } = props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
