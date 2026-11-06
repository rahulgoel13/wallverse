"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/hooks/useHydrated";
import { ProductCard } from "@/components/products/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { ProductDTO } from "@/types";

export function WishlistClient() {
  const slugs = useWishlist((s) => s.slugs);
  const [products, setProducts] = useState<ProductDTO[] | null>(null);
  const [failed, setFailed] = useState(false);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    if (slugs.length === 0) {
      // async so the store's persisted slugs (restored post-hydration) win the race
      queueMicrotask(() => {
        if (!cancelled) setProducts([]);
      });
      return () => {
        cancelled = true;
      };
    }
    fetch(`/api/products?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((data: { products: ProductDTO[] }) => {
        if (!cancelled) setProducts(data.products);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slugs, hydrated]);

  if (!hydrated || (products === null && !failed)) {
    return (
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4" aria-busy="true" aria-label="Loading wishlist">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-obsidian animate-pulse" />
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <EmptyState
        label="Something went wrong"
        message="Your wishlist could not be loaded. Try refreshing the page."
      />
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        label="Empty for now"
        message="Nothing saved yet. Tap the heart on any design to keep it here."
        action={
          <Button href="/shop" variant="citron">
            Browse designs
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.slug} product={p} index={i} />
      ))}
    </div>
  );
}
