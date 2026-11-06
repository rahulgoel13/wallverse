"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductDTO } from "@/types";

/**
 * "The wall that follows you" — the design the visitor last selected in an
 * immersive moment. It tints ambient accents and pre-selects the Room Studio.
 */
interface ActiveWallpaperState {
  product: ProductDTO | null;
  setProduct: (p: ProductDTO | null) => void;
}

export const useActiveWallpaper = create<ActiveWallpaperState>()(
  persist(
    (set) => ({
      product: null,
      setProduct: (product) => set({ product }),
    }),
    { name: "wv-active-wallpaper" }
  )
);
