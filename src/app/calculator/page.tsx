import type { Metadata } from "next";
import { getAllProducts } from "@/lib/catalog";
import { CalculatorWidget } from "@/components/calculator/CalculatorWidget";

export const metadata: Metadata = {
  title: "Wallpaper roll calculator",
  description:
    "Work out exactly how many wallpaper rolls your walls need. Accounts for roll size, pattern repeat, doors, windows and installation wastage.",
  alternates: { canonical: "/calculator" },
};

export default async function CalculatorPage({ searchParams }: PageProps<"/calculator">) {
  const [products, params] = await Promise.all([getAllProducts(), searchParams]);
  const design = typeof params.design === "string" ? params.design : undefined;
  const ordered = design
    ? [...products].sort((a, b) => (a.slug === design ? -1 : b.slug === design ? 1 : 0))
    : products;

  return (
    <div className="section-dark min-h-dvh pt-[calc(var(--header-h)+1.5rem)] pb-24">
      <div className="container-wv">
        <header className="mb-10 max-w-3xl">
          <p className="label text-citron mb-3">The Arithmetic</p>
          <h1 className="display text-4xl md:text-6xl">How many rolls?</h1>
          <p className="mt-5 text-sm opacity-70 leading-relaxed max-w-xl">
            Measure each wall you want to paper, pick the design, and we do the strip-by-strip
            arithmetic — including the pattern repeat, trim allowance and sensible deductions for
            doors and windows. The method is shown with every result.
          </p>
        </header>
        <CalculatorWidget products={ordered} />
      </div>
    </div>
  );
}
