import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateRolls, ftToCm, type CalculatorProduct } from "../src/lib/calculator";

const roll: CalculatorProduct = {
  rollWidthCm: 53,
  rollLengthM: 10,
  coverageSqm: 5.3,
  patternRepeatCm: 0,
  patternMatch: "Free match",
  price: 4000,
  salePrice: null,
  priceUnit: "per roll",
};

describe("calculateRolls", () => {
  it("computes a simple free-match wall", () => {
    // 300 cm wide, 275 cm tall → drop 285 cm, 3 strips/roll, 6 strips → 2 rolls
    const r = calculateRolls({ unit: "cm", wallWidth: 300, wallHeight: 275, wallCount: 1, doors: 0, windows: 0, product: roll });
    assert.ok(!("error" in r));
    assert.equal(r.stripsPerRoll, 3);
    assert.equal(r.stripsNeeded, 6);
    assert.equal(r.rolls, 2);
    assert.equal(r.estimatedCost, 8000);
    assert.equal(r.totalWallAreaSqm, 8.25);
  });

  it("rounds the drop up to the pattern repeat", () => {
    const patterned = { ...roll, patternRepeatCm: 64, patternMatch: "Offset match" };
    const r = calculateRolls({ unit: "cm", wallWidth: 300, wallHeight: 275, wallCount: 1, doors: 0, windows: 0, product: patterned });
    assert.ok(!("error" in r));
    // 275 + 10 = 285 → next multiple of 64 is 320 → floor(1000/320) = 3 strips/roll
    assert.equal(r.dropCm, 320);
    assert.equal(r.stripsPerRoll, 3);
  });

  it("handles multiple walls and converts feet", () => {
    const r = calculateRolls({ unit: "ftin", wallWidth: 10, wallHeight: 9, wallCount: 2, doors: 0, windows: 0, product: roll });
    assert.ok(!("error" in r));
    // 10ft = 304.8cm per wall → 609.6cm total → 12 strips; 9ft = 274.3 + 10 trim → 3 strips/roll → 4 rolls
    assert.equal(r.stripsNeeded, 12);
    assert.equal(r.rolls, 4);
    assert.equal(Math.round(ftToCm(10)), 305);
  });

  it("credits doors and windows conservatively", () => {
    const r = calculateRolls({ unit: "cm", wallWidth: 600, wallHeight: 275, wallCount: 1, doors: 1, windows: 1, product: roll });
    assert.ok(!("error" in r));
    // 12 strips − floor(0.5 + 0.5) = 11 strips → ceil(11/3) = 4 rolls
    assert.equal(r.stripsNeeded, 11);
    assert.equal(r.rolls, 4);
  });

  it("uses coverage for murals and warns when the wall is taller than the print", () => {
    const mural: CalculatorProduct = { ...roll, rollWidthCm: 280, rollLengthM: 3, coverageSqm: 8.4, patternMatch: "Mural — non-repeating", price: 9800 };
    const r = calculateRolls({ unit: "cm", wallWidth: 400, wallHeight: 320, wallCount: 1, doors: 0, windows: 0, product: mural });
    assert.ok(!("error" in r));
    assert.equal(r.isMural, true);
    // 12.8 m² / 8.4 → 2 sets
    assert.equal(r.rolls, 2);
    assert.equal(r.estimatedCost, 19600);
    assert.ok(r.warnings.length >= 1);
  });

  it("rejects impossible inputs", () => {
    assert.ok("error" in calculateRolls({ unit: "cm", wallWidth: 0, wallHeight: 275, wallCount: 1, doors: 0, windows: 0, product: roll }));
    assert.ok("error" in calculateRolls({ unit: "cm", wallWidth: 300, wallHeight: 700, wallCount: 1, doors: 0, windows: 0, product: roll }));
  });

  it("uses the sale price when present", () => {
    const sale = { ...roll, salePrice: 3000 };
    const r = calculateRolls({ unit: "cm", wallWidth: 300, wallHeight: 275, wallCount: 1, doors: 0, windows: 0, product: sale });
    assert.ok(!("error" in r));
    assert.equal(r.estimatedCost, 6000);
  });
});
