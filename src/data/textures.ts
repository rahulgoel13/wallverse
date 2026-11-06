import { products, textureUrl } from "@/data/catalogue";

/**
 * Texture assets available to the admin product form. Derived from the
 * catalogue (every generated texture belongs to a catalogue design) rather
 * than read from public/ on disk: in serverless deployments public/ is served
 * by the CDN and is not on the function's filesystem.
 */
export const textureAssets: string[] = [...new Set(products.map((p) => textureUrl(p.slug)))].sort();
