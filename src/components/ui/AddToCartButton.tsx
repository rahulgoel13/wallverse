"use client";

import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { Button } from "@/components/ui/Button";
import type { ProductDTO } from "@/types";

export function AddToCartButton({
  product,
  quantity = 1,
  variant = "citron",
  size = "md",
  className = "",
  label = "Add to cart",
}: {
  product: ProductDTO;
  quantity?: number;
  variant?: "citron" | "ivory" | "ink" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  const add = useCart((s) => s.add);
  const show = useToast((s) => s.show);

  if (!product.inStock) {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        Out of stock
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        add(product, quantity);
        show({
          message: `${product.name} added to cart`,
          texture: product.texture,
          href: "/cart",
          hrefLabel: "View cart",
        });
      }}
    >
      {label}
    </Button>
  );
}
