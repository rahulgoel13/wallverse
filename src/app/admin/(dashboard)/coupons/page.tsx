import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { deleteCoupon } from "@/app/admin/actions";
import { CouponForm } from "@/components/admin/CouponForm";

export const metadata = { title: "Admin — coupons", robots: { index: false } };

export default async function AdminCoupons() {
  const coupons = await db.coupon.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] items-start">
      <div>
        <h1 className="font-serif text-2xl mb-6">Coupons ({coupons.length})</h1>
        <div className="overflow-x-auto border border-ivory/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-ivory/15">
                <th className="label opacity-50 px-4 py-3 font-medium">Code</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Discount</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Min subtotal</th>
                <th className="label opacity-50 px-4 py-3 font-medium">Active</th>
                <th className="label opacity-50 px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code} className="border-b border-ivory/10 last:border-0 hover:bg-ivory/5">
                  <td className="px-4 py-3 tabular font-medium">{c.code}</td>
                  <td className="px-4 py-3">{c.type === "percent" ? `${c.value}%` : formatINR(c.value)}</td>
                  <td className="px-4 py-3 tabular">{formatINR(c.minSubtotal)}</td>
                  <td className="px-4 py-3">
                    <span className={c.active ? "text-citron" : "text-error"}>{c.active ? "Yes" : "No"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteCoupon} className="inline">
                      <input type="hidden" name="code" value={c.code} />
                      <button type="submit" className="label opacity-60 hover:opacity-100 hover:text-error cursor-pointer">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="border border-ivory/15 p-6">
        <h2 className="font-serif text-xl mb-5">Create or update a coupon</h2>
        <CouponForm />
      </div>
    </div>
  );
}
