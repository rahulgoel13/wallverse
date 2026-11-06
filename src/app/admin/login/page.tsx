import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="section-dark min-h-dvh flex items-center justify-center px-5">
      <div className="w-full max-w-sm border border-ivory/15 p-8">
        <p className="label text-citron mb-2">WALLVERSE</p>
        <h1 className="font-serif text-3xl mb-7">Back of house.</h1>
        <LoginForm />
        <p className="label opacity-40 mt-6">
          Credentials are configured in .env (ADMIN_EMAIL / ADMIN_PASSWORD).
        </p>
      </div>
    </div>
  );
}
