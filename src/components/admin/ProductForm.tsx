"use client";

import { useActionState, useState } from "react";
import { upsertProduct } from "@/app/admin/actions";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Button } from "@/components/ui/Button";
import type { Collection, Product } from "@prisma/client";

const inputCls =
  "w-full border border-ivory/25 bg-transparent px-3 py-2.5 text-sm focus:border-citron outline-none";

function F({ label, children, span = false }: { label: string; children: React.ReactNode; span?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${span ? "md:col-span-2" : ""}`}>
      <span className="label opacity-60">{label}</span>
      {children}
    </label>
  );
}

export function ProductForm({
  product,
  collections,
  textures,
}: {
  product: Product | null;
  collections: Collection[];
  textures: string[];
}) {
  const [state, action, pending] = useActionState(upsertProduct, null);
  const [texture, setTexture] = useState(product?.texture ?? textures[0] ?? "");
  const p = product;

  return (
    <form action={action} className="grid gap-5 md:grid-cols-2 max-w-4xl">
      {p ? <input type="hidden" name="id" value={p.id} /> : null}
      <F label="Name">
        <input name="name" defaultValue={p?.name} required className={inputCls} />
      </F>
      <F label="SKU">
        <input name="sku" defaultValue={p?.sku} required className={inputCls} />
      </F>
      <F label="Slug">
        <input name="slug" defaultValue={p?.slug} required pattern="[a-z0-9-]+" className={inputCls} />
      </F>
      <F label="Collection">
        <select name="collectionId" defaultValue={p?.collectionId ?? collections[0]?.id} className={`${inputCls} [&>option]:bg-obsidian`}>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </F>
      <F label="Description" span>
        <textarea name="description" defaultValue={p?.description} required rows={3} className={inputCls} />
      </F>
      <F label="Price (INR)">
        <input name="price" type="number" min={1} defaultValue={p?.price ?? 3500} required className={inputCls} />
      </F>
      <F label="Sale price (optional)">
        <input name="salePrice" type="number" min={1} defaultValue={p?.salePrice ?? ""} className={inputCls} />
      </F>
      <F label="Material">
        <input name="material" defaultValue={p?.material ?? "Non-woven fleece"} required className={inputCls} />
      </F>
      <F label="Finish">
        <input name="finish" defaultValue={p?.finish ?? "Matte"} required className={inputCls} />
      </F>
      <F label="Colour family">
        <input name="colorFamily" defaultValue={p?.colorFamily} required className={inputCls} />
      </F>
      <F label="Style">
        <input name="style" defaultValue={p?.style} required className={inputCls} />
      </F>
      <F label="Roll width (cm)">
        <input name="rollWidthCm" type="number" step="0.1" min={1} defaultValue={p?.rollWidthCm ?? 53} required className={inputCls} />
      </F>
      <F label="Roll length (m)">
        <input name="rollLengthM" type="number" step="0.1" min={0.5} defaultValue={p?.rollLengthM ?? 10} required className={inputCls} />
      </F>
      <F label="Coverage (m²)">
        <input name="coverageSqm" type="number" step="0.1" min={0.5} defaultValue={p?.coverageSqm ?? 5.3} required className={inputCls} />
      </F>
      <F label="Pattern repeat (cm, 0 = none)">
        <input name="patternRepeatCm" type="number" step="0.1" min={0} defaultValue={p?.patternRepeatCm ?? 0} required className={inputCls} />
      </F>
      <F label="Pattern match">
        <input name="patternMatch" defaultValue={p?.patternMatch ?? "Free match"} required className={inputCls} />
      </F>
      <F label="Price unit">
        <input name="priceUnit" defaultValue={p?.priceUnit ?? "per roll"} required className={inputCls} />
      </F>
      <F label="Accent colour (hex)">
        <input name="accent" defaultValue={p?.accent ?? "#b99a6a"} pattern="#[0-9a-fA-F]{6}" required className={inputCls} />
      </F>
      <F label="Popularity (0–100)">
        <input name="popularity" type="number" min={0} max={100} defaultValue={p?.popularity ?? 50} required className={inputCls} />
      </F>
      <F label="Texture asset" span>
        <div className="flex gap-3 items-start">
          <select
            name="texture"
            value={texture}
            onChange={(e) => setTexture(e.target.value)}
            className={`${inputCls} [&>option]:bg-obsidian flex-1`}
          >
            {textures.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            {!textures.includes(texture) && texture ? <option value={texture}>{texture}</option> : null}
          </select>
          {texture ? <TexturePreview texture={texture} tileSize={80} className="h-16 w-16 shrink-0 border border-ivory/15" /> : null}
        </div>
      </F>
      <F label="Installation notes" span>
        <textarea name="installationNotes" defaultValue={p?.installationNotes ?? "Paste-the-wall."} required rows={2} className={inputCls} />
      </F>
      <F label="Related slugs (comma-separated)" span>
        <input name="relatedSlugs" defaultValue={p?.relatedSlugs} className={inputCls} />
      </F>
      <div className="flex flex-wrap gap-6 md:col-span-2">
        {(["inStock", "featured", "newArrival"] as const).map((k) => (
          <label key={k} className="flex items-center gap-2 label opacity-80 cursor-pointer">
            <input
              type="checkbox"
              name={k}
              defaultChecked={p ? Boolean(p[k]) : k === "inStock"}
              className="accent-citron h-4 w-4"
            />
            {k === "inStock" ? "In stock" : k === "featured" ? "Featured" : "New arrival"}
          </label>
        ))}
      </div>
      {state && !state.ok ? (
        <p role="alert" className="text-sm text-error md:col-span-2">
          {state.error}
        </p>
      ) : null}
      <div className="md:col-span-2">
        <Button type="submit" variant="citron" disabled={pending}>
          {pending ? "Saving…" : p ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
