import Link from "next/link";
import type { ProductDTO } from "@/types";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Price } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
import { WishlistButton } from "@/components/ui/WishlistButton";

export function ProductCard({
  product,
  priority = false,
  index,
}: {
  product: ProductDTO;
  priority?: boolean;
  index?: number;
}) {
  void priority;
  return (
    <article className="group relative flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block overflow-hidden"
        aria-label={`${product.name} — view product`}
      >
        <TexturePreview
          texture={product.texture}
          alt={`${product.name} wallpaper pattern`}
          tileSize={200}
          className="aspect-[4/5] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {(product.newArrival || product.salePrice != null || !product.inStock) && (
          <div className="absolute left-3 top-3 flex gap-2">
            {!product.inStock ? (
              <Badge tone="error">Out of stock</Badge>
            ) : product.salePrice != null ? (
              <Badge tone="citron">On sale</Badge>
            ) : (
              <Badge tone="champagne">New</Badge>
            )}
          </div>
        )}
        {index != null ? (
          <span className="label absolute right-3 bottom-3 opacity-0 group-hover:opacity-70 transition-opacity text-ivory">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="label opacity-50 mb-1">{product.collectionName}</p>
          <h3 className="font-serif text-lg leading-tight">
            <Link href={`/product/${product.slug}`} className="hover:underline underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm opacity-70">
            <Price price={product.price} salePrice={product.salePrice} unit={product.priceUnit} />
          </p>
        </div>
        <WishlistButton slug={product.slug} name={product.name} className="shrink-0 scale-90" />
      </div>
    </article>
  );
}
