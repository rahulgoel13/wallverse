"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { RoomIllustration } from "@/components/home/RoomIllustration";
import { Price } from "@/components/ui/Price";
import { indexLabel } from "@/lib/format";
import type { ProductDTO } from "@/types";

function BeforeAfter({ product }: { product: ProductDTO }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(96, Math.max(4, pct)));
  }, []);

  return (
    <figure>
      <div
        ref={containerRef}
        className="relative aspect-[3/2] select-none overflow-hidden border border-current/15 touch-pan-y"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && updateFromClientX(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* BEFORE — the bare room */}
        <RoomIllustration
          mode="plain"
          wallPaint="#d8d2c4"
          className="absolute inset-0 h-full w-full"
          title="The room before wallpaper"
        />
        {/* AFTER — identical geometry, papered (revealed right of the divider) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
          aria-hidden
        >
          <RoomIllustration
            texture={product.texture}
            className="absolute inset-0 h-full w-full"
            title=""
          />
        </div>
        {/* divider */}
        <div
          className="absolute top-0 bottom-0 w-px bg-citron pointer-events-none"
          style={{ left: `${pos}%` }}
          aria-hidden
        >
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-citron text-ink text-xs font-semibold shadow-lg">
            ⇄
          </span>
        </div>
        <span className="label absolute left-3 top-3 bg-ink/60 text-ivory px-2 py-1 pointer-events-none">Before</span>
        <span className="label absolute right-3 top-3 bg-ink/60 text-ivory px-2 py-1 pointer-events-none">After</span>
      </div>
      {/* accessible control */}
      <label className="label mt-3 flex items-center gap-3 opacity-60">
        <span className="whitespace-nowrap">Reveal</span>
        <input
          type="range"
          min={4}
          max={96}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          className="w-full accent-citron"
          aria-label={`Reveal ${product.name} transformation`}
        />
      </label>
      <figcaption className="mt-4 flex items-baseline justify-between gap-4">
        <div>
          <p className="font-serif text-xl">
            <Link href={`/product/${product.slug}`} className="hover:underline underline-offset-4">
              {product.name}
            </Link>
          </p>
          <p className="label opacity-50 mt-1">{product.collectionName}</p>
        </div>
        <p className="text-sm opacity-80">
          <Price price={product.price} salePrice={product.salePrice} unit={product.priceUnit} />
        </p>
      </figcaption>
    </figure>
  );
}

/** Chapter 05 — bare rooms become designed interiors; drag to compare. */
export function TransformationGallery({ products }: { products: ProductDTO[] }) {
  return (
    <section className="section-light py-24 md:py-36 on-light" aria-label="Transformation gallery">
      <div className="container-wv">
        <p className="label opacity-60 mb-4">Chapter 05 — The Transformation Gallery</p>
        <h2 className="display text-4xl md:text-6xl max-w-3xl">
          Same room. Different universe.
        </h2>
        <p className="mt-5 max-w-xl text-sm opacity-70 leading-relaxed">
          Drag the divider. The architecture never changes — only the wall does.
        </p>
        <div className="mt-14 grid gap-12 lg:grid-cols-3 md:grid-cols-2">
          {products.slice(0, 3).map((p, i) => (
            <div key={p.slug}>
              <p className="label opacity-40 mb-3">{indexLabel(i)}</p>
              <BeforeAfter product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
