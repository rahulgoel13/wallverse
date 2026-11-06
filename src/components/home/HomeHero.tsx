"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SceneShell } from "@/components/three/SceneShell";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Button } from "@/components/ui/Button";
import type { ProductDTO } from "@/types";

const HeroScene = dynamic(
  () => import("@/components/three/HeroScene").then((m) => m.HeroScene),
  { ssr: false }
);

/** Static hero used for reduced motion / no WebGL — the journey must never depend on it. */
function HeroPoster({ products }: { products: ProductDTO[] }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 opacity-30">
        {products.slice(0, 6).map((p) => (
          <TexturePreview key={p.slug} texture={p.texture} tileSize={260} className="h-full w-full" />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
    </div>
  );
}

export function HomeHero({ products }: { products: ProductDTO[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !sectionRef.current) return;

      // Entry reveal for the headline lines.
      gsap.fromTo(
        "[data-hero-line] > span",
        { yPercent: 110 },
        { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power4.out", delay: 0.3 }
      );
      gsap.fromTo(
        "[data-hero-meta]",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.9, delay: 1.0, ease: "power2.out" }
      );

      // The scroll-scrubbed cinematic timeline.
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          progressRef.current = p;
          if (headlineRef.current) {
            const fade = Math.min(1, Math.max(0, (p - 0.06) / 0.2));
            gsap.set(headlineRef.current, { autoAlpha: 1 - fade, y: fade * -60 });
          }
          if (chapterRef.current) {
            const inP = Math.min(1, Math.max(0, (p - 0.38) / 0.1));
            const outP = Math.min(1, Math.max(0, (p - 0.78) / 0.08));
            gsap.set(chapterRef.current, { autoAlpha: inP * (1 - outP) });
          }
          if (fadeRef.current) {
            const f = Math.min(1, Math.max(0, (p - 0.9) / 0.1));
            gsap.set(fadeRef.current, { autoAlpha: f });
          }
        },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  if (reducedMotion) {
    return (
      <section className="relative min-h-dvh flex items-end section-dark">
        <HeroPoster products={products} />
        <HeroCopy />
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[320vh] section-dark" aria-label="WALLVERSE — an immersive wallpaper universe">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <SceneShell
          eager
          className="h-full w-full"
          camera={{ position: [0, 1.5, 9.2], fov: 42 }}
          fallback={<HeroPoster products={products} />}
        >
          <HeroScene products={products} progressRef={progressRef} />
        </SceneShell>

        {/* Headline overlay */}
        <div ref={headlineRef} className="absolute inset-0 flex items-end pointer-events-none">
          <HeroCopy />
        </div>

        {/* Chapter 02 annotation */}
        <div
          ref={chapterRef}
          className="absolute inset-x-0 bottom-0 pb-14 opacity-0 pointer-events-none"
        >
          <div className="container-wv">
            <p className="label text-citron mb-3">Chapter 02 — The Unrolling Wall</p>
            <p className="font-serif text-2xl md:text-4xl max-w-xl text-ivory">
              One roll of paper, and the room changes its mind.
            </p>
          </div>
        </div>

        {/* Handoff fade into the corridor */}
        <div ref={fadeRef} className="absolute inset-0 bg-ink opacity-0 pointer-events-none" />

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none" aria-hidden>
          <div className="label opacity-50 flex flex-col items-center gap-2">
            <span>Scroll</span>
            <span className="block h-8 w-px bg-ivory/40 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCopy() {
  return (
    <div className="container-wv pb-24 md:pb-28 w-full pointer-events-none">
      <p data-hero-meta className="label text-citron mb-5">
        Chapter 01 — The Portal
      </p>
      <h1 className="display text-[13vw] leading-[0.92] md:text-[7.5vw] text-ivory max-w-5xl">
        <span data-hero-line className="block overflow-hidden">
          <span className="block">THE WORLD</span>
        </span>
        <span data-hero-line className="block overflow-hidden">
          <span className="block">
            IS YOUR <em className="not-italic text-citron">WALL.</em>
          </span>
        </span>
      </h1>
      <div data-hero-meta className="mt-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <p className="max-w-sm text-sm opacity-70 leading-relaxed">
          Discover a different dimension of interiors. Explore extraordinary wallpapers and
          transform the way your spaces feel.
        </p>
        <div className="flex flex-wrap gap-4 pointer-events-auto">
          <Button href="/shop" variant="citron">
            Enter the Wallverse
          </Button>
          <Button href="/collections" variant="outline" className="text-ivory">
            Explore collections
          </Button>
        </div>
      </div>
      <p data-hero-meta className="label mt-10 opacity-40 hidden md:block">
        Hover the floating samples · Click one to open its design
      </p>
      <Link href="/shop" className="sr-only">
        Skip the 3D experience and go straight to the shop
      </Link>
    </div>
  );
}
