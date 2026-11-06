import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "citron" | "ivory" | "ink" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium uppercase tracking-[0.18em] text-[0.6875rem] transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";

const sizes = {
  sm: "px-4 py-2",
  md: "px-7 py-3.5",
  lg: "px-9 py-4",
};

const variants: Record<Variant, string> = {
  citron: "bg-citron text-ink hover:bg-ivory",
  ivory: "bg-ivory text-ink hover:bg-citron",
  ink: "bg-ink text-ivory hover:bg-obsidian",
  outline:
    "border border-current/30 text-current hover:border-current hover:bg-current/5",
  ghost: "text-current hover:opacity-70 underline-offset-4 hover:underline",
};

interface CommonProps {
  variant?: Variant;
  size?: keyof typeof sizes;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof CommonProps> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "citron", size = "md", className = "", children, ...rest } = props;
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link href={href} className={cls} {...(linkRest as Omit<ButtonAsLink, "href" | keyof CommonProps>)}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
}
