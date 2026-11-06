"use client";

import { useWishlist } from "@/store/wishlist";
import { useToast } from "@/store/toast";
import { useHydrated } from "@/hooks/useHydrated";

export function WishlistButton({
  slug,
  name,
  className = "",
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const { slugs, toggle } = useWishlist();
  const show = useToast((s) => s.show);
  // Avoid hydration mismatch: persisted store reads localStorage on the client only.
  const hydrated = useHydrated();
  const active = hydrated && slugs.includes(slug);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      onClick={() => {
        toggle(slug);
        show({ message: active ? `${name} removed from wishlist` : `${name} saved to wishlist`, href: "/wishlist", hrefLabel: "View wishlist" });
      }}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-current/25 hover:border-current transition-colors cursor-pointer ${className}`}
    >
      <svg width="16" height="15" viewBox="0 0 16 15" aria-hidden="true">
        <path
          d="M8 14S1 9.6 1 4.9C1 2.6 2.8 1 4.9 1 6.2 1 7.4 1.7 8 2.8 8.6 1.7 9.8 1 11.1 1 13.2 1 15 2.6 15 4.9 15 9.6 8 14 8 14Z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    </button>
  );
}
