import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollection, getCollections } from "@/lib/catalog";
import { ProductCard } from "@/components/products/ProductCard";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCollection(slug);
  if (!data) return { title: "Collection not found" };
  return {
    title: `${data.collection.name} — wallpaper collection`,
    description: data.collection.description,
    alternates: { canonical: `/collections/${slug}` },
  };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const [data, allCollections] = await Promise.all([getCollection(slug), getCollections()]);
  if (!data) notFound();
  const { collection, products } = data;
  const featured = products.find((p) => p.featured) ?? products[0];
  const related = allCollections.filter((c) => c.slug !== slug).slice(0, 3);

  return (
    <div className="section-dark min-h-dvh pb-24">
      {/* Hero dressed in the collection's own wallpaper */}
      <header className="relative overflow-hidden">
        {featured ? (
          <TexturePreview texture={featured.texture} tileSize={300} className="absolute inset-0 opacity-50" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink" />
        <div className="container-wv relative pt-[calc(var(--header-h)+5rem)] pb-20">
          <nav aria-label="Breadcrumb" className="label opacity-60 mb-6">
            <Link href="/collections" className="hover:text-citron transition-colors">
              Collections
            </Link>{" "}
            / <span aria-current="page">{collection.name}</span>
          </nav>
          <h1 className="display text-5xl md:text-7xl max-w-4xl">{collection.name}</h1>
          <p className="mt-6 max-w-xl text-sm md:text-base opacity-75 leading-relaxed">
            {collection.description}
          </p>
          {featured ? (
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={`/product/${featured.slug}`} variant="citron">
                Featured: {featured.name}
              </Button>
              <Button href={`/room-studio?design=${featured.slug}`} variant="outline" className="text-ivory">
                Try it in a room
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="container-wv">
        <div className="mt-16 flex items-baseline justify-between gap-4 mb-10">
          <h2 className="font-serif text-2xl md:text-3xl">
            {products.length} design{products.length === 1 ? "" : "s"}
          </h2>
          <Link
            href={`/shop?collection=${collection.slug}`}
            className="label text-citron hover:underline underline-offset-4"
          >
            Filter & sort in the shop →
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            label="Coming soon"
            message="This collection is being hung. Check back shortly."
            action={
              <Button href="/shop" variant="outline" className="text-ivory">
                Browse the archive
              </Button>
            }
          />
        ) : (
          <Reveal stagger={0.06} className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </Reveal>
        )}

        {/* Related collections */}
        <div className="mt-24 border-t border-ivory/10 pt-12">
          <p className="label opacity-50 mb-6">Adjacent worlds</p>
          <div className="flex flex-wrap gap-4">
            {related.map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className="label border border-ivory/25 px-5 py-3 hover:border-citron hover:text-citron transition-colors"
              >
                {c.name} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
