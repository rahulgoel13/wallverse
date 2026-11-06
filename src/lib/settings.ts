import "server-only";
import { db } from "@/lib/db";
import { usesDatabase } from "@/lib/data-source";
import { commerce } from "@/lib/site";

export interface CommerceConfig {
  shippingFlat: number;
  freeShippingAbove: number;
  taxRate: number;
  pricesIncludeTax: boolean;
}

/** Commerce configuration: admin-edited Setting rows override code defaults. */
export async function getCommerceConfig(): Promise<CommerceConfig> {
  if (!usesDatabase) return { ...commerce };
  try {
    const rows = await db.setting.findMany({
      where: { key: { in: ["shippingFlat", "freeShippingAbove", "taxRatePct"] } },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    const num = (key: string, fallback: number) => {
      const v = Number(map.get(key));
      return Number.isFinite(v) && v >= 0 ? v : fallback;
    };
    return {
      shippingFlat: num("shippingFlat", commerce.shippingFlat),
      freeShippingAbove: num("freeShippingAbove", commerce.freeShippingAbove),
      taxRate: num("taxRatePct", commerce.taxRate * 100) / 100,
      pricesIncludeTax: commerce.pricesIncludeTax,
    };
  } catch {
    return { ...commerce };
  }
}
