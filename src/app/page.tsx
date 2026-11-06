import Link from "next/link";
import type { Metadata } from "next";
import { getAllProducts, getCollections } from "@/lib/catalog";
import { site } from "@/lib/site";
import { HomeHero } from "@/components/home/HomeHero";
import { CorridorSection } from "@/components/home/CorridorSection";
import { TakeoverSection } from "@/components/home/TakeoverSection";
import { TransformationGallery } from "@/components/home/TransformationGallery";
import { ProductCard } from "@/components/products/ProductCard";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { indexLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [products, collections] = await Promise.all([getAllProducts(), getCollections()]);

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const featured = products.filter((p) => p.featured);
  const heroProducts = featured.slice(0, 6);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);
  const bestsellers = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4);

  const corridorSlugs = ["botanical", "abstract", "marble-stone", "luxury", "artistic-murals"];
  const corridorItems = corridorSlugs
    .map((slug) => {
      const col = collections.find((c) => c.slug === slug);
      const feature = products.find((p) => p.collectionSlug === slug && p.featured) ?? products.find((p) => p.collectionSlug === slug);
      if (!col || !feature) return null;
      return { slug: col.slug, name: col.name, accent: col.accent, texture: feature.texture };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const takeoverProducts = [
    "midnight-garden", "celestial-marble", "golden-geometry", "orchid-eclipse",
    "fluid-earth", "infinite-lines", "monsoon-canopy", "aurora-mural",
  ]
    .map((s) => bySlug.get(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const transformProducts = ["forgotten-paradise", "golden-geometry", "infinite-lines"]
    .map((s) => bySlug.get(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <HomeHero products={heroProducts} />

      {/* Editorial marquee divider */}
      <div className="section-dark border-y border-ivory/10 py-5 overflow-hidden" aria-hidden>
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <p key={i} className="label opacity-50 flex gap-10">
              {["Walls are no longer just walls", "28 designs", "10 worlds", "One room studio", "Made for Indian homes"].map(
                (s) => (
                  <span key={s} className="flex items-center gap-10">
                    {s} <span className="text-citron">✺</span>
                  </span>
                )
              )}
            </p>
          ))}
        </div>
      </div>

      <CorridorSection items={corridorItems} />
      <TakeoverSection products={takeoverProducts} />
      <TransformationGallery products={transformProducts} />

      {/* ——— Chapter 06 — The Gallery Floor ——— */}
      <section className="section-dark py-24 md:py-36" aria-label="Featured designs">
        <div className="container-wv">
          <Reveal>
            <p className="label text-citron mb-4">Chapter 06 — The Gallery Floor</p>
            <h2 className="display text-4xl md:text-6xl">The archive, open for business.</h2>
          </Reveal>

          {/* Featured editorial split */}
          {featured[0] ? (
            <Reveal className="mt-16 grid gap-8 lg:grid-cols-[1.6fr_1fr] items-end">
              <Link href={`/product/${featured[0].slug}`} className="group relative block overflow-hidden">
                <TexturePreview
                  texture={featured[0].texture}
                  tileSize={320}
                  alt={`${featured[0].name} wallpaper`}
                  className="aspect-[16/10] transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-7">
                  <p className="label text-citron mb-1">{featured[0].collectionName}</p>
                  <p className="display text-3xl md:text-5xl text-ivory">{featured[0].name}</p>
                </div>
              </Link>
              <div className="flex flex-col gap-5">
                <p className="text-sm opacity-70 leading-relaxed max-w-sm">{featured[0].description}</p>
                <div className="flex gap-3">
                  <Button href={`/product/${featured[0].slug}`} variant="citron">
                    View design
                  </Button>
                  <Button href="/shop" variant="outline" className="text-ivory">
                    All designs
                  </Button>
                </div>
              </div>
            </Reveal>
          ) : null}

          {/* New arrivals */}
          <div className="mt-24">
            <Reveal className="flex items-baseline justify-between gap-4 mb-8">
              <h3 className="font-serif text-2xl md:text-3xl">New arrivals</h3>
              <Link href="/shop?sort=newest" className="label text-citron hover:underline underline-offset-4">
                View all →
              </Link>
            </Reveal>
            <Reveal stagger={0.08} className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {newArrivals.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </Reveal>
          </div>

          {/* Bestsellers */}
          <div className="mt-24">
            <Reveal className="flex items-baseline justify-between gap-4 mb-8">
              <h3 className="font-serif text-2xl md:text-3xl">Bestsellers</h3>
              <Link href="/shop?sort=popular" className="label text-citron hover:underline underline-offset-4">
                View all →
              </Link>
            </Reveal>
            <Reveal stagger={0.08} className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {bestsellers.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </Reveal>
          </div>

          {/* Collection index */}
          <div className="mt-24">
            <Reveal className="mb-8">
              <h3 className="font-serif text-2xl md:text-3xl">Ten worlds of pattern</h3>
            </Reveal>
            <Reveal stagger={0.04} className="flex flex-col divide-y divide-ivory/10 border-y border-ivory/10">
              {collections.map((c, i) => (
                <Link
                  key={c.slug}
                  href={`/collections/${c.slug}`}
                  className="group flex items-center justify-between gap-4 py-5"
                >
                  <span className="flex items-baseline gap-5">
                    <span className="label opacity-40">{indexLabel(i)}</span>
                    <span className="display text-2xl md:text-4xl group-hover:text-citron transition-colors">
                      {c.name}
                    </span>
                  </span>
                  <span className="label opacity-40 group-hover:opacity-100 group-hover:text-citron transition-all">
                    {c.productCount} designs →
                  </span>
                </Link>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Room Studio CTA */}
      <section className="section-light on-light py-24 md:py-32" aria-label="Room Studio">
        <div className="container-wv grid gap-10 lg:grid-cols-2 items-center">
          <Reveal>
            <p className="label opacity-60 mb-4">The Room Studio</p>
            <h2 className="display text-4xl md:text-6xl">
              See it on <em className="not-italic underline decoration-citron decoration-4 underline-offset-8">your</em> walls first.
            </h2>
            <p className="mt-5 max-w-md text-sm opacity-70 leading-relaxed">
              A real-time 3D room where every wall is selectable. Apply any design, tune the pattern
              scale, change the light, and add the exact look to your cart.
            </p>
            <div className="mt-8">
              <Button href="/room-studio" variant="ink">
                Open the Room Studio
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="border border-ink/15 shadow-xl">
              <TexturePreview texture="/textures/monsoon-canopy.svg" tileSize={200} className="h-10 w-full" />
              <div className="grid grid-cols-3">
                {["/textures/celestial-marble.svg", "/textures/orchid-eclipse.svg", "/textures/golden-geometry.svg"].map(
                  (t) => (
                    <TexturePreview key={t} texture={t} tileSize={150} className="aspect-square" />
                  )
                )}
              </div>
              <p className="label p-4 opacity-60">Three rooms · every wall selectable · live pattern scale</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
