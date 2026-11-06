import { PrismaClient } from "@prisma/client";
import { collections, products, textureUrl } from "../src/data/catalogue";
import { journalPosts } from "../src/data/journal";
import { coupons } from "../src/data/coupons";

const db = new PrismaClient();

async function main() {
  // The seed runs on every Vercel deploy. Re-seeding a live store would
  // overwrite prices, stock and copy edited in the admin, so it only fills an
  // empty database. SEED_FORCE=1 re-applies the demo catalogue deliberately.
  const existing = await db.product.count();
  if (existing > 0 && process.env.SEED_FORCE !== "1") {
    console.log(`Catalogue already has ${existing} products — skipping seed (set SEED_FORCE=1 to re-apply).`);
    return;
  }

  for (const c of collections) {
    await db.collection.upsert({
      where: { id: c.id },
      update: { slug: c.slug, name: c.name, description: c.description, accent: c.accent, order: c.order },
      create: { id: c.id, slug: c.slug, name: c.name, description: c.description, accent: c.accent, order: c.order },
    });
  }

  for (const p of products) {
    const collection = collections.find((c) => c.slug === p.collection);
    if (!collection) throw new Error(`Unknown collection ${p.collection} for ${p.slug}`);
    const data = {
      sku: p.sku,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      salePrice: p.salePrice ?? null,
      material: p.material,
      finish: p.finish,
      colorFamily: p.colorFamily,
      style: p.style,
      rollWidthCm: p.rollWidthCm,
      rollLengthM: p.rollLengthM,
      coverageSqm: p.coverageSqm,
      patternRepeatCm: p.patternRepeatCm,
      patternMatch: p.patternMatch,
      priceUnit: p.priceUnit,
      texture: textureUrl(p.slug),
      accent: p.accent,
      inStock: p.inStock,
      featured: p.featured,
      newArrival: p.newArrival,
      popularity: p.popularity,
      installationNotes: p.installationNotes,
      relatedSlugs: p.related.join(","),
      collectionId: collection.id,
    };
    await db.product.upsert({ where: { slug: p.slug }, update: data, create: data });
  }

  for (const j of journalPosts) {
    const data = {
      slug: j.slug,
      title: j.title,
      excerpt: j.excerpt,
      content: j.content,
      cover: j.cover,
      tags: j.tags,
      publishedAt: new Date(j.publishedAt),
    };
    await db.journalPost.upsert({ where: { slug: j.slug }, update: data, create: data });
  }

  for (const c of coupons) {
    const { code, ...rest } = c;
    await db.coupon.upsert({ where: { code }, update: rest, create: c });
  }

  console.log(
    `Seeded ${collections.length} collections, ${products.length} products, ${journalPosts.length} journal posts, ${coupons.length} coupons.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
