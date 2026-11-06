"use server";

import { randomBytes, createHmac } from "node:crypto";
import { db } from "@/lib/db";
import { usesDatabase } from "@/lib/data-source";
import { getProductsBySlugs } from "@/lib/catalog";
import { coupons } from "@/data/coupons";
import { computeTotals, type CouponInfo } from "@/lib/pricing";
import { getCommerceConfig } from "@/lib/settings";
import { paymentMode, site } from "@/lib/site";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validation";
import { effectivePrice, type OrderView } from "@/types";

function orderId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let s = "";
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `WV-${s}`;
}

export interface CouponCheck {
  ok: boolean;
  message: string;
  coupon?: CouponInfo;
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponCheck> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { ok: false, message: "Enter a coupon code." };
  const coupon = usesDatabase
    ? await db.coupon.findUnique({ where: { code: trimmed } })
    : (() => {
        const c = coupons.find((x) => x.code === trimmed);
        return c ? { ...c, expiresAt: null as Date | null } : null;
      })();
  if (!coupon || !coupon.active) return { ok: false, message: "This coupon code is not valid." };
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return { ok: false, message: "This coupon has expired." };
  if (subtotal < coupon.minSubtotal)
    return {
      ok: false,
      message: `This coupon needs a subtotal of at least ₹${coupon.minSubtotal.toLocaleString("en-IN")}.`,
    };
  return {
    ok: true,
    message:
      coupon.type === "percent" ? `${coupon.value}% off applied.` : `₹${coupon.value} off applied.`,
    coupon: {
      code: coupon.code,
      type: coupon.type as "percent" | "flat",
      value: coupon.value,
      minSubtotal: coupon.minSubtotal,
    },
  };
}

export type CreateOrderResult =
  /** `order` is present in static mode: the browser keeps it, since nothing stores it server-side. */
  | { ok: true; orderId: string; payment: "demo" | "cod"; order?: OrderView }
  | {
      ok: true;
      orderId: string;
      payment: "razorpay";
      razorpay: { keyId: string; razorpayOrderId: string; amount: number; currency: string; name: string };
    }
  | { ok: false; error: string };

