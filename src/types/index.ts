/** Serializable product shape passed between server and client components. */
export interface ProductDTO {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  material: string;
  finish: string;
  colorFamily: string;
  style: string;
  rollWidthCm: number;
  rollLengthM: number;
  coverageSqm: number;
  patternRepeatCm: number;
  patternMatch: string;
  priceUnit: string;
  texture: string;
  accent: string;
  inStock: boolean;
  featured: boolean;
  newArrival: boolean;
  popularity: number;
  installationNotes: string;
  relatedSlugs: string[];
  collectionSlug: string;
  collectionName: string;
}

export interface CollectionDTO {
  id: string;
  slug: string;
  name: string;
  description: string;
  accent: string;
  order: number;
  productCount?: number;
}

export interface CartItem {
  slug: string;
  sku: string;
  name: string;
  price: number; // effective unit price (sale price when present)
  priceUnit: string;
  texture: string;
  accent: string;
  collectionName: string;
  quantity: number;
}

export const effectivePrice = (p: { price: number; salePrice: number | null }) =>
  p.salePrice ?? p.price;
