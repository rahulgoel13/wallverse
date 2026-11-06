"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { loadWallpaperTexture } from "./three-utils";

/**
 * Loads a wallpaper texture (cached) and returns this caller's own clone of it.
 *
 * - One texture object per URL: repeat changes update it in place, so a slider
 *   never re-creates (and re-uploads) the texture.
 * - The clone is uploaded to the GPU as soon as it loads, each in its own task,
 *   instead of every texture uploading together inside the first render.
 * - When the URL changes, the previous texture stays bound until the new one is
 *   ready, so the material never drops back to its untextured state.
 *
 * Non-suspending so designs can be swapped live in scenes. Returns null until
 * the first texture is ready; callers bind placeholderTexture() meanwhile.
 */
export function useWallpaperTexture(
  url: string | null,
  repeatX = 1,
  repeatY = 1
): THREE.Texture | null {
  const gl = useThree((s) => s.gl);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const current = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    const replace = (next: THREE.Texture | null) => {
      const prev = current.current;
      current.current = next;
      setTexture(next);
      // Free the old clone once the material has switched to the new one.
      if (prev) requestAnimationFrame(() => prev.dispose());
    };

    if (!url) {
      queueMicrotask(() => {
        if (!cancelled && current.current) replace(null);
      });
      return () => {
        cancelled = true;
      };
    }

    loadWallpaperTexture(url)
      .then((base) => {
        if (cancelled) return;
        const next = base.clone();
        gl.initTexture(next);
        replace(next);
      })
      .catch(() => {
        /* keep whatever is bound; the placeholder covers a first-load failure */
      });

    return () => {
      cancelled = true;
    };
  }, [url, gl]);

  useEffect(
    () => () => {
      current.current?.dispose();
      current.current = null;
    },
    []
  );

  // Before paint, so a new texture never shows a frame at the wrong scale.
  useLayoutEffect(() => {
    texture?.repeat.set(repeatX, repeatY);
  }, [texture, repeatX, repeatY]);

  return texture;
}
