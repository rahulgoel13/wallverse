"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { useActiveWallpaper } from "@/store/active-wallpaper";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { WishlistButton } from "@/components/ui/WishlistButton";
import type { ProductDTO } from "@/types";
import { effectivePrice } from "@/types";

const SAMPLE_PRICE = 199;

export function PurchasePanel({ product }: { product: ProductDTO }) {
  const [quantity, setQuantity] = useState(1);
  const add = useCart((s) => s.add);
  const addCustom = useCart((s) => s.addCustom);
  const show = useToast((s) => s.show);
  const setActive = useActiveWallpaper((s) => s.setProduct);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <Button
          variant="citron"
          disabled={!product.inStock}
          onClick={() => {
            add(product, quantity);
            setActive(product);
            show({
              message: `${quantity} × ${product.name} added to cart`,
              texture: product.texture,
              href: "/cart",
              hrefLabel: "View cart",
            });
          }}
        >
          {product.inStock
            ? `Add to cart — ₹${(effectivePrice(product) * quantity).toLocaleString("en-IN")}`
            : "Out of stock"}
        </Button>
        <WishlistButton slug={product.slug} name={product.name} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="text-current"
          onClick={() => {
            addCustom({
              slug: `sample:${product.slug}`,
              sku: `${product.sku}-S`,
              name: `Sample — ${product.name} (A4)`,
              price: SAMPLE_PRICE,
              priceUnit: "per A4 sample",
              texture: product.texture,
              accent: product.accent,
              collectionName: product.collectionName,
              quantity: 1,
            });
            show({ message: "A4 sample added to cart", texture: product.texture, href: "/cart", hrefLabel: "View cart" });
          }}
        >
          Order an A4 sample — ₹{SAMPLE_PRICE}
        </Button>
        <Button href={`/room-studio?design=${product.slug}`} variant="outline" size="sm" className="text-current">
          Open in Room Studio
        </Button>
      </div>
    </div>
  );
}
