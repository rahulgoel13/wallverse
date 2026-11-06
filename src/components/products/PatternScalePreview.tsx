"use client";

import { useState } from "react";
import { TexturePreview } from "@/components/ui/TexturePreview";

/** Live repeating-texture preview with an adjustable visual tile size. */
export function PatternScalePreview({ texture, name }: { texture: string; name: string }) {
  const [tile, setTile] = useState(220);
  return (
    <div>
      <TexturePreview
        texture={texture}
        tileSize={tile}
        alt={`${name} repeating pattern preview`}
        className="aspect-[4/3] w-full border border-current/15"
      />
      <label className="label mt-3 flex items-center gap-3 opacity-60">
        <span className="whitespace-nowrap">Pattern zoom</span>
        <input
          type="range"
          min={100}
          max={420}
          value={tile}
          onChange={(e) => setTile(Number(e.target.value))}
          className="w-full accent-citron"
          aria-label="Adjust pattern preview zoom"
        />
      </label>
    </div>
  );
}
