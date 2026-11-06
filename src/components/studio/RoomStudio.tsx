"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SceneShell } from "@/components/three/SceneShell";
import type { RoomSceneHandle } from "@/components/three/RoomScene";
import { RoomIllustration } from "@/components/home/RoomIllustration";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { RoomPhotoUpload } from "@/components/studio/RoomPhotoUpload";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { useActiveWallpaper } from "@/store/active-wallpaper";
import {
  defaultStudioState,
  PAINT_SWATCHES,
  ROOM_LABELS,
  WALL_LABELS,
  type LightingId,
  type RoomId,
  type StudioState,
  type WallId,
} from "@/components/studio/studio-types";
import type { CollectionDTO, ProductDTO } from "@/types";

const RoomScene = dynamic(
  () => import("@/components/three/RoomScene").then((m) => m.RoomScene),
  { ssr: false }
);

const SAVE_KEY = "wv-studio-save";
const wallIds: WallId[] = ["back", "left", "right", "front"];

function stateFromParams(params: URLSearchParams, valid: Set<string>): StudioState | null {
  if (!params.has("room") && !wallIds.some((w) => params.has(w))) return null;
  const room = (["living", "bedroom", "dining"].includes(params.get("room") ?? "") ? params.get("room") : "living") as RoomId;
  const s = defaultStudioState(room);
  for (const w of wallIds) {
    const design = params.get(w);
    if (design && valid.has(design)) s.walls[w].design = design;
    const scale = Number(params.get(`${w}Scale`));
    if (scale >= 0.5 && scale <= 2.5) s.walls[w].scale = scale;
  }
  const light = params.get("light");
  if (light && ["day", "evening", "night"].includes(light)) s.lighting = light as LightingId;
  const paint = params.get("paint");
  if (paint && /^#[0-9a-fA-F]{6}$/.test(paint)) s.paint = paint;
  return s;
}

export function RoomStudio({
  products,
  collections,
  initialDesign,
}: {
  products: ProductDTO[];
  collections: CollectionDTO[];
  initialDesign?: string;
}) {
  const productsBySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const validSlugs = useMemo(() => new Set(products.map((p) => p.slug)), [products]);
  const activeWallpaper = useActiveWallpaper((s) => s.product);
  const setActiveWallpaper = useActiveWallpaper((s) => s.setProduct);

  const [state, setState] = useState<StudioState>(() => {
    const s = defaultStudioState();
    if (initialDesign && validSlugs.has(initialDesign)) s.walls.back.design = initialDesign;
    return s;
  });
  const [collectionFilter, setCollectionFilter] = useState<string>("all");
  const [hasSave, setHasSave] = useState(false);
  const sceneRef = useRef<RoomSceneHandle>(null);
  const addToCart = useCart((s) => s.add);
  const showToast = useToast((s) => s.show);

  // Hydrate from a shared URL, a saved design, or the design that follows the visitor.
  useEffect(() => {
    queueMicrotask(() => {
    try {
      const fromUrl = stateFromParams(new URLSearchParams(window.location.search), validSlugs);
      if (fromUrl) {
        if (initialDesign && validSlugs.has(initialDesign)) fromUrl.walls.back.design ??= initialDesign;
        setState(fromUrl);
      } else if (!initialDesign && activeWallpaper && validSlugs.has(activeWallpaper.slug)) {
        setState((s) => ({ ...s, walls: { ...s.walls, back: { ...s.walls.back, design: activeWallpaper.slug } } }));
      }
      setHasSave(Boolean(localStorage.getItem(SAVE_KEY)));
    } catch {
      /* URL/storage unavailable — defaults are fine */
    }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = state.selectedWall;
  const selectedWallState = selected ? state.walls[selected] : null;
  const selectedProduct = selectedWallState?.design ? (productsBySlug.get(selectedWallState.design) ?? null) : null;

  const appliedProducts = useMemo(() => {
    const slugs = new Set(
      wallIds.map((w) => state.walls[w].design).filter((d): d is string => Boolean(d))
    );
    return [...slugs].map((s) => productsBySlug.get(s)).filter((p): p is ProductDTO => Boolean(p));
  }, [state.walls, productsBySlug]);

  const filteredProducts =
    collectionFilter === "all" ? products : products.filter((p) => p.collectionSlug === collectionFilter);

  const update = (patch: Partial<StudioState>) => setState((s) => ({ ...s, ...patch }));

  const applyDesign = (slug: string | null) => {
    const wall = selected ?? "back";
    setState((s) => ({
      ...s,
      selectedWall: wall,
      walls: { ...s.walls, [wall]: { ...s.walls[wall], design: slug } },
    }));
    if (slug) {
      const p = productsBySlug.get(slug);
      if (p) setActiveWallpaper(p);
    }
  };

  const setScale = (scale: number) => {
    const wall = selected ?? "back";
    setState((s) => ({
      ...s,
      walls: { ...s.walls, [wall]: { ...s.walls[wall], scale } },
    }));
  };

  const shareUrl = () => {
    const params = new URLSearchParams();
    params.set("room", state.room);
    for (const w of wallIds) {
      const ws = state.walls[w];
      if (ws.design) params.set(w, ws.design);
      if (ws.scale !== 1) params.set(`${w}Scale`, String(ws.scale));
    }
    params.set("light", state.lighting);
    if (state.paint !== "#e8e2d4") params.set("paint", state.paint);
    return `${window.location.origin}/room-studio?${params.toString()}`;
  };

  const btn = (active: boolean) =>
    `label border px-3 py-2 transition-colors cursor-pointer ${
      active ? "border-citron text-citron" : "border-current/25 opacity-70 hover:opacity-100 hover:border-current/60"
    }`;

  return (
    <div className="grid lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
      {/* ——— The room ——— */}
      <div className="lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
        <SceneShell
          eager
          className="h-[52vh] min-h-[380px] lg:h-[72vh] border border-ivory/15 bg-obsidian"
          camera={{ position: [3.4, 2.0, 4.6], fov: 50 }}
          label="Interactive 3D room — click a wall to select it"
          fallback={
            <div className="absolute inset-0">
              <RoomIllustration
                texture={selectedProduct?.texture ?? appliedProducts[0]?.texture}
                mode={appliedProducts.length > 0 ? "papered" : "plain"}
                accentOnly
                wallPaint={state.paint}
                className="h-full w-full"
                title="Room preview (static fallback)"
              />
              <p className="label absolute bottom-3 left-3 bg-ink/70 text-ivory px-2 py-1">
                Static preview — 3D is unavailable on this device
              </p>
            </div>
          }
        >
          <RoomScene
            ref={sceneRef}
            state={state}
            productsBySlug={productsBySlug}
            onSelectWall={(id) => update({ selectedWall: id })}
          />
        </SceneShell>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="label opacity-50">Drag to orbit · scroll to zoom · click a wall to select</p>
          <div className="flex gap-2">
            {(["corner", "front", "left", "top"] as const).map((v) => (
              <button key={v} type="button" onClick={() => sceneRef.current?.setView(v)} className={btn(false)}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ——— Control panel ——— */}
      <div className="flex flex-col gap-7 lg:max-h-[80vh] lg:overflow-y-auto lg:pr-2 no-scrollbar" data-lenis-prevent>
        {/* Room */}
        <section aria-label="Room selection">
          <p className="label opacity-60 mb-3">01 — Room</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ROOM_LABELS) as RoomId[]).map((r) => (
              <button key={r} type="button" onClick={() => update({ room: r })} className={btn(state.room === r)}>
                {ROOM_LABELS[r]}
              </button>
            ))}
          </div>
        </section>

        {/* Wall */}
        <section aria-label="Wall selection">
          <p className="label opacity-60 mb-3">02 — Wall</p>
          <div className="flex flex-wrap gap-2">
            {wallIds.map((w) => (
              <button key={w} type="button" onClick={() => update({ selectedWall: w })} className={btn(selected === w)}>
                {WALL_LABELS[w]}
                {state.walls[w].design ? " ●" : ""}
              </button>
            ))}
          </div>
          {selectedProduct ? (
            <div className="mt-3 flex items-center justify-between gap-3 border border-current/15 p-3">
              <div className="flex items-center gap-3">
                <TexturePreview texture={selectedProduct.texture} tileSize={90} className="h-10 w-10 shrink-0" />
                <div>
                  <p className="text-sm font-serif leading-tight">{selectedProduct.name}</p>
                  <p className="label opacity-50">{selected ? WALL_LABELS[selected] : ""}</p>
                </div>
              </div>
              <button type="button" onClick={() => applyDesign(null)} className="label opacity-60 hover:opacity-100 cursor-pointer">
                Restore paint
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs opacity-50">
              {selected ? `${WALL_LABELS[selected]} is painted. Pick a design below.` : "Click a wall in the room, then pick a design."}
            </p>
          )}
        </section>

        {/* Designs */}
        <section aria-label="Wallpaper designs">
          <p className="label opacity-60 mb-3">03 — Design</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2" data-lenis-prevent>
            <button type="button" onClick={() => setCollectionFilter("all")} className={`${btn(collectionFilter === "all")} whitespace-nowrap`}>
              All
            </button>
            {collections.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCollectionFilter(c.slug)}
                className={`${btn(collectionFilter === c.slug)} whitespace-nowrap`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1" data-lenis-prevent>
            {filteredProducts.map((p) => {
              const active = selectedWallState?.design === p.slug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  title={p.name}
                  aria-pressed={active}
                  onClick={() => applyDesign(p.slug)}
                  className={`relative aspect-square cursor-pointer border transition-colors ${active ? "border-citron" : "border-transparent hover:border-current/50"}`}
                >
                  <TexturePreview texture={p.texture} tileSize={80} alt={p.name} className="absolute inset-0" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Scale */}
        <section aria-label="Pattern scale">
          <label className="label opacity-60 mb-3 flex justify-between">
            <span>04 — Pattern scale {selected ? `(${WALL_LABELS[selected]})` : ""}</span>
            <span className="tabular">{(selectedWallState?.scale ?? 1).toFixed(2)}×</span>
          </label>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={selectedWallState?.scale ?? 1}
            onChange={(e) => setScale(Number(e.target.value))}
            disabled={!selectedProduct}
            className="w-full accent-citron disabled:opacity-30"
            aria-label="Pattern scale"
          />
        </section>

        {/* Light + paint */}
        <section aria-label="Lighting and paint" className="grid grid-cols-1 gap-5">
          <div>
            <p className="label opacity-60 mb-3">05 — Lighting</p>
            <div className="flex gap-2">
              {(["day", "evening", "night"] as LightingId[]).map((l) => (
                <button key={l} type="button" onClick={() => update({ lighting: l })} className={btn(state.lighting === l)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label opacity-60 mb-3">06 — Wall paint (unpapered walls)</p>
            <div className="flex gap-2">
              {PAINT_SWATCHES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  title={s.name}
                  aria-label={`Paint walls ${s.name}`}
                  onClick={() => update({ paint: s.value })}
                  className={`h-8 w-8 rounded-full border-2 cursor-pointer ${state.paint === s.value ? "border-citron" : "border-current/20"}`}
                  style={{ background: s.value }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Actions */}
        <section aria-label="Studio actions" className="flex flex-col gap-3 border-t border-current/15 pt-5">
          {selectedProduct ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm">
                <span className="font-serif">{selectedProduct.name}</span>{" "}
                <span className="opacity-60">
                  <Price price={selectedProduct.price} salePrice={selectedProduct.salePrice} unit={selectedProduct.priceUnit} />
                </span>
              </p>
              <Link href={`/calculator?design=${selectedProduct.slug}`} className="label text-citron hover:underline underline-offset-4 whitespace-nowrap">
                How many rolls?
              </Link>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="citron"
              size="sm"
              disabled={!selectedProduct || !selectedProduct.inStock}
              onClick={() => {
                if (!selectedProduct) return;
                addToCart(selectedProduct);
                showToast({ message: `${selectedProduct.name} added to cart`, texture: selectedProduct.texture, href: "/cart", hrefLabel: "View cart" });
              }}
            >
              Add design to cart
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-current"
              onClick={() => {
                try {
                  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
                  setHasSave(true);
                  showToast({ message: "Design saved on this device" });
                } catch {
                  showToast({ message: "Could not save on this device" });
                }
              }}
            >
              Save design
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-current"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl());
                  showToast({ message: "Share link copied to clipboard" });
                } catch {
                  showToast({ message: shareUrl() });
                }
              }}
            >
              Share
            </Button>
          </div>
          <div className="flex gap-4">
            {hasSave ? (
              <button
                type="button"
                className="label opacity-60 hover:opacity-100 cursor-pointer"
                onClick={() => {
                  try {
                    const raw = localStorage.getItem(SAVE_KEY);
                    if (raw) {
                      const parsed = JSON.parse(raw) as StudioState;
                      for (const w of wallIds) {
                        if (parsed.walls?.[w]?.design && !validSlugs.has(parsed.walls[w].design!)) {
                          parsed.walls[w].design = null;
                        }
                      }
                      setState({ ...defaultStudioState(parsed.room), ...parsed });
                      showToast({ message: "Saved design restored" });
                    }
                  } catch {
                    showToast({ message: "Could not restore the saved design" });
                  }
                }}
              >
                Restore saved design
              </button>
            ) : null}
            <button
              type="button"
              className="label opacity-60 hover:opacity-100 cursor-pointer"
              onClick={() => setState(defaultStudioState(state.room))}
            >
              Reset room
            </button>
          </div>
        </section>

        <RoomPhotoUpload texture={selectedProduct?.texture ?? null} />
      </div>
    </div>
  );
}
