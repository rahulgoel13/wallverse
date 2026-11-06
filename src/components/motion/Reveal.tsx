"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";

/** Scroll-into-view reveal used for editorial blocks. Honors reduced motion. */
export function Reveal({
  children,
  delay = 0,
  y = 36,
  className = "",
  stagger,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** When set, animates direct children with this stagger instead of the wrapper. */
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;
      const targets = stagger != null ? Array.from(ref.current.children) : ref.current;
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          delay,
          ease: "power3.out",
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
