import Link from "next/link";
import type { Metadata } from "next";
import { getCollections, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/products/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Search the archive",
  description: "Search WALLVERSE wallpapers by name, colour, style, material or collection.",
  alternates: { canonical: "/search" },
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const [results, collections] = await Promise.all([
    q ? getProducts({ q, perPage: 48 }) : Promise.resolve(null),
    getCollections(),
  ]);

  const matchingCollections = q
    ? collections.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.description.toLowerCase().includes(q.toLowerCase())
      )
    : [];

  return (
    <div className="section-dark min-h-dvh pt-[calc(var(--header-h)+1.5rem)] pb-24">
      <div className="container-wv">
        <header className="mb-10 max-w-3xl">
          <p className="label text-citron mb-3">Search</p>
          <h1 className="display text-4xl md:text-6xl">Find your wall.</h1>
          <form action="/search" method="get" role="search" className="mt-8 flex gap-3">
            <label htmlFor="search-q" className="sr-only">
              Search designs, collections, colours and styles
            </label>
            <input
              id="search-q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Try “marble”, “green”, “deco”, “kids”…"
              autoFocus
              className="w-full border border-ivory/25 bg-transparent px-5 py-4 font-serif text-xl placeholder:opacity-40 focus:border-citron outline-none transition-colors"
            />
            <Button type="submit" variant="citron" className="shrink-0">
              Search
            </Button>
          </form>
        </header>

        {!q ? (
          <div>
            <p className="label opacity-50 mb-5">Or wander into a world</p>
            <div className="flex flex-wrap gap-3">
              {collections.map((c) => (
                <Link
                  key={c.slug}
                  href={`/collections/${c.slug}`}
                  className="label border border-ivory/25 px-4 py-2.5 hover:border-citron hover:text-citron transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <>
            {matchingCollections.length > 0 ? (
              <div className="mb-10">
                <p className="label opacity-50 mb-4">Collections</p>
                <div className="flex flex-wrap gap-3">
                  {matchingCollections.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/collections/${c.slug}`}
                      className="label border border-citron/50 text-citron px-4 py-2.5 hover:bg-citron hover:text-ink transition-colors"
                    >
                      {c.name} →
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {results && results.products.length > 0 ? (
              <>
                <p className="label opacity-50 mb-8">
                  {results.total} design{results.total === 1 ? "" : "s"} for “{q}”
                </p>
                <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                  {results.products.map((p, i) => (
                    <ProductCard key={p.slug} product={p} index={i} />
                  ))}
                </div>
              </>
            ) : matchingCollections.length === 0 ? (
              <EmptyState
                label="No results"
                message={`Nothing in the archive answers to “${q}”.`}
                action={
                  <Button href="/shop" variant="outline" className="text-ivory">
                    Browse everything
                  </Button>
                }
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
