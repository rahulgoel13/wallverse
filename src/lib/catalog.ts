import "server-only";
import { db } from "@/lib/db";
import type { Prisma, Product, Collection } from "@prisma/client";
import type { CollectionDTO, ProductDTO } from "@/types";

type ProductWithCollection = Product & { collection: Collection };

export function toProductDTO(p: ProductWithCollection): ProductDTO {
  return {
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    salePrice: p.salePrice,
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
    texture: p.texture,
    accent: p.accent,
    inStock: p.inStock,
    featured: p.featured,
    newArrival: p.newArrival,
    popularity: p.popularity,
    installationNotes: p.installationNotes,
    relatedSlugs: p.relatedSlugs ? p.relatedSlugs.split(",").filter(Boolean) : [],
    collectionSlug: p.collection.slug,
    collectionName: p.collection.name,
  };
}

export function toCollectionDTO(c: Collection & { _count?: { products: number } }): CollectionDTO {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    accent: c.accent,
    order: c.order,
    productCount: c._count?.products,
  };
}

export async function getCollections(): Promise<CollectionDTO[]> {
  const rows = await db.collection.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return rows.map(toCollectionDTO);
}

export async function getCollection(slug: string) {
  const c = await db.collection.findUnique({
    where: { slug },
    include: { products: { include: { collection: true }, orderBy: { popularity: "desc" } } },
  });
  if (!c) return null;
  return { collection: toCollectionDTO(c), products: c.products.map(toProductDTO) };
}

export interface ShopFilters {
  q?: string;
  collection?: string;
  color?: string;
  style?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "recommended" | "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  perPage?: number;
}

export async function getProducts(filters: ShopFilters = {}) {
  const { q, collection, color, style, material, minPrice, maxPrice, sort = "recommended", page = 1, perPage = 12 } = filters;

  const where: Prisma.ProductWhereInput = {};
  if (collection) where.collection = { slug: collection };
  if (color) where.colorFamily = { contains: color };
  if (style) where.style = { contains: style };
  if (material) where.material = { contains: material };
  if (minPrice != null || maxPrice != null) {
    where.price = {
      ...(minPrice != null ? { gte: minPrice } : {}),
      ...(maxPrice != null ? { lte: maxPrice } : {}),
    };
  }
  if (q) {
    // Postgres `contains` is case-sensitive; search must not be.
    const match = { contains: q, mode: "insensitive" as const };
    where.OR = [
      { name: match },
      { description: match },
      { colorFamily: match },
      { style: match },
      { collection: { name: match } },
      { collection: { slug: match } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "newest"
      ? [{ newArrival: "desc" }, { createdAt: "desc" }]
      : sort === "price-asc"
        ? [{ price: "asc" }]
        : sort === "price-desc"
          ? [{ price: "desc" }]
          : sort === "popular"
            ? [{ popularity: "desc" }]
            : [{ featured: "desc" }, { popularity: "desc" }];

  const [total, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      include: { collection: true },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return {
    total,
    page,
    perPage,
    pages: Math.max(1, Math.ceil(total / perPage)),
    products: rows.map(toProductDTO),
  };
}

export async function getProduct(slug: string): Promise<ProductDTO | null> {
  const p = await db.product.findUnique({ where: { slug }, include: { collection: true } });
  return p ? toProductDTO(p) : null;
}

export async function getProductsBySlugs(slugs: string[]): Promise<ProductDTO[]> {
  if (slugs.length === 0) return [];
  const rows = await db.product.findMany({
    where: { slug: { in: slugs } },
    include: { collection: true },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, toProductDTO(r)]));
  return slugs.map((s) => bySlug.get(s)).filter((p): p is ProductDTO => Boolean(p));
}

export async function getAllProducts(): Promise<ProductDTO[]> {
  const rows = await db.product.findMany({
    include: { collection: true },
    orderBy: [{ featured: "desc" }, { popularity: "desc" }],
  });
  return rows.map(toProductDTO);
}

export async function getFilterOptions() {
  const [colors, styles, materials, price] = await Promise.all([
    db.product.findMany({ select: { colorFamily: true }, distinct: ["colorFamily"] }),
    db.product.findMany({ select: { style: true }, distinct: ["style"] }),
    db.product.findMany({ select: { material: true }, distinct: ["material"] }),
    db.product.aggregate({ _min: { price: true }, _max: { price: true } }),
  ]);
  return {
    colors: colors.map((c) => c.colorFamily).sort(),
    styles: styles.map((s) => s.style).sort(),
    materials: materials.map((m) => m.material).sort(),
    minPrice: price._min.price ?? 0,
    maxPrice: price._max.price ?? 10000,
  };
}
