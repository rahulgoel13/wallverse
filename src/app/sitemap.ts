import type { MetadataRoute } from "next";
import { getAllProducts, getCollections } from "@/lib/catalog";
import { getJournalPosts } from "@/lib/journal";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, posts] = await Promise.all([
    getAllProducts(),
    getCollections(),
    getJournalPosts(),
  ]);

  const staticRoutes = [
    "",
    "/shop",
    "/collections",
    "/room-studio",
    "/calculator",
    "/search",
    "/about",
    "/contact",
    "/installation",
    "/shipping-returns",
    "/privacy",
    "/terms",
    "/journal",
  ].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...collections.map((c) => ({
      url: `${site.url}/collections/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${site.url}/product/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${site.url}/journal/${p.slug}`,
      lastModified: p.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
