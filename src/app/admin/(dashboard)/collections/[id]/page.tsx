import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CollectionForm } from "@/components/admin/CollectionForm";

export const metadata = { title: "Admin — edit collection", robots: { index: false } };

export default async function EditCollectionPage({ params }: PageProps<"/admin/collections/[id]">) {
  const { id } = await params;
  const collection = await db.collection.findUnique({ where: { id } });
  if (!collection) notFound();
  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Edit — {collection.name}</h1>
      <CollectionForm collection={collection} />
    </div>
  );
}
