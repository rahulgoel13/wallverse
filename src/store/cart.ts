"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, ProductDTO } from "@/types";
import { effectivePrice } from "@/types";
import type { CouponInfo } from "@/lib/pricing";

interface CartState {
  items: CartItem[];
  coupon: CouponInfo | null;
  setCoupon: (c: CouponInfo | null) => void;
  add: (product: ProductDTO, quantity?: number) => void;
  /** Add a non-catalogue line such as an A4 sample (slug prefixed "sample:"). */
  addCustom: (item: CartItem) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      setCoupon: (coupon) => set({ coupon }),
      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.slug === product.slug);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === product.slug
                  ? { ...i, quantity: Math.min(99, i.quantity + quantity) }
                  : i
              ),
            };
          }
          const item: CartItem = {
            slug: product.slug,
            sku: product.sku,
            name: product.name,
            price: effectivePrice(product),
            priceUnit: product.priceUnit,
            texture: product.texture,
            accent: product.accent,
            collectionName: product.collectionName,
            quantity: Math.min(99, quantity),
          };
          return { items: [...state.items, item] };
        }),
      addCustom: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.slug === item.slug);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === item.slug ? { ...i, quantity: Math.min(99, i.quantity + item.quantity) } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      remove: (slug) => set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),
      setQuantity: (slug, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.slug !== slug)
              : s.items.map((i) => (i.slug === slug ? { ...i, quantity: Math.min(99, quantity) } : i)),
        })),
      clear: () => set({ items: [], coupon: null }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    { name: "wv-cart" }
  )
);
