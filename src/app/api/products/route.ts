import { NextRequest, NextResponse } from "next/server";
import { getProductsBySlugs } from "@/lib/catalog";

/** Returns product DTOs for a comma-separated list of slugs (used by wishlist & recently viewed). */
export async function GET(req: NextRequest) {
  const slugsParam = req.nextUrl.searchParams.get("slugs") ?? "";
  const slugs = slugsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 60);
  if (slugs.length === 0) return NextResponse.json({ products: [] });
  const products = await getProductsBySlugs(slugs);
  return NextResponse.json({ products });
}
