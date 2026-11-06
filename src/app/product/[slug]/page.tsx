import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProductsBySlugs } from "@/lib/catalog";
import { site } from "@/lib/site";
import { effectivePrice } from "@/types";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { ProductCard } from "@/components/products/ProductCard";
import { PurchasePanel } from "@/components/products/PurchasePanel";
import { PatternScalePreview } from "@/components/products/PatternScalePreview";
import { RecentlyViewed } from "@/components/products/RecentlyViewed";
import { RoomIllustration } from "@/components/home/RoomIllustration";
import { CalculatorWidget } from "@/components/calculator/CalculatorWidget";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Design not found" };
  return {
    title: `${product.name} — ${product.collectionName}`,
    description: product.description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title: `${product.name} — ${site.name}`,
      description: product.description,
      images: [{ url: product.texture }],
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await getProductsBySlugs(product.relatedSlugs.filter((s) => s !== slug));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description,
    image: `${site.url}${product.texture}`,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: effectivePrice(product),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${site.url}/product/${product.slug}`,
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: `${site.url}/shop` },
      { "@type": "ListItem", position: 2, name: product.collectionName, item: `${site.url}/collections/${product.collectionSlug}` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${site.url}/product/${product.slug}` },
    ],
  };

  const specs: [string, string][] = [
    ["SKU", product.sku],
    ["Material", product.material],
    ["Finish", product.finish],
    ["Colour family", product.colorFamily],
    ["Style", product.style],
    ["Roll size", `${product.rollWidthCm} cm × ${product.rollLengthM} m`],
    ["Coverage", `≈ ${product.coverageSqm} m² ${product.priceUnit.replace("per ", "per ")}`],
    ["Pattern repeat", product.patternRepeatCm > 0 ? `${product.patternRepeatCm} cm` : "None (free match)"],
    ["Pattern match", product.patternMatch],
  ];

  return (
    <div className="section-dark min-h-dvh pt-[calc(var(--header-h)+1.5rem)] pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="container-wv">
        <nav aria-label="Breadcrumb" className="label opacity-60 mb-8">
          <Link href="/shop" className="hover:text-citron transition-colors">Shop</Link> /{" "}
          <Link href={`/collections/${product.collectionSlug}`} className="hover:text-citron transition-colors">
            {product.collectionName}
          </Link>{" "}
          / <span aria-current="page">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] items-start">
          {/* ——— Visuals ——— */}
          <div className="flex flex-col gap-8 lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
            <TexturePreview
              texture={product.texture}
              tileSize={320}
              alt={`${product.name} wallpaper — full pattern`}
              className="aspect-[4/3] w-full border border-ivory/15"
            />
            <div className="grid gap-8 md:grid-cols-2">
              <PatternScalePreview texture={product.texture} name={product.name} />
              <div>
                <RoomIllustration
                  texture={product.texture}
                  accentOnly
                  className="aspect-[4/3] w-full border border-ivory/15"
                  title={`${product.name} shown in a room`}
                />
                <p className="label mt-3 opacity-60">
                  In situ ·{" "}
                  <Link href={`/room-studio?design=${product.slug}`} className="text-citron hover:underline underline-offset-4 normal-case tracking-normal">
                    open the 3D Room Studio →
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* ——— Details ——— */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge tone="champagne">{product.collectionName}</Badge>
              {product.newArrival ? <Badge tone="citron">New arrival</Badge> : null}
              {!product.inStock ? <Badge tone="error">Out of stock</Badge> : null}
            </div>
            <h1 className="display text-4xl md:text-6xl">{product.name}</h1>
            <p className="mt-5 text-2xl">
              <Price price={product.price} salePrice={product.salePrice} unit={product.priceUnit} />
            </p>
            <p className="label mt-1 opacity-50">Price includes GST · Demo catalogue data</p>
            <p className="mt-6 text-sm md:text-base opacity-75 leading-relaxed">{product.description}</p>

            <div className="mt-8">
              <PurchasePanel product={product} />
            </div>

            {/* Specifications */}
            <dl className="mt-10 border-t border-ivory/10">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 border-b border-ivory/10 py-3">
                  <dt className="label opacity-50">{k}</dt>
                  <dd className="text-sm text-right">{v}</dd>
                </div>
              ))}
            </dl>

            <details className="mt-6 border border-ivory/15 p-5 group">
              <summary className="label cursor-pointer list-none flex justify-between items-center">
                Installation notes <span className="group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-sm opacity-75 leading-relaxed">{product.installationNotes}</p>
              <Link href="/installation" className="label text-citron mt-3 inline-block hover:underline underline-offset-4">
                Full installation guide →
              </Link>
            </details>
            <details className="mt-3 border border-ivory/15 p-5 group">
              <summary className="label cursor-pointer list-none flex justify-between items-center">
                Delivery & returns <span className="group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-sm opacity-75 leading-relaxed">
                Dispatched in 3–5 working days across India. Free shipping on orders above ₹4,999,
                otherwise ₹149 flat. Unopened rolls can be returned within 14 days.{" "}
                <Link href="/shipping-returns" className="text-citron hover:underline underline-offset-4">
                  Full policy
                </Link>
                .
              </p>
            </details>

            {/* Roll calculator, pre-filled with this design */}
            <div className="mt-10">
              <p className="label opacity-50 mb-4">How many rolls do I need?</p>
              <CalculatorWidget product={product} compact />
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 ? (
          <section aria-label="Related designs" className="mt-24 border-t border-ivory/10 pt-12">
            <p className="label opacity-50 mb-8">Hangs well with</p>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </section>
        ) : null}

        <RecentlyViewed
          current={{
            slug: product.slug,
            name: product.name,
            texture: product.texture,
            collectionName: product.collectionName,
          }}
        />
      </div>
    </div>
  );
}
