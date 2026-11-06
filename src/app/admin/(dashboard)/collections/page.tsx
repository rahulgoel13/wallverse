import Link from "next/link";
import { db } from "@/lib/db";
import { deleteCollection } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Admin — collections", robots: { index: false } };

export default async function AdminCollections() {
  const collections = await db.collection.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl">Collections ({collections.length})</h1>
        <Button href="/admin/collections/new" variant="citron" size="sm">
          + New collection
        </Button>
      </div>
      <div className="overflow-x-auto border border-ivory/15">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-ivory/15">
              <th className="label opacity-50 px-4 py-3 font-medium">Order</th>
              <th className="label opacity-50 px-4 py-3 font-medium">Name</th>
              <th className="label opacity-50 px-4 py-3 font-medium">Slug</th>
              <th className="label opacity-50 px-4 py-3 font-medium">Accent</th>
              <th className="label opacity-50 px-4 py-3 font-medium text-right">Products</th>
              <th className="label opacity-50 px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id} className="border-b border-ivory/10 last:border-0 hover:bg-ivory/5">
                <td className="px-4 py-3 tabular opacity-50">{c.order}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/collections/${c.id}`} className="hover:text-citron transition-colors">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 opacity-60">{c.slug}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border border-ivory/20" style={{ background: c.accent }} />
                    <span className="tabular opacity-60">{c.accent}</span>
                  </span>
                </td>
                <td className="px-4 py-3 tabular text-right">{c._count.products}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/collections/${c.id}`} className="label text-citron hover:underline underline-offset-4 mr-4">
                    Edit
                  </Link>
                  {c._count.products === 0 ? (
                    <form action={deleteCollection} className="inline">
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="label opacity-60 hover:opacity-100 hover:text-error cursor-pointer">
                        Delete
                      </button>
                    </form>
                  ) : (
                    <span className="label opacity-30" title="Move its products first">
                      In use
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
