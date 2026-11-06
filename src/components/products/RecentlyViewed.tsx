"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TexturePreview } from "@/components/ui/TexturePreview";

interface Snapshot {
  slug: string;
  name: string;
  texture: string;
  collectionName: string;
}

const KEY = "wv-recently-viewed";

/** Records the visited product locally and shows the trail (snapshots, no fetch). */
export function RecentlyViewed({ current }: { current: Snapshot }) {
  const [items, setItems] = useState<Snapshot[]>([]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(KEY);
        const list: Snapshot[] = raw ? JSON.parse(raw) : [];
        const others = list.filter((i) => i.slug !== current.slug);
        if (!cancelled) setItems(others.slice(0, 4));
        localStorage.setItem(KEY, JSON.stringify([current, ...others].slice(0, 8)));
      } catch {
        /* storage unavailable */
      }
    });
    return () => {
      cancelled = true;
    };
  }, [current]);

  if (items.length === 0) return null;

  return (
    <section aria-label="Recently viewed" className="mt-20 border-t border-current/10 pt-10">
      <p className="label opacity-50 mb-6">Recently viewed</p>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {items.map((i) => (
          <Link key={i.slug} href={`/product/${i.slug}`} className="group">
            <TexturePreview
              texture={i.texture}
              tileSize={160}
              alt={`${i.name} wallpaper`}
              className="aspect-[4/3] border border-current/10 group-hover:border-citron transition-colors"
            />
            <p className="mt-2 text-sm font-serif group-hover:underline underline-offset-4">{i.name}</p>
            <p className="label opacity-50">{i.collectionName}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
