"use client";

import { useEffect, useRef, useState } from "react";
import { TexturePreview } from "@/components/ui/TexturePreview";

/**
 * Reference photo workflow. The image stays on the visitor's device and is
 * shown side-by-side with the chosen design — it is NOT perspective-mapped
 * onto the photo, and the interface says so honestly.
 */
export function RoomPhotoUpload({ texture }: { texture: string | null }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Object URLs must be revoked.
  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  return (
    <div className="border border-current/15 p-4">
      <p className="label opacity-60 mb-2">Your room photo</p>
      {photo ? (
        <div>
          <div className="grid grid-cols-2 gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="Your uploaded room" className="aspect-[4/3] w-full object-cover" />
            {texture ? (
              <TexturePreview texture={texture} tileSize={120} alt="Selected wallpaper design" className="aspect-[4/3]" />
            ) : (
              <div className="aspect-[4/3] border border-current/15 flex items-center justify-center">
                <p className="label opacity-40 text-center px-2">Pick a design to compare</p>
              </div>
            )}
          </div>
          <p className="mt-2 text-[0.6875rem] leading-relaxed opacity-60">
            Side-by-side reference preview. The design is not mapped onto your photo — use the 3D
            room above for perspective. Your photo never leaves this device.
          </p>
          <button
            type="button"
            onClick={() => setPhoto(null)}
            className="label mt-2 opacity-60 hover:opacity-100 cursor-pointer"
          >
            Remove photo
          </button>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full border border-dashed border-current/30 py-6 text-center hover:border-current/60 transition-colors cursor-pointer"
          >
            <span className="label opacity-70">Add a photo of your room</span>
            <span className="block mt-1 text-[0.6875rem] opacity-50">Stays on your device · JPG or PNG</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Upload a photo of your room"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPhoto(URL.createObjectURL(file));
            }}
          />
        </div>
      )}
    </div>
  );
}
