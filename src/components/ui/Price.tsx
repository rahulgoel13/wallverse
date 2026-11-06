import { formatINR } from "@/lib/format";

export function Price({
  price,
  salePrice,
  unit,
  className = "",
}: {
  price: number;
  salePrice?: number | null;
  unit?: string;
  className?: string;
}) {
  return (
    <span className={`tabular ${className}`}>
      {salePrice != null ? (
        <>
          <span className="font-medium">{formatINR(salePrice)}</span>{" "}
          <s className="opacity-50 text-[0.85em]">{formatINR(price)}</s>
        </>
      ) : (
        <span className="font-medium">{formatINR(price)}</span>
      )}
      {unit ? <span className="opacity-60 text-[0.8em]"> {unit}</span> : null}
    </span>
  );
}
