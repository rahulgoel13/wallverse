import { commerce } from "@/lib/site";

export interface CommerceLike {
  shippingFlat: number;
  freeShippingAbove: number;
  taxRate: number;
  pricesIncludeTax: boolean;
}

export interface CouponInfo {
  code: string;
  type: "percent" | "flat";
  value: number;
  minSubtotal: number;
}

export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  /** Informational: GST portion contained in the total (prices are tax-inclusive). */
  taxIncluded: number;
  total: number;
  freeShippingGap: number; // how far from free shipping; 0 when reached
}

export function computeTotals(
  items: { price: number; quantity: number }[],
  coupon?: CouponInfo | null,
  config: CommerceLike = commerce
): Totals {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  let discount = 0;
  if (coupon && subtotal >= coupon.minSubtotal) {
    discount =
      coupon.type === "percent"
        ? Math.round((subtotal * coupon.value) / 100)
        : Math.min(coupon.value, subtotal);
  }

  const afterDiscount = subtotal - discount;
  const shipping =
    items.length === 0 || afterDiscount >= config.freeShippingAbove ? 0 : config.shippingFlat;

  const taxIncluded = config.pricesIncludeTax
    ? Math.round(afterDiscount - afterDiscount / (1 + config.taxRate))
    : Math.round(afterDiscount * config.taxRate);

  const total = afterDiscount + shipping + (config.pricesIncludeTax ? 0 : taxIncluded);

  return {
    subtotal,
    discount,
    shipping,
    taxIncluded,
    total,
    freeShippingGap: Math.max(0, config.freeShippingAbove - afterDiscount),
  };
}
