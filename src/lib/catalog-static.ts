/**
 * The catalogue served straight from src/data (static mode). Mirrors the
 * database queries in catalog.ts: same filters, sort orders and pagination.
 */
import { collections, products, textureUrl, type CollectionSeed, type ProductSeed } from "@/data/catalogue";
import type { CollectionDTO, ProductDTO } from "@/types";

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

const collectionBySlug = new Map(collections.map((c) => [c.slug, c]));

function toProduct(p: ProductSeed): ProductDTO {
  const c = collectionBySlug.get(p.collection);
  return {
    id: p.sku,
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
    relatedSlugs: p.related,
    collectionSlug: p.collection,
    collectionName: c?.name ?? p.collection,
  };
}

function toCollection(c: CollectionSeed): CollectionDTO {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    accent: c.accent,
    order: c.order,
    productCount: products.filter((p) => p.collection === c.slug).length,
  };
}

// Catalogue position stands in for creation time (the seed inserts in this order).
const allProducts = products.map((p, index) => ({ dto: toProduct(p), index }));

const byRecommended = (a: ProductDTO, b: ProductDTO) =>
  Number(b.featured) - Number(a.featured) || b.popularity - a.popularity;

const includes = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.toLowerCase());

export function staticCollections(): CollectionDTO[] {
  return [...collections].sort((a, b) => a.order - b.order).map(toCollection);
}

export function staticCollection(slug: string) {
  const c = collectionBySlug.get(slug);
  if (!c) return null;
  return {
    collection: toCollection(c),
    products: allProducts
      .map((p) => p.dto)
      .filter((p) => p.collectionSlug === slug)
      .sort((a, b) => b.popularity - a.popularity),
  };
}

export function staticProducts(filters: ShopFilters = {}) {
  const { q, collection, color, style, material, minPrice, maxPrice, sort = "recommended", page = 1, perPage = 12 } = filters;

  let rows = allProducts.filter(({ dto: p }) => {
    if (collection && p.collectionSlug !== collection) return false;
    if (color && !includes(p.colorFamily, color)) return false;
    if (style && !includes(p.style, style)) return false;
    if (material && !includes(p.material, material)) return false;
    if (minPrice != null && p.price < minPrice) return false;
    if (maxPrice != null && p.price > maxPrice) return false;
    if (q) {
      const fields = [p.name, p.description, p.colorFamily, p.style, p.collectionName, p.collectionSlug];
      if (!fields.some((f) => includes(f, q))) return false;
    }
    return true;
  });

  rows = [...rows].sort((a, b) => {
    switch (sort) {
      case "newest":
        return Number(b.dto.newArrival) - Number(a.dto.newArrival) || b.index - a.index;
      case "price-asc":
        return a.dto.price - b.dto.price;
      case "price-desc":
        return b.dto.price - a.dto.price;
      case "popular":
        return b.dto.popularity - a.dto.popularity;
      default:
        return byRecommended(a.dto, b.dto);
    }
  });

  const total = rows.length;
  return {
    total,
    page,
    perPage,
    pages: Math.max(1, Math.ceil(total / perPage)),
    products: rows.slice((page - 1) * perPage, page * perPage).map((r) => r.dto),
  };
}

export function staticProduct(slug: string): ProductDTO | null {
  return allProducts.find((p) => p.dto.slug === slug)?.dto ?? null;
}

export function staticProductsBySlugs(slugs: string[]): ProductDTO[] {
  const bySlug = new Map(allProducts.map((p) => [p.dto.slug, p.dto]));
  return slugs.map((s) => bySlug.get(s)).filter((p): p is ProductDTO => Boolean(p));
}

export function staticAllProducts(): ProductDTO[] {
  return allProducts.map((p) => p.dto).sort(byRecommended);
}

export function staticFilterOptions() {
  const dtos = allProducts.map((p) => p.dto);
  const distinct = (values: string[]) => [...new Set(values)].sort();
  const prices = dtos.map((p) => p.price);
  return {
    colors: distinct(dtos.map((p) => p.colorFamily)),
    styles: distinct(dtos.map((p) => p.style)),
    materials: distinct(dtos.map((p) => p.material)),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
}
