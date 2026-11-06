import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { paymentMode } from "@/lib/site";

export const metadata = { title: "Admin — overview", robots: { index: false } };

export default async function AdminOverview() {
  const [products, collections, orders, customers, enquiries, revenue, recentOrders] =
    await Promise.all([
      db.product.count(),
      db.collection.count(),
      db.order.count(),
      db.customer.count(),
      db.enquiry.count({ where: { status: "new" } }),
      db.order.aggregate({ _sum: { total: true }, where: { status: { not: "cancelled" } } }),
      db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { customer: true } }),
    ]);

  const stats = [
    { label: "Products", value: products, href: "/admin/products" },
    { label: "Collections", value: collections, href: "/admin/collections" },
    { label: "Orders", value: orders, href: "/admin/orders" },
    { label: "Customers", value: customers, href: "/admin/customers" },
    { label: "New enquiries", value: enquiries, href: "/admin/enquiries" },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Overview</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="border border-ivory/15 p-5 hover:border-citron/60 transition-colors">
            <p className="label opacity-50">{s.label}</p>
            <p className="tabular text-3xl mt-2">{s.value}</p>
          </Link>
        ))}
        <div className="border border-citron/40 p-5">
          <p className="label opacity-50">Order value</p>
          <p className="tabular text-2xl mt-2 text-citron">{formatINR(revenue._sum.total ?? 0)}</p>
        </div>
      </div>

      <p className="label mt-6 opacity-50">
        Payment mode: <span className={paymentMode() === "demo" ? "text-champagne" : "text-citron"}>{paymentMode() === "demo" ? "DEMO — no real payments" : "Razorpay configured"}</span>
      </p>

      <h2 className="font-serif text-2xl mt-12 mb-5">Latest orders</h2>
      {recentOrders.length === 0 ? (
        <EmptyState
          label="No orders yet"
          message="Place a demo order from the storefront to see the flow here."
        />
      ) : (
        <div className="overflow-x-auto border border-ivory/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-ivory/15">
                <th className="label opacity-50 px-4 py-3 font-medium">Order</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Customer</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Status</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Payment</th>
                <th className="label opacity-50 px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-ivory/10 last:border-0 hover:bg-ivory/5">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="tabular text-citron hover:underline underline-offset-4">
                      {o.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.customer.name}</td>
                  <td className="px-4 py-3 capitalize">{o.status}</td>
                  <td className="px-4 py-3">{o.paymentStatus}</td>
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
