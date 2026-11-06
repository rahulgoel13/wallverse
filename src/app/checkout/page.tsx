import type { Metadata } from "next";
import { paymentMode } from "@/lib/site";
import { usesDatabase } from "@/lib/data-source";
import { getCommerceConfig } from "@/lib/settings";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Guest checkout — delivery details and payment.",
  alternates: { canonical: "/checkout" },
};

export default async function CheckoutPage() {
  const config = await getCommerceConfig();
  return (
    <div className="section-dark min-h-dvh pt-[calc(var(--header-h)+1.5rem)] pb-24">
      <div className="container-wv">
        <header className="mb-10">
          <p className="label text-citron mb-3">Guest checkout</p>
          <h1 className="display text-4xl md:text-6xl">Delivery & payment.</h1>
        </header>
        <CheckoutClient
          razorpayAvailable={usesDatabase && paymentMode() === "razorpay"}
          demoOnly={!usesDatabase}
          config={config}
        />
      </div>
    </div>
  );
}
