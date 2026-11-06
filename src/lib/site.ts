/**
 * Centralized brand + business configuration.
 * Swap the working brand here when the final identity is decided.
 */
export const site = {
  name: "WALLVERSE",
  tagline: "Walls are no longer just walls.",
  description:
    "An immersive wallpaper discovery and shopping destination. Explore premium wall designs in surreal architectural environments, visualize them in realistic rooms, and purchase the designs you love.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "studio@wallverse.example",
  phone: "+91 00000 00000",
  address: "Studio WALLVERSE, New Delhi, India",
  currency: "INR" as const,
  locale: "en-IN" as const,
  country: "India",
} as const;

export const commerce = {
  /** Flat shipping below the free-shipping threshold, in INR. */
  shippingFlat: 149,
  /** Orders at or above this subtotal ship free, in INR. */
  freeShippingAbove: 4999,
  /** GST-style tax rate applied at checkout (demo configuration). */
  taxRate: 0.18,
  /** Whether prices in the catalogue already include tax. */
  pricesIncludeTax: true,
  /** Installation wastage factor used by the roll calculator. */
  wastageFactor: 0.1,
} as const;

export const paymentMode = () =>
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? ("razorpay" as const)
    : ("demo" as const);
