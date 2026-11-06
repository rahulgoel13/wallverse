import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  copy?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? <p className="label opacity-60 mb-4">{eyebrow}</p> : null}
      <Tag className="display text-4xl md:text-6xl text-balance">{title}</Tag>
      {copy ? <p className="mt-5 text-sm md:text-base opacity-70 leading-relaxed max-w-xl mx-auto">{copy}</p> : null}
    </div>
  );
}
