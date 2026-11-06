import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAction } from "@/app/admin/actions";

// Admin pages are per-request and behind a session: never prerender them at
// build time (that ran their database queries with no session and no request).
export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="section-dark min-h-dvh pt-[calc(var(--header-h)+1rem)]">
      <div className="container-wv py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/15 pb-5 mb-8">
          <div>
            <p className="label text-citron">Back of house</p>
            <p className="font-serif text-2xl">WALLVERSE Admin</p>
          </div>
          <nav aria-label="Admin" className="flex flex-wrap gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="label px-3 py-2 opacity-70 hover:opacity-100 hover:text-citron transition-all"
              >
                {n.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <button type="submit" className="label px-3 py-2 opacity-50 hover:opacity-100 hover:text-error transition-all cursor-pointer">
                Sign out
              </button>
            </form>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
