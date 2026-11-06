"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { useCart } from "@/store/cart";
import { computeTotals, type CommerceLike } from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { validateCoupon } from "@/app/actions/orders";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export function CartClient({ config }: { config: CommerceLike }) {
  const { items, setQuantity, remove, coupon, setCoupon } = useCart();
  const hydrated = useHydrated();
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [checking, startChecking] = useTransition();

  if (!hydrated) {
    return <div className="h-64 bg-obsidian animate-pulse" aria-busy="true" aria-label="Loading cart" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        label="Empty bag"
        message="There is nothing on your walls yet."
        action={
          <Button href="/shop" variant="citron">
            Start exploring
          </Button>
        }
      />
    );
  }

  const totals = computeTotals(items, coupon, config);

  const applyCoupon = () => {
    const code = couponInput.trim();
    if (!code) return;
    startChecking(async () => {
      const res = await validateCoupon(code, totals.subtotal);
      if (res.ok && res.coupon) {
        setCoupon(res.coupon);
        setCouponMessage(res.message);
      } else {
        setCoupon(null);
        setCouponMessage(res.message);
      }
    });
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] items-start">
      {/* Items */}
      <ul className="flex flex-col divide-y divide-ivory/10 border-y border-ivory/10">
        {items.map((item) => {
          const productHref = `/product/${item.slug.replace(/^sample:/, "")}`;
          return (
            <li key={item.slug} className="flex gap-5 py-6">
              <Link href={productHref} className="shrink-0">
                <TexturePreview
                  texture={item.texture}
                  tileSize={120}
                  alt={`${item.name} pattern`}
                  className="h-24 w-24 border border-ivory/10"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-lg leading-tight">
                      <Link href={productHref} className="hover:underline underline-offset-4">
                        {item.name}
                      </Link>
                    </p>
                    <p className="label opacity-50 mt-1">
                      {item.collectionName} · {formatINR(item.price)} {item.priceUnit}
                    </p>
                  </div>
                  <p className="tabular font-medium whitespace-nowrap">{formatINR(item.price * item.quantity)}</p>
                </div>
                <div className="flex items-center justify-between gap-4 mt-1">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(v) => setQuantity(item.slug, v)}
                    label={`Quantity of ${item.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => remove(item.slug)}
                    className="label opacity-60 hover:opacity-100 hover:text-error transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Summary */}
      <aside className="border border-ivory/15 p-6 md:p-8 lg:sticky lg:top-[calc(var(--header-h)+1rem)]" aria-label="Order summary">
        <h2 className="font-serif text-2xl mb-6">Summary</h2>

        {/* Coupon */}
        <div className="mb-6">
          <label htmlFor="coupon" className="label opacity-60">
            Coupon code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="coupon"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="WELCOME10"
              className="w-full border border-ivory/25 bg-transparent px-3 py-2.5 text-sm uppercase tracking-wider placeholder:opacity-40 focus:border-citron outline-none"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={checking || !couponInput.trim()}
              className="label border border-ivory/25 px-4 cursor-pointer hover:border-citron hover:text-citron transition-colors disabled:opacity-40"
            >
              {checking ? "…" : "Apply"}
            </button>
          </div>
          {coupon ? (
            <p className="mt-2 text-xs text-citron flex items-center justify-between">
              <span>✓ {coupon.code} applied</span>
              <button
                type="button"
                className="label opacity-60 hover:opacity-100 cursor-pointer"
                onClick={() => {
                  setCoupon(null);
                  setCouponMessage(null);
                }}
              >
                Remove
              </button>
            </p>
          ) : couponMessage ? (
            <p role="alert" className="mt-2 text-xs text-error">
              {couponMessage}
            </p>
          ) : null}
        </div>

        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="opacity-60">Subtotal</dt>
            <dd className="tabular">{formatINR(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 ? (
            <div className="flex justify-between text-citron">
              <dt>Discount ({coupon?.code})</dt>
              <dd className="tabular">−{formatINR(totals.discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="opacity-60">Shipping</dt>
            <dd className="tabular">{totals.shipping === 0 ? "Free" : formatINR(totals.shipping)}</dd>
          </div>
          <div className="flex justify-between opacity-60 text-xs">
            <dt>Includes GST</dt>
            <dd className="tabular">{formatINR(totals.taxIncluded)}</dd>
          </div>
          <div className="flex justify-between border-t border-ivory/15 pt-4 text-lg">
            <dt className="font-serif">Total</dt>
            <dd className="tabular font-medium">{formatINR(totals.total)}</dd>
          </div>
        </dl>

        {totals.freeShippingGap > 0 ? (
          <p className="mt-4 text-xs opacity-60">
            Add {formatINR(totals.freeShippingGap)} more for free shipping.
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3">
          <Button href="/checkout" variant="citron" className="w-full">
            Proceed to checkout
          </Button>
          <Button href="/shop" variant="outline" className="w-full text-ivory">
            Continue shopping
          </Button>
        </div>
      </aside>
    </div>
  );
}