export async function createOrder(raw: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid order details." };
  }
  const input = parsed.data;

  // Recompute everything server-side from the catalogue — never trust client prices.
  const SAMPLE_PRICE = 199;
  const baseSlug = (slug: string) => (slug.startsWith("sample:") ? slug.slice(7) : slug);
  const slugs = [...new Set(input.items.map((i) => baseSlug(i.slug)))];
  const products = await getProductsBySlugs(slugs);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  for (const item of input.items) {
    const isSample = item.slug.startsWith("sample:");
    const p = bySlug.get(baseSlug(item.slug));
    if (!p) return { ok: false, error: `A product in your cart is no longer available (${item.slug}).` };
    if (!p.inStock && !isSample) return { ok: false, error: `${p.name} is currently out of stock.` };
  }

  const lines = input.items.map((item) => {
    const isSample = item.slug.startsWith("sample:");
    const p = bySlug.get(baseSlug(item.slug))!;
    const unitPrice = isSample ? SAMPLE_PRICE : effectivePrice(p);
    const name = isSample ? `Sample — ${p.name} (A4)` : p.name;
    return { product: p, name, quantity: item.quantity, unitPrice, total: unitPrice * item.quantity };
  });

  let coupon: CouponInfo | null = null;
  const subtotalPre = lines.reduce((s, l) => s + l.total, 0);
  if (input.couponCode) {
    const check = await validateCoupon(input.couponCode, subtotalPre);
    if (!check.ok) return { ok: false, error: check.message };
    coupon = check.coupon ?? null;
  }

  const totals = computeTotals(
    lines.map((l) => ({ price: l.unitPrice, quantity: l.quantity })),
    coupon,
    await getCommerceConfig()
  );

  const mode = paymentMode();
  const requested = input.customer.paymentMethod;

  // Without a database nothing can receive or keep an order, so only the
  // clearly-labelled demo is honest: no cash-on-delivery promise, no payment.
  if (!usesDatabase) {
    if (requested !== "demo") {
      return { ok: false, error: "This store is in demo mode: only demo orders can be placed." };
    }
    const order: OrderView = {
      id: orderId(),
      status: "demo",
      paymentMethod: "demo",
      paymentStatus: "demo_paid",
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      tax: totals.taxIncluded,
      total: totals.total,
      couponCode: coupon?.code ?? null,
      notes: input.customer.notes || null,
      addressLine: input.customer.addressLine,
      city: input.customer.city,
      state: input.customer.state,
      pincode: input.customer.pincode,
      country: site.country,
      createdAt: new Date().toISOString(),
      customer: { name: input.customer.name, email: input.customer.email, phone: input.customer.phone },
      items: lines.map((l) => ({
        name: l.name,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        total: l.total,
        slug: l.product.slug,
        texture: l.product.texture,
      })),
      storedLocally: true,
    };
    return { ok: true, orderId: order.id, payment: "demo", order };
  }

  // Razorpay can only be used when configured; fall back is an explicit error, never a fake success.
  if (requested === "razorpay" && mode !== "razorpay") {
    return { ok: false, error: "Online payment is not configured on this installation. Choose demo mode or cash on delivery." };
  }

  const id = orderId();
  const customer = await db.customer.create({
    data: { name: input.customer.name, email: input.customer.email, phone: input.customer.phone },
  });

  const paymentStatus = requested === "demo" ? "demo_paid" : "pending";
  const status = requested === "razorpay" ? "pending" : "confirmed";

  await db.order.create({
    data: {
      id,
      status,
      paymentMethod: requested,
      paymentStatus,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      tax: totals.taxIncluded,
      total: totals.total,
      couponCode: coupon?.code ?? null,
      notes: input.customer.notes || null,
      addressLine: input.customer.addressLine,
      city: input.customer.city,
      state: input.customer.state,
      pincode: input.customer.pincode,
      customerId: customer.id,
      items: {
        create: lines.map((l) => ({
          name: l.name,
          unitPrice: l.unitPrice,
          quantity: l.quantity,
          total: l.total,
          productId: l.product.id,
        })),
      },
    },
  });

  if (requested === "razorpay") {
    try {
      const keyId = process.env.RAZORPAY_KEY_ID!;
      const keySecret = process.env.RAZORPAY_KEY_SECRET!;
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: totals.total * 100, currency: "INR", receipt: id }),
      });
      if (!res.ok) throw new Error(`Razorpay order failed (${res.status})`);
      const rp = (await res.json()) as { id: string; amount: number; currency: string };
      await db.order.update({ where: { id }, data: { notes: appendNote(input.customer.notes, `rzp_order:${rp.id}`) } });
      return {
        ok: true,
        orderId: id,
        payment: "razorpay",
        razorpay: { keyId, razorpayOrderId: rp.id, amount: rp.amount, currency: rp.currency, name: "WALLVERSE" },
      };
    } catch {
      await db.order.update({ where: { id }, data: { status: "cancelled", paymentStatus: "failed" } });
      return { ok: false, error: "Could not start the online payment. Try demo mode or cash on delivery." };
    }
  }

  return { ok: true, orderId: id, payment: requested as "demo" | "cod" };
}

function appendNote(existing: string | undefined | null, extra: string) {
  return existing ? `${existing}\n${extra}` : extra;
}

export async function verifyRazorpayPayment(params: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!usesDatabase) return { ok: false, error: "Online payment needs a database to record orders." };
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return { ok: false, error: "Payments are not configured." };
  const expected = createHmac("sha256", keySecret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");
  if (expected !== params.razorpaySignature) {
    await db.order.update({
      where: { id: params.orderId },
      data: { paymentStatus: "failed" },
    });
    return { ok: false, error: "Payment signature verification failed." };
  }
  await db.order.update({
    where: { id: params.orderId },
    data: { paymentStatus: "paid", status: "confirmed" },
  });
  return { ok: true };
}

export async function getOrder(id: string): Promise<OrderView | null> {
  if (!usesDatabase) return null;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { slug: true, texture: true, accent: true } } } }, customer: true },
  });
  if (!order) return null;
  return {
    id: order.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    couponCode: order.couponCode,
    notes: order.notes,
    addressLine: order.addressLine,
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    country: order.country,
    createdAt: order.createdAt.toISOString(),
    customer: { name: order.customer.name, email: order.customer.email, phone: order.customer.phone },
    items: order.items.map((i) => ({
      name: i.name,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      total: i.total,
      slug: i.product.slug,
      texture: i.product.texture,
    })),
  };
}
