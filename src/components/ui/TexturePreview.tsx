import type { CSSProperties, ReactNode } from "react";

/**
 * Renders a wallpaper texture as a repeating CSS tile — the 2D counterpart of
 * the 3D material system. The same SVG asset is used in both.
 */
export function TexturePreview({
  texture,
  tileSize = 220,
  className = "",
  style,
  children,
  alt,
}: {
  texture: string;
  tileSize?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  alt?: string;
}) {
  return (
    <div
      className={`texture-tile ${className}`}
      role={alt ? "img" : undefined}
      aria-label={alt}
      style={{
        backgroundImage: `url(${texture})`,
        ["--tile-size" as string]: `${tileSize}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
