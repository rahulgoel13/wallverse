"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SceneShell } from "@/components/three/SceneShell";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { indexLabel } from "@/lib/format";
import type { CorridorItem } from "@/components/three/CorridorScene";

const CorridorScene = dynamic(
  () => import("@/components/three/CorridorScene").then((m) => m.CorridorScene),
  { ssr: false }
);

function CorridorFallback({ items }: { items: CorridorItem[] }) {
  return (
    <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-5" aria-hidden>
      {items.map((it) => (
        <TexturePreview key={it.slug} texture={it.texture} tileSize={220} className="h-full w-full opacity-40" />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/70" />
    </div>
  );
}

/** Chapter 03 — scroll travels through one chamber per collection. */
export function CorridorSection({ items }: { items: CorridorItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !sectionRef.current) return;
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          const idx = Math.min(items.length - 1, Math.floor(self.progress * items.length));
          setActive((prev) => (prev === idx ? prev : idx));
        },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion, items.length] }
  );

  const current = items[active];

  if (reducedMotion) {
    // Simple list — same destinations, no cinema.
    return (
      <section className="section-dark py-24">
        <div className="container-wv">
          <p className="label text-citron mb-10">Chapter 03 — The Infinite Design Corridor</p>
          <ul className="flex flex-col divide-y divide-ivory/10">
            {items.map((it, i) => (
              <li key={it.slug}>
                <Link href={`/collections/${it.slug}`} className="group flex items-center gap-6 py-6">
                  <span className="label opacity-40">{indexLabel(i)}</span>
                  <TexturePreview texture={it.texture} tileSize={120} className="h-16 w-24 border border-ivory/10" />
                  <span className="display text-3xl md:text-5xl group-hover:text-citron transition-colors">{it.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[420vh] section-dark"
      aria-label="The design corridor — browse collections"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <SceneShell
          className="h-full w-full"
          camera={{ position: [0, 1.2, 3], fov: 58 }}
          fallback={<CorridorFallback items={items} />}
        >
          <CorridorScene items={items} progressRef={progressRef} />
        </SceneShell>

        {/* Overlay: current chamber */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="container-wv pt-24">
            <p className="label text-citron">Chapter 03 — The Infinite Design Corridor</p>
          </div>
          <div className="container-wv pb-16">
            <div key={current?.slug} className="animate-[corridor-in_0.5s_ease-out]">
              <p className="label opacity-60 mb-2">
                {indexLabel(active)} — of {String(items.length).padStart(2, "0")}
              </p>
              <h2 className="display text-5xl md:text-7xl text-ivory uppercase">{current?.name}</h2>
              <Link
                href={`/collections/${current?.slug}`}
                className="label inline-flex items-center gap-3 mt-6 text-citron pointer-events-auto hover:gap-5 transition-all"
              >
                Enter this collection <span aria-hidden>→</span>
              </Link>
            </div>
            {/* progress rail */}
            <div className="mt-10 flex gap-2" aria-hidden>
              {items.map((it, i) => (
                <span
                  key={it.slug}
                  className={`h-px flex-1 transition-colors duration-300 ${i <= active ? "bg-citron" : "bg-ivory/20"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <style>{`@keyframes corridor-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }`}</style>
      </div>
    </section>
  );
}
