const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrPrecise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a value in INR (whole rupees). */
export function formatINR(value: number): string {
  return inr.format(value);
}

/** Format a value in INR keeping paise. */
export function formatINRPrecise(value: number): string {
  return inrPrecise.format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Two-digit index label — "01", "02"… used across editorial annotations. */
export function indexLabel(i: number): string {
  return String(i + 1).padStart(2, "0");
}
