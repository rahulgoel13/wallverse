"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { SceneShell } from "@/components/three/SceneShell";
import { RoomIllustration } from "@/components/home/RoomIllustration";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Price } from "@/components/ui/Price";
import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { useActiveWallpaper } from "@/store/active-wallpaper";
import type { ProductDTO } from "@/types";

const TakeoverScene = dynamic(
  () => import("@/components/three/TakeoverScene").then((m) => m.TakeoverScene),
  { ssr: false }
);

/**
 * Chapter 04 — The Wallpaper Takeover.
 * Pick a floating sample; its texture floods the viewport, the environment
 * becomes a room wearing that design, and the design stays with you.
 */
export function TakeoverSection({ products }: { products: ProductDTO[] }) {
  const [selected, setSelected] = useState<ProductDTO | null>(null);
  const [revealed, setRevealed] = useState(false);
  // True only while the overlay fully covers the viewport: the 3D gallery
  // beneath can't be seen then, so it stops rendering.
  const [covered, setCovered] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const setActive = useActiveWallpaper((s) => s.setProduct);

  const pick = (product: ProductDTO, clientX: number, clientY: number) => {
    originRef.current = { x: clientX, y: clientY };
    setSelected(product);
    setActive(product);
  };

  const exit = useCallback(() => {
    setCovered(false);
    if (!overlayRef.current || prefersReducedMotion()) {
      setSelected(null);
      setRevealed(false);
      return;
    }
    const { x, y } = originRef.current;
    gsap.to(overlayRef.current, {
      clipPath: `circle(0% at ${x}px ${y}px)`,
      duration: 0.7,
      ease: "power3.inOut",
      onComplete: () => {
        setSelected(null);
        setRevealed(false);
      },
    });
  }, []);

  // Expansion choreography once the overlay mounts.
  useEffect(() => {
    if (!selected || !overlayRef.current) return;
    document.documentElement.classList.add("overflow-hidden");
    const { x, y } = originRef.current;
    const el = overlayRef.current;
    if (prefersReducedMotion()) {
      gsap.set(el, { clipPath: `circle(150% at ${x}px ${y}px)` });
      queueMicrotask(() => {
        setRevealed(true);
        setCovered(true);
      });
    } else {
      gsap.fromTo(
        el,
        { clipPath: `circle(0% at ${x}px ${y}px)` },
        {
          clipPath: `circle(150% at ${x}px ${y}px)`,
          duration: 1.0,
          ease: "power3.inOut",
          onComplete: () => {
            setRevealed(true);
            setCovered(true);
          },
        }
      );
    }
    closeRef.current?.focus();
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && exit();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, exit]);

  return (
    <section className="section-dark relative py-24 md:py-32" aria-label="The wallpaper takeover — try a design">
      <div className="container-wv mb-12">
        <p className="label text-citron mb-4">Chapter 04 — The Wallpaper Takeover</p>
        <h2 className="display text-4xl md:text-6xl max-w-3xl">
          Touch a sample. <span className="text-citron">Lose the room.</span>
        </h2>
        <p className="mt-5 max-w-xl text-sm opacity-70 leading-relaxed">
          Every floating sample is a real design from the archive. Select one and it takes over
          everything — then follows you into the Room Studio and the shop.
        </p>
      </div>

      <SceneShell
        className="h-[72vh] min-h-[480px]"
        camera={{ position: [0, 0, 6.4], fov: 45 }}
        paused={covered}
        fallback={
          <div className="absolute inset-0 overflow-y-auto">
            <div className="container-wv grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
              {products.map((p) => (
                <button
                  key={p.slug}
                  onClick={(e) => pick(p, e.clientX, e.clientY)}
                  className="group text-left cursor-pointer"
                >
                  <TexturePreview
                    texture={p.texture}
                    tileSize={150}
                    alt={`${p.name} wallpaper sample`}
                    className="aspect-[3/4] border border-ivory/10 group-hover:border-citron transition-colors"
                  />
                  <p className="mt-2 text-sm font-serif">{p.name}</p>
                  <p className="label opacity-50">{p.collectionName}</p>
                </button>
              ))}
            </div>
          </div>
        }
      >
        <TakeoverScene products={products} onPick={pick} />
      </SceneShell>

      {/* ——— The takeover overlay ——— */}
      {selected ? (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.name} takes over the room`}
          className="fixed inset-0 z-[80] texture-tile overflow-y-auto"
          style={{ backgroundImage: `url(${selected.texture})`, backgroundSize: "340px" }}
        >
          <div
            className={`min-h-full bg-ink/70 backdrop-blur-[2px] transition-opacity duration-700 ${revealed ? "opacity-100" : "opacity-0"}`}
          >
            <div className="container-wv flex min-h-dvh flex-col justify-center py-24">
              <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] items-center">
                <div
                  className={`transition-all duration-700 delay-150 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                >
                  <RoomIllustration
                    texture={selected.texture}
                    accentOnly
                    className="w-full h-auto border border-ivory/20 shadow-2xl"
                    title={`A room transformed by ${selected.name}`}
                  />
                </div>
                <div
                  className={`transition-all duration-700 delay-300 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                >
                  <div className="bg-ink/85 border border-ivory/15 p-7 md:p-9">
                    <p className="label mb-2" style={{ color: selected.accent }}>
                      {selected.collectionName}
                    </p>
                    <h3 className="display text-4xl md:text-5xl">{selected.name}</h3>
                    <p className="mt-4 text-sm opacity-75 leading-relaxed">{selected.description}</p>
                    <p className="mt-5 text-xl">
                      <Price price={selected.price} salePrice={selected.salePrice} unit={selected.priceUnit} />
                    </p>
                    <dl className="label mt-5 grid grid-cols-2 gap-x-6 gap-y-2 opacity-60">
                      <div className="flex justify-between gap-2"><dt>Material</dt><dd className="text-right normal-case tracking-normal">{selected.material}</dd></div>
                      <div className="flex justify-between gap-2"><dt>Finish</dt><dd className="text-right normal-case tracking-normal">{selected.finish}</dd></div>
                      <div className="flex justify-between gap-2"><dt>Roll</dt><dd className="text-right normal-case tracking-normal">{selected.rollWidthCm} cm × {selected.rollLengthM} m</dd></div>
                      <div className="flex justify-between gap-2"><dt>Match</dt><dd className="text-right normal-case tracking-normal">{selected.patternMatch}</dd></div>
                    </dl>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <AddToCartButton product={selected} />
                      <Button href={`/room-studio?design=${selected.slug}`} variant="outline" className="text-ivory">
                        Open in Room Studio
                      </Button>
                    </div>
                    <div className="mt-5 flex items-center gap-6">
                      <Link
                        href={`/product/${selected.slug}`}
                        className="label text-citron hover:underline underline-offset-4"
                      >
                        Full details →
                      </Link>
                      <button
                        ref={closeRef}
                        onClick={exit}
                        className="label opacity-60 hover:opacity-100 cursor-pointer"
                      >
                        ✕ Return to the gallery
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
