"use client";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label = "Quantity",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <div
      className="inline-flex items-center border border-current/25"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="px-4 py-2.5 hover:bg-current/10 disabled:opacity-30 cursor-pointer disabled:cursor-default"
      >
        −
      </button>
      <span className="tabular w-10 text-center text-sm" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="px-4 py-2.5 hover:bg-current/10 disabled:opacity-30 cursor-pointer disabled:cursor-default"
      >
        +
      </button>
    </div>
  );
}
