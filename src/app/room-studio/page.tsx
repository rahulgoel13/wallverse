import type { Metadata } from "next";
import { getAllProducts, getCollections } from "@/lib/catalog";
import { RoomStudio } from "@/components/studio/RoomStudio";

export const metadata: Metadata = {
  title: "Room Studio — visualize wallpaper in a 3D room",
  description:
    "An interactive 3D wallpaper visualizer. Select any wall, apply any WALLVERSE design, tune pattern scale and lighting, and add the look to your cart.",
  alternates: { canonical: "/room-studio" },
};

export default async function RoomStudioPage({
  searchParams,
}: PageProps<"/room-studio">) {
  const [products, collections, params] = await Promise.all([
    getAllProducts(),
    getCollections(),
    searchParams,
  ]);
  const design = typeof params.design === "string" ? params.design : undefined;

  return (
    <div className="section-dark min-h-dvh pt-[calc(var(--header-h)+1.5rem)] pb-20">
      <div className="container-wv">
        <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="label text-citron mb-3">The Room Studio</p>
            <h1 className="display text-4xl md:text-6xl">Dress your walls.</h1>
          </div>
          <p className="max-w-sm text-sm opacity-60 leading-relaxed">
            Click any wall to select it, apply any design from the archive, and tune the pattern
            until the room feels right. Your design can be saved, shared and purchased.
          </p>
        </header>
        <RoomStudio products={products} collections={collections} initialDesign={design} />
      </div>
    </div>
  );
}
