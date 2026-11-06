import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { commerce } from "@/lib/site";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: "Delivery timelines, shipping charges, returns and refunds for WALLVERSE orders.",
  alternates: { canonical: "/shipping-returns" },
};

export default function ShippingReturnsPage() {
  return (
    <div className="section-dark min-h-dvh pb-24">
      <PageHero
        eyebrow="The Fine Print"
        title="Shipping & returns."
        texture="/textures/infinite-lines.svg"
      />
      <div className="container-wv mt-14 prose-wv">
        <h2>Shipping</h2>
        <p>
          Orders are dispatched within 3–5 working days and delivered across India by tracked
          courier. Shipping is a flat {formatINR(commerce.shippingFlat)} and free on orders of{" "}
          {formatINR(commerce.freeShippingAbove)} or more. You will receive tracking details by
          email once your order leaves the studio.
        </p>
        <p>
          Murals and multi-roll orders ship in a single reinforced tube. If a parcel arrives
          visibly damaged, photograph it before opening and contact us within 48 hours.
        </p>
        <h2>Returns</h2>
        <ul>
          <li>Unopened rolls in their original wrapping can be returned within 14 days of delivery.</li>
          <li>Opened or part-used rolls cannot be returned — order a sample first if you are unsure.</li>
          <li>Custom-printed murals are made to order and are non-returnable unless faulty.</li>
          <li>A4 samples are non-returnable.</li>
        </ul>
        <h2>Refunds</h2>
        <p>
          Approved returns are refunded to the original payment method within 7 working days of the
          rolls reaching us. Outbound shipping is refunded only when the return is due to our error
          or a manufacturing fault.
        </p>
        <h2>Faulty or mismatched rolls</h2>
        <p>
          Check batch numbers before cutting: rolls from different print batches can vary slightly
          in colour. If anything is wrong, stop after the first strip and write to us — we replace
          faulty material, but cannot cover installation beyond one hung strip.
        </p>
        <p>
          This page is a configurable demonstration policy. Replace it with the final commercial
          terms before going live.
        </p>
      </div>
    </div>
  );
}
