import Link from "next/link";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR, formatDate } from "@/lib/format";

export const metadata = { title: "Admin — orders", robots: { index: false } };

export default async function AdminOrders() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, _count: { select: { items: true } } },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Orders ({orders.length})</h1>
      {orders.length === 0 ? (
        <EmptyState label="No orders yet" message="Orders appear here as soon as a customer checks out." />
      ) : (
        <div className="overflow-x-auto border border-ivory/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-ivory/15">
                <th className="label opacity-50 px-4 py-3 font-medium">Order</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Date</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Customer</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Items</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Status</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Payment</th>
                <th className="label opacity-50 px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-ivory/10 last:border-0 hover:bg-ivory/5">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="tabular text-citron hover:underline underline-offset-4">
                      {o.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 opacity-60">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">{o.customer.name}</td>
                  <td className="px-4 py-3 tabular">{o._count.items}</td>
                  <td className="px-4 py-3 capitalize">{o.status}</td>
                  <td className="px-4 py-3 opacity-70">{o.paymentStatus}</td>
                  <td className="px-4 py-3 tabular text-right">{formatINR(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
