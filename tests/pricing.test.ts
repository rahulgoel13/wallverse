import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeTotals } from "../src/lib/pricing";

const config = { shippingFlat: 149, freeShippingAbove: 4999, taxRate: 0.18, pricesIncludeTax: true };

describe("computeTotals", () => {
  it("charges flat shipping under the threshold", () => {
    const t = computeTotals([{ price: 2000, quantity: 1 }], null, config);
    assert.equal(t.subtotal, 2000);
    assert.equal(t.shipping, 149);
    assert.equal(t.total, 2149);
    assert.equal(t.freeShippingGap, 2999);
  });

  it("ships free at the threshold", () => {
    const t = computeTotals([{ price: 2500, quantity: 2 }], null, config);
    assert.equal(t.shipping, 0);
    assert.equal(t.total, 5000);
    assert.equal(t.freeShippingGap, 0);
  });

  it("applies a percent coupon that meets its minimum", () => {
    const t = computeTotals([{ price: 4000, quantity: 1 }], { code: "WELCOME10", type: "percent", value: 10, minSubtotal: 2000 }, config);
    assert.equal(t.discount, 400);
    assert.equal(t.shipping, 149); // 3600 after discount — below threshold
    assert.equal(t.total, 3749);
  });

  it("ignores a coupon below its minimum subtotal", () => {
    const t = computeTotals([{ price: 1000, quantity: 1 }], { code: "WELCOME10", type: "percent", value: 10, minSubtotal: 2000 }, config);
    assert.equal(t.discount, 0);
  });

  it("caps a flat coupon at the subtotal", () => {
    const t = computeTotals([{ price: 300, quantity: 1 }], { code: "FLAT500", type: "flat", value: 500, minSubtotal: 0 }, config);
    assert.equal(t.discount, 300);
    assert.equal(t.total, 149); // only shipping remains
  });

  it("reports the GST portion contained in tax-inclusive prices", () => {
    const t = computeTotals([{ price: 1180, quantity: 1 }], null, config);
    assert.equal(t.taxIncluded, 180);
  });

  it("charges nothing for an empty cart", () => {
    const t = computeTotals([], null, config);
    assert.equal(t.total, 0);
    assert.equal(t.shipping, 0);
  });
});
