import { db } from "@/lib/db";
import { textureAssets } from "@/data/textures";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Admin — new product", robots: { index: false } };

export default async function NewProductPage() {
  const collections = await db.collection.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">New product</h1>
      <ProductForm product={null} collections={collections} textures={textureAssets} />
    </div>
  );
}
