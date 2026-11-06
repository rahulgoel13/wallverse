import Link from "next/link";
import type { Metadata } from "next";
import { getAllProducts, getCollections } from "@/lib/catalog";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Reveal } from "@/components/motion/Reveal";
import { indexLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Collections — ten worlds of pattern",
  description:
    "Explore the WALLVERSE collections: botanical worlds, abstract dimensions, the marble archive, luxury textures, geometric systems, florals, minimal grounds, kids' imaginarium, open nature and art walls.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const [collections, products] = await Promise.all([getCollections(), getAllProducts()]);

  const featureFor = (slug: string) =>
    products.find((p) => p.collectionSlug === slug && p.featured) ??
    products.find((p) => p.collectionSlug === slug);

  return (
    <div className="section-dark min-h-dvh pt-[calc(var(--header-h)+1.5rem)] pb-24">
      <div className="container-wv">
        <header className="mb-14 max-w-3xl">
          <p className="label text-citron mb-3">The Collections</p>
          <h1 className="display text-4xl md:text-6xl">Ten worlds. One doorway each.</h1>
        </header>
        <div className="grid gap-x-6 gap-y-14 md:grid-cols-2">
          {collections.map((c, i) => {
            const feature = featureFor(c.slug);
            return (
              <Reveal key={c.slug} delay={Math.min(i * 0.04, 0.2)}>
                <Link href={`/collections/${c.slug}`} className="group block">
                  <div className="relative overflow-hidden">
                    {feature ? (
                      <TexturePreview
                        texture={feature.texture}
                        tileSize={260}
                        alt={`${c.name} collection — ${feature.name}`}
                        className="aspect-[16/9] transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="aspect-[16/9] bg-obsidian" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                    <span className="label absolute left-4 top-4 text-ivory/70">{indexLabel(i)}</span>
                    <span
                      className="absolute right-4 top-4 h-3 w-3 rounded-full"
                      style={{ background: c.accent }}
                      aria-hidden
                    />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h2 className="display text-2xl md:text-4xl group-hover:text-citron transition-colors">
                      {c.name}
                    </h2>
                    <span className="label opacity-50 whitespace-nowrap">{c.productCount} designs</span>
                  </div>
                  <p className="mt-2 text-sm opacity-60 leading-relaxed max-w-md">{c.description}</p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
