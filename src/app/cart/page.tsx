import type { Metadata } from "next";
import { CartClient } from "@/components/cart/CartClient";
import { getCommerceConfig } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Shopping bag",
  description: "Review your selected wallpaper designs before checkout.",
  alternates: { canonical: "/cart" },
};

export default async function CartPage() {
  const config = await getCommerceConfig();
  return (
    <div className="section-dark min-h-dvh pt-[calc(var(--header-h)+1.5rem)] pb-24">
      <div className="container-wv">
        <header className="mb-10">
          <p className="label text-citron mb-3">Almost there</p>
          <h1 className="display text-4xl md:text-6xl">Your bag.</h1>
        </header>
        <CartClient config={config} />
      </div>
    </div>
  );
}
