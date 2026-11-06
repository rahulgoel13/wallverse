"use client";

import { useMemo, useState } from "react";
import { calculateRolls, type CalculatorResult } from "@/lib/calculator";
import { formatINR } from "@/lib/format";
import { SelectField, TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import type { ProductDTO } from "@/types";

/**
 * The wallpaper quantity calculator. Works standalone (/calculator) with a
 * product picker, or compact on a product page with the product fixed.
 */
export function CalculatorWidget({
  product,
  products,
  compact = false,
}: {
  product?: ProductDTO;
  products?: ProductDTO[];
  compact?: boolean;
}) {
  const [unit, setUnit] = useState<"cm" | "ftin">("ftin");
  const [width, setWidth] = useState(unit === "ftin" ? "10" : "300");
  const [height, setHeight] = useState(unit === "ftin" ? "9" : "275");
  const [walls, setWalls] = useState("1");
  const [doors, setDoors] = useState("0");
  const [windows, setWindows] = useState("0");
  const [selectedSlug, setSelectedSlug] = useState(product?.slug ?? products?.[0]?.slug ?? "");

  const selected = product ?? products?.find((p) => p.slug === selectedSlug) ?? null;
  const add = useCart((s) => s.add);
  const show = useToast((s) => s.show);

  const result = useMemo(() => {
    if (!selected) return null;
    return calculateRolls({
      unit,
      wallWidth: Number(width) || 0,
      wallHeight: Number(height) || 0,
      wallCount: Math.max(1, Number(walls) || 1),
      doors: Math.max(0, Number(doors) || 0),
      windows: Math.max(0, Number(windows) || 0),
      product: selected,
    });
  }, [selected, unit, width, height, walls, doors, windows]);

  const ok = result && !("error" in result) ? (result as CalculatorResult) : null;
  const error = result && "error" in result ? result.error : null;

  const switchUnit = (next: "cm" | "ftin") => {
    if (next === unit) return;
    setUnit(next);
    // convert the current entries so the numbers stay meaningful
    const factor = next === "cm" ? 30.48 : 1 / 30.48;
    setWidth((v) => (Number(v) ? String(Math.round(Number(v) * factor * 10) / 10) : v));
    setHeight((v) => (Number(v) ? String(Math.round(Number(v) * factor * 10) / 10) : v));
  };

  return (
    <div className={`border border-current/15 ${compact ? "p-5" : "p-6 md:p-8"}`}>
      <div className="flex flex-col gap-5">
        {!product && products ? (
          <SelectField label="Wallpaper design" value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)}>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} — {formatINR(p.salePrice ?? p.price)} {p.priceUnit}
              </option>
            ))}
          </SelectField>
        ) : null}

        <div className="flex items-center gap-2">
          <span className="label opacity-60 mr-2">Units</span>
          {(["ftin", "cm"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => switchUnit(u)}
              aria-pressed={unit === u}
              className={`label border px-3 py-1.5 cursor-pointer transition-colors ${
                unit === u ? "border-citron text-citron" : "border-current/25 opacity-70 hover:opacity-100"
              }`}
            >
              {u === "ftin" ? "Feet" : "Centimetres"}
            </button>
          ))}
        </div>

        <div className={`grid gap-4 ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-5"}`}>
          <TextField
            label={`Wall width (${unit === "ftin" ? "ft" : "cm"})`}
            type="number"
            min={0}
            inputMode="decimal"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
          <TextField
            label={`Wall height (${unit === "ftin" ? "ft" : "cm"})`}
            type="number"
            min={0}
            inputMode="decimal"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <TextField label="Walls" type="number" min={1} max={8} inputMode="numeric" value={walls} onChange={(e) => setWalls(e.target.value)} />
          <TextField label="Doors" type="number" min={0} max={6} inputMode="numeric" value={doors} onChange={(e) => setDoors(e.target.value)} hint="Optional deduction" />
          <TextField label="Windows" type="number" min={0} max={8} inputMode="numeric" value={windows} onChange={(e) => setWindows(e.target.value)} hint="Optional deduction" />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : ok && selected ? (
          <div className="border-t border-current/15 pt-5">
            <div className={`grid gap-4 ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
              <div>
                <p className="label opacity-50">Wall area</p>
                <p className="tabular text-xl mt-1">{ok.totalWallAreaSqm} m²</p>
              </div>
              <div>
                <p className="label opacity-50">{ok.isMural ? "Panel sets" : "Strips needed"}</p>
                <p className="tabular text-xl mt-1">
                  {ok.stripsNeeded}
                  {!ok.isMural ? <span className="text-sm opacity-50"> ({ok.stripsPerRoll}/roll)</span> : null}
                </p>
              </div>
              <div>
                <p className="label opacity-50">{ok.isMural ? "Sets required" : "Rolls required"}</p>
                <p className="tabular text-2xl mt-1 text-citron">{ok.rolls}</p>
              </div>
              <div>
                <p className="label opacity-50">Estimated cost</p>
                <p className="tabular text-xl mt-1">{formatINR(ok.estimatedCost)}</p>
              </div>
            </div>
            {ok.warnings.map((w) => (
              <p key={w} className="mt-3 text-xs text-champagne">
                ⚠ {w}
              </p>
            ))}
            <details className="mt-4">
              <summary className="label opacity-60 cursor-pointer">How this was calculated</summary>
              <ul className="mt-2 flex flex-col gap-1.5 text-xs opacity-70 list-disc pl-4">
                <li>Each strip = wall height + trim, rounded up to the pattern repeat where one exists.</li>
                {ok.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
                <li>This is an estimate, not a quotation — wall condition and layout can change the final count.</li>
              </ul>
            </details>
            <div className="mt-5">
              <Button
                variant="citron"
                size="sm"
                disabled={!selected.inStock}
                onClick={() => {
                  add(selected, ok.rolls);
                  show({
                    message: `${ok.rolls} × ${selected.name} added to cart`,
                    texture: selected.texture,
                    href: "/cart",
                    hrefLabel: "View cart",
                  });
                }}
              >
                {selected.inStock
                  ? `Add ${ok.rolls} ${ok.isMural ? "set" : "roll"}${ok.rolls > 1 ? "s" : ""} to cart`
                  : "Out of stock"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm opacity-50">Enter your wall measurements to see the estimate.</p>
        )}
      </div>
    </div>
  );
}
