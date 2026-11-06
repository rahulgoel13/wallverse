import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getCollections, getFilterOptions, getProducts, type ShopFilters } from "@/lib/catalog";
import { ProductCard } from "@/components/products/ProductCard";
import { ShopControls } from "@/components/shop/ShopControls";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Shop all wallpaper designs",
  description:
    "Browse the full WALLVERSE archive — botanical, marble, geometric, floral, luxury and mural wallpapers. Filter by colour, style, material and price.",
  alternates: { canonical: "/shop" },
};

const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const filters: ShopFilters = {
    q: str(params.q),
    collection: str(params.collection),
    color: str(params.color),
    style: str(params.style),
    material: str(params.material),
    maxPrice: str(params.maxPrice) ? Number(str(params.maxPrice)) : undefined,
    sort: (str(params.sort) as ShopFilters["sort"]) ?? "recommended",
    page: Math.max(1, Number(str(params.page) ?? 1) || 1),
    perPage: 12,
  };

  const [{ products, total, page, pages }, collections, options] = await Promise.all([
    getProducts(filters),
    getCollections(),
    getFilterOptions(),
  ]);

  const pageLink = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (typeof v === "string" && v) next.set(k, v);
    }
    next.set("page", String(p));
    return `/shop?${next.toString()}`;
  };

  return (
    <div className="section-dark min-h-dvh pt-[calc(var(--header-h)+1.5rem)] pb-24">
      <div className="container-wv">
        <header className="mb-10">
          <p className="label text-citron mb-3">The Archive</p>
          <h1 className="display text-4xl md:text-6xl">Every wall, every world.</h1>
          <p className="mt-3 label opacity-50">{total} design{total === 1 ? "" : "s"}</p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[280px_1fr] items-start">
          <aside className="lg:sticky lg:top-[calc(var(--header-h)+1rem)]" aria-label="Filters">
            <details className="lg:hidden border border-ivory/15 p-4 mb-4" open={false}>
              <summary className="label cursor-pointer">Filters & sorting</summary>
              <div className="pt-5">
                <Suspense>
                  <ShopControls collections={collections} options={options} />
                </Suspense>
              </div>
            </details>
            <div className="hidden lg:block">
              <Suspense>
                <ShopControls collections={collections} options={options} />
              </Suspense>
            </div>
          </aside>

          <div>
            {products.length === 0 ? (
              <EmptyState
                label="No matches"
                message="Nothing in the archive matches those filters — yet."
                action={
                  <Button href="/shop" variant="outline" className="text-ivory">
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
                  {products.map((p, i) => (
                    <ProductCard key={p.slug} product={p} index={(page - 1) * 12 + i} />
                  ))}
                </div>
                {pages > 1 ? (
                  <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
                    {page > 1 ? (
                      <Link href={pageLink(page - 1)} className="label border border-ivory/25 px-4 py-2.5 hover:border-citron hover:text-citron transition-colors">
                        ← Prev
                      </Link>
                    ) : null}
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={pageLink(p)}
                        aria-current={p === page ? "page" : undefined}
                        className={`label border px-4 py-2.5 transition-colors ${
                          p === page ? "border-citron text-citron" : "border-ivory/25 hover:border-ivory/60"
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                    {page < pages ? (
                      <Link href={pageLink(page + 1)} className="label border border-ivory/25 px-4 py-2.5 hover:border-citron hover:text-citron transition-colors">
                        Next →
                      </Link>
                    ) : null}
                  </nav>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
