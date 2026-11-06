import Link from "next/link";
import { formatINR, formatDate } from "@/lib/format";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { OrderView } from "@/types";

const paymentLabel: Record<string, string> = {
  demo_paid: "Demo payment — no real transaction",
  paid: "Paid",
  pending: "Payment pending",
  failed: "Payment failed",
};

/** The order confirmation, shared by the database page and the in-browser (static) page. */
export function OrderConfirmationView({ order }: { order: OrderView }) {
  const isDemo = order.paymentMethod === "demo";

  return (
    <div className="section-dark min-h-dvh pt-[calc(var(--header-h)+1.5rem)] pb-24">
      <div className="container-wv max-w-4xl">
        <header className="mb-12 text-center">
          <p className="label text-citron mb-4">Order placed</p>
          <h1 className="display text-4xl md:text-6xl">Thank you, {order.customer.name.split(" ")[0]}.</h1>
          <p className="mt-4 text-sm opacity-70">
            Order <span className="tabular font-medium">{order.id}</span> · {formatDate(order.createdAt)}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Badge tone={order.paymentStatus === "paid" ? "citron" : order.paymentStatus === "failed" ? "error" : "champagne"}>
              {paymentLabel[order.paymentStatus] ?? order.paymentStatus}
            </Badge>
            <Badge>{order.status}</Badge>
          </div>
          {isDemo ? (
            <p className="mt-5 mx-auto max-w-md text-xs opacity-60 border border-champagne/40 text-champagne px-4 py-3">
              {order.storedLocally
                ? "This is a demonstration order. No payment was taken, nothing will be shipped, and the order was not sent to the studio — it is saved only in this browser."
                : "This is a demonstration order. No payment was taken and nothing will be shipped."}
            </p>
          ) : null}
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <section className="border border-ivory/15 p-6" aria-label="Items">
            <h2 className="label opacity-60 mb-5">Items</h2>
            <ul className="flex flex-col gap-4">
              {order.items.map((i) => (
                <li key={`${i.slug}-${i.name}`} className="flex items-center gap-3 text-sm">
                  <TexturePreview texture={i.texture} tileSize={80} className="h-11 w-11 shrink-0 border border-ivory/10" />
                  <span className="flex-1 min-w-0">
                    <Link href={`/product/${i.slug}`} className="hover:underline underline-offset-4">
                      {i.name}
                    </Link>
                    <span className="opacity-50 block text-xs">
                      {i.quantity} × {formatINR(i.unitPrice)}
                    </span>
                  </span>
                  <span className="tabular">{formatINR(i.total)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 flex flex-col gap-2 text-sm border-t border-ivory/15 pt-5">
              <div className="flex justify-between"><dt className="opacity-60">Subtotal</dt><dd className="tabular">{formatINR(order.subtotal)}</dd></div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-citron"><dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt><dd className="tabular">−{formatINR(order.discount)}</dd></div>
              ) : null}
              <div className="flex justify-between"><dt className="opacity-60">Shipping</dt><dd className="tabular">{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd></div>
              <div className="flex justify-between opacity-60 text-xs"><dt>Includes GST</dt><dd className="tabular">{formatINR(order.tax)}</dd></div>
              <div className="flex justify-between text-lg border-t border-ivory/15 pt-3"><dt className="font-serif">Total</dt><dd className="tabular font-medium">{formatINR(order.total)}</dd></div>
            </dl>
          </section>

          <section className="border border-ivory/15 p-6" aria-label="Delivery details">
            <h2 className="label opacity-60 mb-5">Delivery</h2>
            <address className="not-italic text-sm leading-relaxed opacity-80">
              {order.customer.name}
              <br />
              {order.addressLine}
              <br />
              {order.city}, {order.state} {order.pincode}
              <br />
              {order.country}
            </address>
            <dl className="mt-5 flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="opacity-60">Email</dt><dd className="truncate">{order.customer.email}</dd></div>
              <div className="flex justify-between gap-4"><dt className="opacity-60">Phone</dt><dd>{order.customer.phone}</dd></div>
              <div className="flex justify-between gap-4"><dt className="opacity-60">Payment method</dt><dd className="capitalize">{order.paymentMethod === "cod" ? "Cash on delivery" : order.paymentMethod}</dd></div>
            </dl>
            {order.notes ? (
              <p className="mt-5 text-xs opacity-60 border-t border-ivory/15 pt-4 whitespace-pre-line">{order.notes}</p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3">
              <Button href="/shop" variant="citron" className="w-full">
                Continue exploring
              </Button>
              <Button href="/installation" variant="outline" className="w-full text-ivory">
                Read the installation guide
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
