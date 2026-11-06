import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { usesDatabase } from "@/lib/data-source";
import { LoginForm } from "@/components/admin/LoginForm";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Only redirect in database mode: the dashboard sends static-mode visitors back here.
  if (usesDatabase && (await isAdmin())) redirect("/admin");

  return (
    <div className="section-dark min-h-dvh flex items-center justify-center px-5">
      <div className="w-full max-w-sm border border-ivory/15 p-8">
        <p className="label text-citron mb-2">WALLVERSE</p>
        <h1 className="font-serif text-3xl mb-7">Back of house.</h1>
        {usesDatabase ? (
          <>
            <LoginForm />
            <p className="label opacity-40 mt-6">
              Credentials are configured in .env (ADMIN_EMAIL / ADMIN_PASSWORD).
            </p>
          </>
        ) : (
          <>
            <p className="text-sm opacity-75 leading-relaxed">
              The admin dashboard manages orders, enquiries and catalogue edits, which need a
              database to be stored. This site is running without one, so the dashboard is off —
              the storefront itself works fully.
            </p>
            <p className="mt-4 text-xs opacity-50 leading-relaxed">
              To turn it on, connect a Postgres database and set DATA_SOURCE=database (see the
              README).
            </p>
            <Button href="/" variant="outline" size="sm" className="mt-7 text-ivory">
              Back to the store
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
