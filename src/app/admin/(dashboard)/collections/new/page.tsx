import { CollectionForm } from "@/components/admin/CollectionForm";

export const metadata = { title: "Admin — new collection", robots: { index: false } };

export default function NewCollectionPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">New collection</h1>
      <CollectionForm collection={null} />
    </div>
  );
}
