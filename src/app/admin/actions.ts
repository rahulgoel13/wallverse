"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { usesDatabase } from "@/lib/data-source";
import {
  createAdminSession,
  credentialsValid,
  destroyAdminSession,
  isAdmin,
} from "@/lib/admin-auth";
import {
  adminLoginSchema,
  collectionFormSchema,
  couponFormSchema,
  productFormSchema,
} from "@/lib/validation";

async function guard() {
  if (!usesDatabase) throw new Error("The admin needs a database (DATA_SOURCE=database).");
  if (!(await isAdmin())) throw new Error("Not authorized.");
}

type ActionResult = { ok: true } | { ok: false; error: string };

const fail = (error: string): ActionResult => ({ ok: false, error });

function revalidateCatalog() {
  for (const p of ["/", "/shop", "/collections", "/search", "/room-studio", "/calculator"]) {
    revalidatePath(p);
  }
  revalidatePath("/admin", "layout");
}

/* ——— auth ——— */

export async function loginAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!usesDatabase) return fail("The admin needs a database to be enabled.");
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the form.");
  if (!credentialsValid(parsed.data.email, parsed.data.password)) {
    return fail("Wrong email or password.");
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

/* ——— products ——— */

function productDataFromForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return productFormSchema.safeParse({
    ...raw,
    salePrice: raw.salePrice ? raw.salePrice : null,
    inStock: raw.inStock === "on",
    featured: raw.featured === "on",
    newArrival: raw.newArrival === "on",
  });
}

export async function upsertProduct(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const id = String(formData.get("id") ?? "");
  const parsed = productDataFromForm(formData);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(`${issue?.path.join(".")}: ${issue?.message}`);
  }
  const data = {
    ...parsed.data,
    salePrice: parsed.data.salePrice ?? null,
    relatedSlugs: (parsed.data.relatedSlugs ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(","),
  };
  try {
    if (id) {
      await db.product.update({ where: { id }, data });
    } else {
      await db.product.create({ data });
    }
  } catch (e) {
    const msg = e instanceof Error && e.message.includes("Unique") ? "SKU or slug already exists." : "Could not save the product.";
    return fail(msg);
  }
  revalidateCatalog();
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const count = await db.orderItem.count({ where: { productId: id } });
  if (count > 0) {
    // keep order history intact — take it off sale instead
    await db.product.update({ where: { id }, data: { inStock: false, featured: false } });
  } else {
    await db.product.delete({ where: { id } });
  }
  revalidateCatalog();
  revalidatePath("/admin/products");
}

/* ——— collections ——— */

export async function upsertCollection(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const id = String(formData.get("id") ?? "");
  const parsed = collectionFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(`${issue?.path.join(".")}: ${issue?.message}`);
  }
  try {
    if (id) {
      await db.collection.update({ where: { id }, data: parsed.data });
    } else {
      await db.collection.create({ data: { id: `col-${parsed.data.slug}`, ...parsed.data } });
    }
  } catch {
    return fail("Could not save the collection (slug may already exist).");
  }
  revalidateCatalog();
  redirect("/admin/collections");
}

export async function deleteCollection(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const products = await db.product.count({ where: { collectionId: id } });
  if (products > 0) return; // refuse silently; UI explains
  await db.collection.delete({ where: { id } });
  revalidateCatalog();
  revalidatePath("/admin/collections");
}

/* ——— orders ——— */

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function updateOrderStatus(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !ORDER_STATUSES.includes(status)) return;
  await db.order.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

/* ——— enquiries ——— */

export async function updateEnquiryStatus(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["new", "answered", "closed"].includes(status)) return;
  await db.enquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/enquiries");
}

/* ——— coupons ——— */

export async function upsertCoupon(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const raw = Object.fromEntries(formData.entries());
  const parsed = couponFormSchema.safeParse({ ...raw, active: raw.active === "on" });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(`${issue?.path.join(".")}: ${issue?.message}`);
  }
  const { code, ...rest } = parsed.data;
  await db.coupon.upsert({ where: { code }, update: rest, create: { code, ...rest } });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCoupon(formData: FormData): Promise<void> {
  await guard();
  const code = String(formData.get("code") ?? "");
  if (!code) return;
  await db.coupon.delete({ where: { code } }).catch(() => {});
  revalidatePath("/admin/coupons");
}

/* ——— settings ——— */

export async function updateSettings(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const entries: [string, number][] = [
    ["shippingFlat", Number(formData.get("shippingFlat"))],
    ["freeShippingAbove", Number(formData.get("freeShippingAbove"))],
    ["taxRatePct", Number(formData.get("taxRatePct"))],
  ];
  for (const [key, value] of entries) {
    if (!Number.isFinite(value) || value < 0 || value > 1000000) {
      return fail(`${key}: enter a valid non-negative number.`);
    }
    await db.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/admin/settings");
  return { ok: true };
}
