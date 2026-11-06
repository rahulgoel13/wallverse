import { getCommerceConfig } from "@/lib/settings";
import { paymentMode, site } from "@/lib/site";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Admin — store settings", robots: { index: false } };

export default async function AdminSettings() {
  const config = await getCommerceConfig();

  return (
    <div className="grid gap-10 lg:grid-cols-2 items-start max-w-5xl">
      <div className="border border-ivory/15 p-7">
        <h1 className="font-serif text-2xl mb-2">Commerce settings</h1>
        <p className="text-sm opacity-60 mb-6">
          These values apply immediately to the cart, checkout and new orders.
        </p>
        <SettingsForm
          defaults={{
            shippingFlat: config.shippingFlat,
            freeShippingAbove: config.freeShippingAbove,
            taxRatePct: Math.round(config.taxRate * 100),
          }}
        />
      </div>
      <div className="border border-ivory/15 p-7">
        <h2 className="font-serif text-2xl mb-6">Installation status</h2>
        <dl className="flex flex-col gap-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="opacity-60">Brand</dt>
            <dd>{site.name} <span className="opacity-50">(working name — change in src/lib/site.ts)</span></dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-60">Currency</dt>
            <dd>{site.currency} · prices tax-inclusive</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-60">Payments</dt>
            <dd className={paymentMode() === "demo" ? "text-champagne" : "text-citron"}>
              {paymentMode() === "demo"
                ? "DEMO MODE — set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to enable real payments"
                : "Razorpay configured"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-60">Database</dt>
            <dd>SQLite (prisma/dev.db)</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-60">Admin account</dt>
            <dd>{process.env.ADMIN_EMAIL ?? "not configured"}</dd>
          </div>
        </dl>
        <p className="mt-6 text-xs opacity-50">
          Brand identity, contact details and shipping defaults are centralized in{" "}
          <code className="text-citron">src/lib/site.ts</code>. Secrets live only in{" "}
          <code className="text-citron">.env</code>.
        </p>
      </div>
    </div>
  );
}
