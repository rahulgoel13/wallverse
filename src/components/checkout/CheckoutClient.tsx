"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/store/cart";
import { computeTotals, type CommerceLike } from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import { createOrder, verifyRazorpayPayment } from "@/app/actions/orders";
import { TextField, TextAreaField, SelectField } from "@/components/ui/Field";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Other",
];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutClient({
  razorpayAvailable,
  config,
}: {
  razorpayAvailable: boolean;
  config: CommerceLike;
}) {
  const router = useRouter();
  const { items, coupon, clear } = useCart();
  const hydrated = useHydrated();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "demo", state: "Delhi" },
  });

  if (!hydrated) {
    return <div className="h-64 bg-obsidian animate-pulse" aria-busy="true" aria-label="Loading checkout" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        label="Nothing to check out"
        message="Your bag is empty."
        action={
          <Button href="/shop" variant="citron">
            Browse designs
          </Button>
        }
      />
    );
  }

  const totals = computeTotals(items, coupon, config);
  const paymentMethod = watch("paymentMethod");

  const onSubmit = async (data: CheckoutInput) => {
    setServerError(null);
    const result = await createOrder({
      customer: data,
      items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
      couponCode: coupon?.code ?? "",
    });

    if (!result.ok) {
      setServerError(result.error);
      return;
    }

    if (result.payment === "razorpay" && "razorpay" in result) {
      // Load Razorpay checkout and verify the signature server-side afterwards.
      await new Promise<void>((resolve, reject) => {
        if (window.Razorpay) return resolve();
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Could not load the payment window."));
        document.body.appendChild(script);
      }).catch((e) => setServerError(e.message));

      if (!window.Razorpay) return;
      const rz = new window.Razorpay({
        key: result.razorpay.keyId,
        amount: result.razorpay.amount,
        currency: result.razorpay.currency,
        name: result.razorpay.name,
        order_id: result.razorpay.razorpayOrderId,
        prefill: { name: data.name, email: data.email, contact: data.phone },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const verified = await verifyRazorpayPayment({
            orderId: result.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          if (verified.ok) {
            clear();
            router.push(`/order-confirmation/${result.orderId}`);
          } else {
            setServerError(verified.error ?? "Payment verification failed.");
          }
        },
      });
      rz.open();
      return;
    }

    clear();
    router.push(`/order-confirmation/${result.orderId}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-12 lg:grid-cols-[1.6fr_1fr] items-start">
      <div className="flex flex-col gap-10">
        <fieldset>
          <legend className="font-serif text-2xl mb-6">Contact</legend>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
            <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
            <TextField
              label="Mobile number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              hint="10-digit Indian mobile number"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-serif text-2xl mb-6">Delivery address</legend>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <TextField label="Street address" autoComplete="street-address" error={errors.addressLine?.message} {...register("addressLine")} />
            </div>
            <TextField label="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
            <SelectField label="State" error={errors.state?.message} {...register("state")}>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectField>
            <TextField label="PIN code" inputMode="numeric" autoComplete="postal-code" error={errors.pincode?.message} {...register("pincode")} />
            <TextField label="Country" value="India" readOnly aria-readonly className="opacity-60" />
            <div className="md:col-span-2">
              <TextAreaField
                label="Order notes (optional)"
                hint="Installation timing, lift access, anything we should know."
                error={errors.notes?.message}
                {...register("notes")}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-serif text-2xl mb-6">Payment</legend>
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Payment method">
            <label className={`flex items-start gap-4 border p-4 cursor-pointer transition-colors ${paymentMethod === "demo" ? "border-citron" : "border-ivory/20 hover:border-ivory/50"}`}>
              <input type="radio" value="demo" {...register("paymentMethod")} className="mt-1 accent-citron" />
              <span>
                <span className="label text-citron block">Demo payment mode</span>
                <span className="text-xs opacity-60 block mt-1">
                  No real money moves. The order is recorded as a demonstration — payments are not
                  configured on this installation.
                </span>
              </span>
            </label>
            {razorpayAvailable ? (
              <label className={`flex items-start gap-4 border p-4 cursor-pointer transition-colors ${paymentMethod === "razorpay" ? "border-citron" : "border-ivory/20 hover:border-ivory/50"}`}>
                <input type="radio" value="razorpay" {...register("paymentMethod")} className="mt-1 accent-citron" />
                <span>
                  <span className="label block">Pay online — UPI, cards, netbanking</span>
                  <span className="text-xs opacity-60 block mt-1">Secure payment via Razorpay.</span>
                </span>
              </label>
            ) : null}
            <label className={`flex items-start gap-4 border p-4 cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-citron" : "border-ivory/20 hover:border-ivory/50"}`}>
              <input type="radio" value="cod" {...register("paymentMethod")} className="mt-1 accent-citron" />
              <span>
                <span className="label block">Cash on delivery</span>
                <span className="text-xs opacity-60 block mt-1">Pay when the rolls arrive (demo configuration).</span>
              </span>
            </label>
          </div>
        </fieldset>

        {serverError ? (
          <p role="alert" className="border border-error/50 text-error text-sm px-4 py-3">
            {serverError}
          </p>
        ) : null}
      </div>

      {/* Summary */}
      <aside className="border border-ivory/15 p-6 md:p-8 lg:sticky lg:top-[calc(var(--header-h)+1rem)]" aria-label="Order summary">
        <h2 className="font-serif text-2xl mb-6">Your order</h2>
        <ul className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-1" data-lenis-prevent>
          {items.map((i) => (
            <li key={i.slug} className="flex items-center gap-3 text-sm">
              <TexturePreview texture={i.texture} tileSize={80} className="h-10 w-10 shrink-0 border border-ivory/10" />
              <span className="flex-1 min-w-0 truncate">
                {i.name} <span className="opacity-50">× {i.quantity}</span>
              </span>
              <span className="tabular whitespace-nowrap">{formatINR(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 flex flex-col gap-2.5 text-sm border-t border-ivory/15 pt-5">
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
        <Button type="submit" variant="citron" className="w-full mt-7" disabled={isSubmitting}>
          {isSubmitting ? "Placing order…" : `Place order — ${formatINR(totals.total)}`}
        </Button>
        <p className="label opacity-40 mt-4 text-center">Guest checkout · no account needed</p>
      </aside>
    </form>
  );
}
