import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { deleteProduct } from "@/app/admin/actions";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Admin — products", robots: { index: false } };

export default async function AdminProducts() {
  const products = await db.product.findMany({
    include: { collection: true, _count: { select: { orderItems: true } } },
    orderBy: { sku: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl">Products ({products.length})</h1>
        <Button href="/admin/products/new" variant="citron" size="sm">
          + New product
        </Button>
      </div>
      <div className="overflow-x-auto border border-ivory/15">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-ivory/15">
              <th className="label opacity-50 px-4 py-3 font-medium">Design</th>
              <th className="label opacity-50 px-4 py-3 font-medium">SKU</th>
              <th className="label opacity-50 px-4 py-3 font-medium">Collection</th>
              <th className="label opacity-50 px-4 py-3 font-medium text-right">Price</th>
              <th className="label opacity-50 px-4 py-3 font-medium">Stock</th>
              <th className="label opacity-50 px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-ivory/10 last:border-0 hover:bg-ivory/5">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    <TexturePreview texture={p.texture} tileSize={70} className="h-9 w-9 shrink-0 border border-ivory/10" />
                    <Link href={`/admin/products/${p.id}`} className="hover:text-citron transition-colors">
                      {p.name}
                    </Link>
                  </span>
                </td>
                <td className="px-4 py-3 tabular opacity-70">{p.sku}</td>
                <td className="px-4 py-3 opacity-70">{p.collection.name}</td>
                <td className="px-4 py-3 tabular text-right">
                  {formatINR(p.salePrice ?? p.price)}
                  {p.salePrice ? <s className="opacity-40 ml-1">{formatINR(p.price)}</s> : null}
                </td>
                <td className="px-4 py-3">
                  <span className={p.inStock ? "text-citron" : "text-error"}>{p.inStock ? "In stock" : "Out"}</span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/products/${p.id}`} className="label text-citron hover:underline underline-offset-4 mr-4">
                    Edit
                  </Link>
                  <form action={deleteProduct} className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="label opacity-60 hover:opacity-100 hover:text-error cursor-pointer"
                      title={p._count.orderItems > 0 ? "Has orders — will be taken off sale instead of deleted" : "Delete permanently"}
                    >
                      {p._count.orderItems > 0 ? "Retire" : "Delete"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
