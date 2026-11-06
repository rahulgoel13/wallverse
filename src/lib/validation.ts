import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number"),
  addressLine: z.string().min(8, "Enter your street address"),
  city: z.string().min(2, "Enter your city"),
  state: z.string().min(2, "Select your state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit PIN code"),
  notes: z.string().max(500, "Keep notes under 500 characters").optional().or(z.literal("")),
  paymentMethod: z.enum(["demo", "razorpay", "cod"]),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartItemSchema = z.object({
  slug: z.string().regex(/^(sample:)?[a-z0-9-]+$/),
  quantity: z.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  customer: checkoutSchema,
  items: z.array(cartItemSchema).min(1, "Your cart is empty"),
  couponCode: z.string().trim().toUpperCase().optional().or(z.literal("")),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(3, "Add a short subject"),
  message: z.string().min(12, "Tell us a little more (at least 12 characters)"),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email("Enter the admin email"),
  password: z.string().min(1, "Enter the admin password"),
});

export const productFormSchema = z.object({
  sku: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().int().min(1),
  salePrice: z.coerce.number().int().min(1).optional().nullable(),
  material: z.string().min(2),
  finish: z.string().min(2),
  colorFamily: z.string().min(2),
  style: z.string().min(2),
  rollWidthCm: z.coerce.number().positive(),
  rollLengthM: z.coerce.number().positive(),
  coverageSqm: z.coerce.number().positive(),
  patternRepeatCm: z.coerce.number().min(0),
  patternMatch: z.string().min(2),
  priceUnit: z.string().min(2),
  texture: z.string().min(1),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Hex colour like #b99a6a"),
  inStock: z.coerce.boolean(),
  featured: z.coerce.boolean(),
  newArrival: z.coerce.boolean(),
  popularity: z.coerce.number().int().min(0).max(100),
  installationNotes: z.string().min(2),
  relatedSlugs: z.string().optional().or(z.literal("")),
  collectionId: z.string().min(1),
});
export type ProductFormInput = z.infer<typeof productFormSchema>;

export const collectionFormSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  name: z.string().min(2),
  description: z.string().min(10),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Hex colour like #b99a6a"),
  order: z.coerce.number().int().min(0),
});

export const couponFormSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  type: z.enum(["percent", "flat"]),
  value: z.coerce.number().int().min(1),
  minSubtotal: z.coerce.number().int().min(0),
  active: z.coerce.boolean(),
});
