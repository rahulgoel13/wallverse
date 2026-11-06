/**
 * Wallpaper roll quantity calculator.
 *
 * Method (industry-standard strip counting, stated so customers can verify):
 * 1. Each strip ("drop") must be the wall height plus a 10 cm trim allowance.
 * 2. For patterns with a repeat, the drop is rounded UP to the next full repeat
 *    so strips can be aligned.
 * 3. A roll yields floor(roll length / drop) strips.
 * 4. The wall run needs ceil(total width / roll width) strips.
 * 5. Standard doors (≈0.9 m wide) and windows (≈1.2 m wide) each credit back
 *    half a strip — a conservative deduction, since partial strips above and
 *    below openings still consume material.
 * 6. Murals (non-repeating panel sets) are calculated by coverage area instead.
 *
 * Real installations vary with wall condition and pattern placement, so the
 * result is an estimate, not a quotation.
 */

export interface CalculatorProduct {
  rollWidthCm: number;
  rollLengthM: number;
  coverageSqm: number;
  patternRepeatCm: number;
  patternMatch: string;
  price: number;
  salePrice: number | null;
  priceUnit: string;
}

export interface CalculatorInput {
  unit: "cm" | "ftin";
  wallWidth: number; // cm, or feet when unit is ftin
  wallHeight: number;
  wallCount: number;
  doors: number;
  windows: number;
  product: CalculatorProduct;
}

export interface CalculatorResult {
  totalWallAreaSqm: number;
  dropCm: number;
  stripsPerRoll: number;
  stripsNeeded: number;
  rolls: number;
  coveragePerRollSqm: number;
  estimatedCost: number;
  isMural: boolean;
  assumptions: string[];
  warnings: string[];
}

const TRIM_CM = 10;
const DOOR_CREDIT_STRIPS = 0.5;
const WINDOW_CREDIT_STRIPS = 0.5;

export const ftToCm = (ft: number) => ft * 30.48;

export function calculateRolls(input: CalculatorInput): CalculatorResult | { error: string } {
  const { product } = input;
  const widthCm = input.unit === "ftin" ? ftToCm(input.wallWidth) : input.wallWidth;
  const heightCm = input.unit === "ftin" ? ftToCm(input.wallHeight) : input.wallHeight;

  if (!(widthCm > 0) || !(heightCm > 0) || !(input.wallCount >= 1)) {
    return { error: "Enter a wall width, height and at least one wall." };
  }
  if (heightCm > 600) {
    return { error: "Wall height above 6 m — contact us for a project quotation." };
  }

  const totalWidthCm = widthCm * input.wallCount;
  const totalWallAreaSqm = (totalWidthCm * heightCm) / 10000;

  const assumptions: string[] = [
    `${TRIM_CM} cm trim allowance added to every strip.`,
  ];
  const warnings: string[] = [];

  const isMural = product.patternMatch.toLowerCase().includes("mural");

  if (isMural) {
    const sets = Math.max(1, Math.ceil(totalWallAreaSqm / product.coverageSqm));
    const price = product.salePrice ?? product.price;
    assumptions.push(
      `Mural sets are sized by coverage: each set covers about ${product.coverageSqm} m².`
    );
    if (heightCm > product.rollLengthM * 100) {
      warnings.push(
        `This mural prints ${product.rollLengthM} m tall — your wall is taller, so the design will not reach the full height.`
      );
    }
    return {
      totalWallAreaSqm: round2(totalWallAreaSqm),
      dropCm: Math.round(heightCm + TRIM_CM),
      stripsPerRoll: 1,
      stripsNeeded: sets,
      rolls: sets,
      coveragePerRollSqm: product.coverageSqm,
      estimatedCost: sets * price,
      isMural: true,
      assumptions,
      warnings,
    };
  }

  let dropCm = heightCm + TRIM_CM;
  if (product.patternRepeatCm > 0) {
    dropCm = Math.ceil(dropCm / product.patternRepeatCm) * product.patternRepeatCm;
    assumptions.push(
      `Drop rounded up to the ${product.patternRepeatCm} cm pattern repeat for alignment (${product.patternMatch}).`
    );
  }

  const rollLengthCm = product.rollLengthM * 100;
  const stripsPerRoll = Math.floor(rollLengthCm / dropCm);
  if (stripsPerRoll < 1) {
    return {
      error: `Each strip would need ${(dropCm / 100).toFixed(2)} m but a roll is only ${product.rollLengthM} m long. Contact us about this wall.`,
    };
  }

  let stripsNeeded = Math.ceil(totalWidthCm / product.rollWidthCm);
  const credit = Math.floor(
    input.doors * DOOR_CREDIT_STRIPS + input.windows * WINDOW_CREDIT_STRIPS
  );
  if (credit > 0) {
    stripsNeeded = Math.max(1, stripsNeeded - credit);
    assumptions.push(
      `Doors and windows credited conservatively at half a strip each (${credit} strip${credit > 1 ? "s" : ""} deducted).`
    );
  }

  const rolls = Math.ceil(stripsNeeded / stripsPerRoll);
  const price = product.salePrice ?? product.price;

  if (product.patternRepeatCm >= 50) {
    warnings.push(
      "Large pattern repeat: complex walls or offset layouts can require an extra roll. Order a sample first."
    );
  }
  if (stripsNeeded % stripsPerRoll === 0) {
    warnings.push(
      "This estimate lands exactly on full rolls with no spare strip. Consider one extra roll as insurance against trimming errors."
    );
  }

  return {
    totalWallAreaSqm: round2(totalWallAreaSqm),
    dropCm: Math.round(dropCm),
    stripsPerRoll,
    stripsNeeded,
    rolls,
    coveragePerRollSqm: round2((product.rollWidthCm / 100) * product.rollLengthM),
    estimatedCost: rolls * price,
    isMural: false,
    assumptions,
    warnings,
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
