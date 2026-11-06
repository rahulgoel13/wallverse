import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Account",
  description: "WALLVERSE runs on guest checkout — no account needed to shop.",
  alternates: { canonical: "/account" },
};

export default function AccountPage() {
  return (
    <div className="section-dark min-h-dvh pb-24">
      <PageHero
        eyebrow="Account"
        title="No account needed."
        copy="WALLVERSE runs entirely on guest checkout. Your cart, wishlist and saved room designs live safely in your browser — nothing to sign up for, nothing to remember."
        texture="/textures/limestone-weave.svg"
      />
      <div className="container-wv mt-14">
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl">
          <div className="border border-ivory/15 p-6">
            <p className="label text-citron mb-2">Your bag</p>
            <p className="text-sm opacity-70 leading-relaxed">Survives refreshes and visits on this device.</p>
            <Button href="/cart" variant="outline" size="sm" className="mt-5 text-ivory">
              Open cart
            </Button>
          </div>
          <div className="border border-ivory/15 p-6">
            <p className="label text-citron mb-2">Your wishlist</p>
            <p className="text-sm opacity-70 leading-relaxed">Every design you have hearted, kept locally.</p>
            <Button href="/wishlist" variant="outline" size="sm" className="mt-5 text-ivory">
              Open wishlist
            </Button>
          </div>
          <div className="border border-ivory/15 p-6">
            <p className="label text-citron mb-2">Saved rooms</p>
            <p className="text-sm opacity-70 leading-relaxed">Room Studio designs saved on this device.</p>
            <Button href="/room-studio" variant="outline" size="sm" className="mt-5 text-ivory">
              Open studio
            </Button>
          </div>
        </div>
        <p className="mt-10 text-sm opacity-60 max-w-xl">
          Looking for an order? Keep the order ID from your confirmation page or email — the studio
          can look it up any time via <span className="text-citron">/contact</span>. Customer
          accounts can be added later without changing the shopping flow.
        </p>
      </div>
    </div>
  );
}
