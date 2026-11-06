import type { Metadata } from "next";
import { WishlistClient } from "@/components/shop/WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Designs you have saved for later.",
  alternates: { canonical: "/wishlist" },
};

export default function WishlistPage() {
  return (
    <div className="section-dark min-h-dvh pt-[calc(var(--header-h)+1.5rem)] pb-24">
      <div className="container-wv">
        <header className="mb-10">
          <p className="label text-citron mb-3">Saved for later</p>
          <h1 className="display text-4xl md:text-6xl">Your wishlist.</h1>
        </header>
        <WishlistClient />
      </div>
    </div>
  );
}
