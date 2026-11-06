import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkoutSchema, createOrderSchema, cartItemSchema } from "../src/lib/validation";

const validCustomer = {
  name: "Asha Rao",
  email: "asha@example.com",
  phone: "9876543210",
  addressLine: "14 Lodhi Estate, Block C",
  city: "New Delhi",
  state: "Delhi",
  pincode: "110003",
  notes: "",
  paymentMethod: "demo" as const,
};

describe("checkout validation", () => {
  it("accepts a valid customer", () => {
    assert.ok(checkoutSchema.safeParse(validCustomer).success);
  });

  it("rejects bad phone numbers and PIN codes", () => {
    assert.equal(checkoutSchema.safeParse({ ...validCustomer, phone: "12345" }).success, false);
    assert.equal(checkoutSchema.safeParse({ ...validCustomer, phone: "1876543210" }).success, false);
    assert.equal(checkoutSchema.safeParse({ ...validCustomer, pincode: "1100" }).success, false);
  });

  it("rejects an empty cart at order creation", () => {
    const r = createOrderSchema.safeParse({ customer: validCustomer, items: [], couponCode: "" });
    assert.equal(r.success, false);
  });

  it("accepts catalogue and sample cart items, rejects junk slugs", () => {
    assert.ok(cartItemSchema.safeParse({ slug: "midnight-garden", quantity: 2 }).success);
    assert.ok(cartItemSchema.safeParse({ slug: "sample:midnight-garden", quantity: 1 }).success);
    assert.equal(cartItemSchema.safeParse({ slug: "DROP TABLE;", quantity: 1 }).success, false);
    assert.equal(cartItemSchema.safeParse({ slug: "x", quantity: 0 }).success, false);
  });

  it("uppercases coupon codes", () => {
    const r = createOrderSchema.safeParse({
      customer: validCustomer,
      items: [{ slug: "midnight-garden", quantity: 1 }],
      couponCode: "welcome10",
    });
    assert.ok(r.success && r.data.couponCode === "WELCOME10");
  });
});
