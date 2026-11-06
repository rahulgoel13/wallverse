import { readdirSync } from "node:fs";
import { join } from "node:path";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Admin — new product", robots: { index: false } };

function textureList() {
  try {
    return readdirSync(join(process.cwd(), "public", "textures"))
      .filter((f) => f.endsWith(".svg"))
      .map((f) => `/textures/${f}`);
  } catch {
    return [];
  }
}

export default async function NewProductPage() {
  const collections = await db.collection.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">New product</h1>
      <ProductForm product={null} collections={collections} textures={textureList()} />
    </div>
  );
}
