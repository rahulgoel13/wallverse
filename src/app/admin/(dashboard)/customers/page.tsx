import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR, formatDate } from "@/lib/format";

export const metadata = { title: "Admin — customers", robots: { index: false } };

export default async function AdminCustomers() {
  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { orders: { select: { total: true } } },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Customers ({customers.length})</h1>
      {customers.length === 0 ? (
        <EmptyState label="No customers yet" message="Customers appear with their first order." />
      ) : (
        <div className="overflow-x-auto border border-ivory/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-ivory/15">
                <th className="label opacity-50 px-4 py-3 font-medium">Name</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Email</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Phone</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Since</th>
                <th className="label opacity-50 px-4 py-3 font-medium text-right">Orders</th>
                <th className="label opacity-50 px-4 py-3 font-medium text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-ivory/10 last:border-0 hover:bg-ivory/5">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3 opacity-70">{c.email}</td>
                  <td className="px-4 py-3 tabular opacity-70">{c.phone}</td>
                  <td className="px-4 py-3 opacity-60">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 tabular text-right">{c.orders.length}</td>
                  <td className="px-4 py-3 tabular text-right">
                    {formatINR(c.orders.reduce((s, o) => s + o.total, 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
