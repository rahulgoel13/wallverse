"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { SelectField, TextField } from "@/components/ui/Field";
import type { CollectionDTO } from "@/types";

export interface FilterOptions {
  colors: string[];
  styles: string[];
  materials: string[];
  minPrice: number;
  maxPrice: number;
}

/** URL-driven controls: every filter is a query param, so results are shareable. */
export function ShopControls({
  collections,
  options,
  lockedCollection,
}: {
  collections: CollectionDTO[];
  options: FilterOptions;
  lockedCollection?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync when the URL changes externally (render-time adjustment).
  const paramQ = params.get("q") ?? "";
  const [lastParamQ, setLastParamQ] = useState(paramQ);
  if (lastParamQ !== paramQ) {
    setLastParamQ(paramQ);
    setQ(paramQ);
  }

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  const onSearch = (value: string) => {
    setQ(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setParam("q", value), 350);
  };

  const hasFilters = ["q", "collection", "color", "style", "material", "maxPrice", "sort"].some((k) =>
    params.get(k)
  );

  return (
    <div className="flex flex-col gap-5">
      <TextField
        label="Search the archive"
        placeholder="Name, colour, style…"
        value={q}
        onChange={(e) => onSearch(e.target.value)}
        type="search"
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
        {!lockedCollection ? (
          <SelectField
            label="Collection"
            value={params.get("collection") ?? ""}
            onChange={(e) => setParam("collection", e.target.value)}
          >
            <option value="">All collections</option>
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </SelectField>
        ) : null}
        <SelectField
          label="Colour"
          value={params.get("color") ?? ""}
          onChange={(e) => setParam("color", e.target.value)}
        >
          <option value="">All colours</option>
          {options.colors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Style"
          value={params.get("style") ?? ""}
          onChange={(e) => setParam("style", e.target.value)}
        >
          <option value="">All styles</option>
          {options.styles.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Material"
          value={params.get("material") ?? ""}
          onChange={(e) => setParam("material", e.target.value)}
        >
          <option value="">All materials</option>
          {options.materials.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Price"
          value={params.get("maxPrice") ?? ""}
          onChange={(e) => setParam("maxPrice", e.target.value)}
        >
          <option value="">Any price</option>
          <option value="3500">Under ₹3,500</option>
          <option value="5000">Under ₹5,000</option>
          <option value="7000">Under ₹7,000</option>
        </SelectField>
        <SelectField
          label="Sort by"
          value={params.get("sort") ?? "recommended"}
          onChange={(e) => setParam("sort", e.target.value === "recommended" ? "" : e.target.value)}
        >
          <option value="recommended">Recommended</option>
          <option value="newest">Newest</option>
          <option value="popular">Most popular</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </SelectField>
      </div>
      {hasFilters ? (
        <button
          type="button"
          onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
          className="label self-start opacity-60 hover:opacity-100 cursor-pointer"
        >
          ✕ Clear all filters
        </button>
      ) : null}
    </div>
  );
}
