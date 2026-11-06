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

/** An order as shown on the confirmation page (from the database, or stored in the browser in static mode). */
export interface OrderView {
  id: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string | null;
  notes: string | null;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  createdAt: string;
  customer: { name: string; email: string; phone: string };
  items: { name: string; unitPrice: number; quantity: number; total: number; slug: string; texture: string }[];
  /** True when the order exists only in this browser (no database). */
  storedLocally?: boolean;
}

export const effectivePrice =(p: { price: number; salePrice: number | null }) =>
  p.salePrice ?? p.price;
