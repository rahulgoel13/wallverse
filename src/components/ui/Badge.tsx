import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "citron" | "champagne" | "error";
}) {
  const tones = {
    neutral: "border-current/30 text-current/80",
    citron: "border-citron/60 text-citron",
    champagne: "border-champagne/60 text-champagne",
    error: "border-error/60 text-error",
  } as const;
  return (
    <span
      className={`label inline-flex items-center rounded-full border px-2.5 py-1 text-[0.5625rem] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
