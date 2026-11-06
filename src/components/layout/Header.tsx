"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useCart } from "@/store/cart";
import { useActiveWallpaper } from "@/store/active-wallpaper";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { useHydrated } from "@/hooks/useHydrated";

const menuLinks = [
  { href: "/", label: "Explore", note: "The cinematic tour" },
  { href: "/shop", label: "Shop", note: "The whole archive" },
  { href: "/collections", label: "Collections", note: "Ten worlds of pattern" },
  { href: "/room-studio", label: "Room Studio", note: "See it on your walls" },
  { href: "/calculator", label: "Calculator", note: "How many rolls?" },
  { href: "/journal", label: "Journal", note: "Notes on walls" },
  { href: "/about", label: "Our World", note: "What WALLVERSE is" },
  { href: "/contact", label: "Contact", note: "Talk to the studio" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);
  const overlayRef = useRef<HTMLDivElement>(null);
  const items = useCart((s) => s.items);
  const activeProduct = useActiveWallpaper((s) => s.product);
  const active = hydrated ? activeProduct : null;
  const count = hydrated ? items.reduce((n, i) => n + i.quantity, 0) : 0;

  // Close menu on navigation (render-time state adjustment, no effect needed).
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  // Lock scroll + stagger-in animation while the menu is open.
  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", open);
    if (open && overlayRef.current && !prefersReducedMotion()) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          overlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.35, ease: "power2.out" }
        );
        gsap.fromTo(
          "[data-menu-item]",
          { yPercent: 110 },
          { yPercent: 0, duration: 0.7, stagger: 0.055, ease: "power4.out", delay: 0.1 }
        );
        gsap.fromTo(
          "[data-menu-aside]",
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.45, ease: "power2.out" }
        );
      }, overlayRef);
      return () => {
        ctx.revert();
        document.documentElement.classList.remove("overflow-hidden");
      };
    }
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [open]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[70] text-ivory">
        <div className="container-wv flex h-[var(--header-h)] items-center justify-between bg-gradient-to-b from-ink/80 to-transparent">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="wv-menu"
              className="group flex items-center gap-3 cursor-pointer"
            >
              <span className="relative block h-3.5 w-6" aria-hidden>
                <span
                  className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300 ${open ? "translate-y-[6.5px] rotate-45" : ""}`}
                />
                <span
                  className={`absolute left-0 top-1/2 h-px w-full bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
                />
                <span
                  className={`absolute left-0 bottom-0 h-px w-full bg-current transition-transform duration-300 ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`}
                />
              </span>
              <span className="label hidden sm:block opacity-80 group-hover:opacity-100 transition-opacity">
                {open ? "Close" : "Menu"}
              </span>
            </button>
            <nav aria-label="Primary" className="hidden lg:flex items-center gap-6 ml-6">
              <Link href="/shop" className="label opacity-70 hover:opacity-100 transition-opacity">
                Shop
              </Link>
              <Link href="/collections" className="label opacity-70 hover:opacity-100 transition-opacity">
                Collections
              </Link>
              <Link href="/room-studio" className="label opacity-70 hover:opacity-100 transition-opacity">
                Room Studio
              </Link>
            </nav>
          </div>

          <Link
            href="/"
            className="font-serif text-xl md:text-2xl tracking-[0.35em] absolute left-1/2 -translate-x-1/2"
            aria-label="WALLVERSE home"
          >
            WALLVERSE
          </Link>

          <div className="flex items-center gap-4 md:gap-5">
            {active ? (
              <Link
                href={`/product/${active.slug}`}
                title={`Active design: ${active.name}`}
                aria-label={`Active design: ${active.name}`}
                className="hidden md:block h-6 w-6 rounded-full border border-ivory/40 texture-tile overflow-hidden"
                style={{ backgroundImage: `url(${active.texture})`, backgroundSize: "60px" }}
              />
            ) : null}
            <Link href="/search" aria-label="Search designs" className="opacity-80 hover:opacity-100 transition-opacity">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
                <path d="M12.5 12.5 L17 17" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="opacity-80 hover:opacity-100 transition-opacity hidden sm:block">
              <svg width="18" height="17" viewBox="0 0 16 15" fill="none" aria-hidden>
                <path
                  d="M8 14S1 9.6 1 4.9C1 2.6 2.8 1 4.9 1 6.2 1 7.4 1.7 8 2.8 8.6 1.7 9.8 1 11.1 1 13.2 1 15 2.6 15 4.9 15 9.6 8 14 8 14Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
            </Link>
            <Link href="/cart" aria-label={`Shopping bag, ${count} item${count === 1 ? "" : "s"}`} className="relative opacity-80 hover:opacity-100 transition-opacity">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden>
                <path d="M3 6h12l-1 13H4L3 6Z" stroke="currentColor" strokeWidth="1.3" />
                <path d="M6 8V4a3 3 0 0 1 6 0v4" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              {count > 0 ? (
                <span className="absolute -right-2.5 -top-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-citron px-1 text-[0.625rem] font-semibold text-ink tabular">
                  {count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      {open ? (
        <div
          ref={overlayRef}
          id="wv-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-[60] bg-ink text-ivory overflow-y-auto"
        >
          <div className="container-wv grid min-h-dvh content-center gap-12 py-28 lg:grid-cols-[1.4fr_1fr]">
            <nav aria-label="Menu">
              <ul className="flex flex-col gap-1">
                {menuLinks.map((l, i) => (
                  <li key={l.href} className="overflow-hidden">
                    <div data-menu-item>
                      <Link
                        href={l.href}
                        className="group flex items-baseline gap-5 py-1.5"
                        aria-current={pathname === l.href ? "page" : undefined}
                      >
                        <span className="label opacity-40 w-7">{String(i + 1).padStart(2, "0")}</span>
                        <span
                          className={`display text-4xl md:text-6xl transition-colors duration-300 ${pathname === l.href ? "text-citron" : "group-hover:text-citron"}`}
                        >
                          {l.label}
                        </span>
                        <span className="label opacity-0 group-hover:opacity-50 transition-opacity hidden md:inline">
                          {l.note}
                        </span>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
            <aside data-menu-aside className="flex flex-col justify-end gap-8">
              {active ? (
                <div>
                  <p className="label opacity-50 mb-3">Your active design</p>
                  <Link href={`/product/${active.slug}`} className="group flex items-center gap-4">
                    <span
                      className="block h-20 w-20 texture-tile border border-ivory/20"
                      style={{ backgroundImage: `url(${active.texture})`, backgroundSize: "140px" }}
                      aria-hidden
                    />
                    <span>
                      <span className="font-serif text-xl block group-hover:underline underline-offset-4">
                        {active.name}
                      </span>
                      <span className="label opacity-50">{active.collectionName}</span>
                    </span>
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="label opacity-50 mb-3">Begin anywhere</p>
                  <p className="font-serif text-xl max-w-xs opacity-80">
                    Pick a wallpaper anywhere in the Wallverse and it follows you to the Room Studio.
                  </p>
                </div>
              )}
              <div className="label flex flex-wrap gap-x-8 gap-y-2 opacity-50">
                <Link href="/installation" className="hover:opacity-100 hover:text-citron transition-all">Installation</Link>
                <Link href="/shipping-returns" className="hover:opacity-100 hover:text-citron transition-all">Shipping</Link>
                <Link href="/account" className="hover:opacity-100 hover:text-citron transition-all">Account</Link>
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </>
  );
}
