import { readdirSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Admin — edit product", robots: { index: false } };

function textureList() {
  try {
    return readdirSync(join(process.cwd(), "public", "textures"))
      .filter((f) => f.endsWith(".svg"))
      .map((f) => `/textures/${f}`);
  } catch {
    return [];
  }
}

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const [product, collections] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.collection.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!product) notFound();
  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">
        Edit — {product.name} <span className="label opacity-50">{product.sku}</span>
      </h1>
      <ProductForm product={product} collections={collections} textures={textureList()} />
    </div>
  );
}
