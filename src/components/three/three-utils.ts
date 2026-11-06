"use client";

import { useRef } from "react";
import * as THREE from "three";

/** Can this browser run WebGL at all? Cached after first check. */
let webglSupport: boolean | null = null;
export function supportsWebGL(): boolean {
  if (webglSupport != null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

export function isCoarsePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

/** Quality tier: low (phones / coarse pointers), high otherwise. */
export function qualityTier(): "low" | "high" {
  if (typeof window === "undefined") return "high";
  const smallScreen = window.innerWidth < 768;
  return smallScreen || isCoarsePointer() ? "low" : "high";
}

export function maxDpr(): number {
  return qualityTier() === "low" ? 1.5 : 1.75;
}

/* ——— Shared texture cache ———
 * The same SVG assets serve 2D previews and 3D materials. Textures are cached
 * by URL and reference-counted clones configure repeat per surface.
 */
const textureCache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();

export function loadWallpaperTexture(url: string): Promise<THREE.Texture> {
  const cached = textureCache.get(url);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        textureCache.set(url, tex);
        resolve(tex);
      },
      undefined,
      reject
    );
  });
}

/** Clone a cached texture (shares the GPU image) with its own repeat. */
export function cloneWithRepeat(tex: THREE.Texture, rx: number, ry: number): THREE.Texture {
  const t = tex.clone();
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return t;
}

/**
 * Scenes stop rendering while off screen. When R3F resumes the loop it restarts
 * its clock (elapsedTime goes back to 0), so this detects the first frame after
 * a pause. Lerps then settle straight onto their target — exactly where
 * continuous rendering would already have put them — instead of visibly gliding
 * in from where they were when the scene was paused.
 */
export function useResumeDetector() {
  const last = useRef(Number.POSITIVE_INFINITY);
  return (elapsed: number) => {
    const resumed = elapsed < last.current;
    last.current = elapsed;
    return resumed;
  };
}

export function settle(factor: number, resumed: boolean): number {
  return resumed ? 1 : factor;
}

/**
 * 1×1 white texture bound to a material while its wallpaper loads (and to
 * unpapered walls). white × material.color renders exactly like no map, but
 * the material keeps the same shader program for its whole life: `map` is part
 * of three.js's program key, so a null→texture swap would compile a second
 * shader synchronously when the texture arrives.
 */
let placeholder: THREE.DataTexture | null = null;
export function placeholderTexture(): THREE.Texture {
  if (!placeholder) {
    placeholder = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    placeholder.colorSpace = THREE.SRGBColorSpace;
    placeholder.wrapS = THREE.RepeatWrapping;
    placeholder.wrapT = THREE.RepeatWrapping;
    placeholder.needsUpdate = true;
  }
  return placeholder;
}

export function disposeTextureCache() {
  for (const t of textureCache.values()) t.dispose();
  textureCache.clear();
}

/** Physical tile width of one pattern repeat in metres (rolls print ~53 cm wide). */
export const TILE_METRES = 0.53;

/** Compute texture repeats for a wall of w×h metres at a given pattern scale. */
export function wallRepeats(w: number, h: number, scale = 1): [number, number] {
  const tile = TILE_METRES * scale;
  return [w / tile, h / tile];
}
