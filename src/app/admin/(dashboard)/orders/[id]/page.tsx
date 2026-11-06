import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatINR, formatDate } from "@/lib/format";
import { updateOrderStatus } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Admin — order detail", robots: { index: false } };

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default async function AdminOrderDetail({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });
  if (!order) notFound();

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl tabular">{order.id}</h1>
          <p className="label opacity-50 mt-1">
            {formatDate(order.createdAt)} · {order.paymentMethod} · {order.paymentStatus}
          </p>
        </div>
        <form action={updateOrderStatus} className="flex items-center gap-3">
          <input type="hidden" name="id" value={order.id} />
          <label htmlFor="order-status" className="label opacity-60">
            Status
          </label>
          <select
            id="order-status"
            name="status"
            defaultValue={order.status}
            className="border border-ivory/25 bg-transparent px-3 py-2 text-sm [&>option]:bg-obsidian"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button type="submit" variant="citron" size="sm">
            Update
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="border border-ivory/15 p-6" aria-label="Items">
          <h2 className="label opacity-60 mb-4">Items</h2>
          <ul className="flex flex-col gap-3 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4">
                <span>
                  {i.name} <span className="opacity-50">× {i.quantity}</span>
                </span>
                <span className="tabular">{formatINR(i.total)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 flex flex-col gap-2 text-sm border-t border-ivory/15 pt-4">
            <div className="flex justify-between"><dt className="opacity-60">Subtotal</dt><dd className="tabular">{formatINR(order.subtotal)}</dd></div>
            {order.discount > 0 ? <div className="flex justify-between"><dt className="opacity-60">Discount {order.couponCode}</dt><dd className="tabular">−{formatINR(order.discount)}</dd></div> : null}
            <div className="flex justify-between"><dt className="opacity-60">Shipping</dt><dd className="tabular">{formatINR(order.shipping)}</dd></div>
            <div className="flex justify-between font-medium"><dt>Total</dt><dd className="tabular">{formatINR(order.total)}</dd></div>
          </dl>
        </section>
        <section className="border border-ivory/15 p-6" aria-label="Customer">
          <h2 className="label opacity-60 mb-4">Customer</h2>
          <p className="text-sm leading-relaxed">
            {order.customer.name}
            <br />
            {order.customer.email}
            <br />
            {order.customer.phone}
          </p>
          <h2 className="label opacity-60 mt-6 mb-3">Delivery address</h2>
          <address className="not-italic text-sm leading-relaxed opacity-80">
            {order.addressLine}
            <br />
            {order.city}, {order.state} {order.pincode}
            <br />
            {order.country}
          </address>
          {order.notes ? (
            <>
              <h2 className="label opacity-60 mt-6 mb-3">Notes</h2>
              <p className="text-sm opacity-70 whitespace-pre-line">{order.notes}</p>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
