import { useId } from "react";

/**
 * A perspective room drawn in SVG whose walls are filled with a real product
 * texture via <pattern>. Used by the takeover reveal, the transformation
 * gallery and product previews — the same asset the 3D scenes use.
 */
export function RoomIllustration({
  texture,
  mode = "papered",
  wallPaint = "#dcd6c8",
  accentOnly = false,
  tile = 170,
  className = "",
  title,
}: {
  texture?: string;
  mode?: "papered" | "plain";
  wallPaint?: string;
  accentOnly?: boolean;
  tile?: number;
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/[:]/g, "");
  const pid = `wp-${uid}`;
  const papered = mode === "papered" && texture;

  const backFill = papered ? `url(#${pid})` : wallPaint;
  const sideFill = papered && !accentOnly ? `url(#${pid})` : wallPaint;

  return (
    <svg
      viewBox="0 0 1200 800"
      className={className}
      role="img"
      aria-label={title ?? (papered ? "Room with wallpaper applied" : "Room with plain painted walls")}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id={pid} patternUnits="userSpaceOnUse" width={tile} height={tile}>
          {texture ? <image href={texture} width={tile} height={tile} /> : null}
        </pattern>
        <linearGradient id={`floor-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cbbfa8" />
          <stop offset="1" stopColor="#a89a80" />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor="#fff8e8" stopOpacity="0.28" />
          <stop offset="1" stopColor="#10100f" stopOpacity="0.38" />
        </radialGradient>
      </defs>

      {/* ceiling */}
      <polygon points="0,0 1200,0 950,140 250,140" fill="#efeadd" />
      {/* back wall */}
      <rect x="250" y="140" width="700" height="460" fill={backFill} />
      {/* side walls */}
      <polygon points="0,0 250,140 250,600 0,800" fill={sideFill} />
      <polygon points="1200,0 950,140 950,600 1200,800" fill={sideFill} />
      {/* wall shading for depth */}
      <polygon points="0,0 250,140 250,600 0,800" fill="#10100f" opacity="0.32" />
      <polygon points="1200,0 950,140 950,600 1200,800" fill="#10100f" opacity="0.18" />
      {/* floor */}
      <polygon points="0,800 250,600 950,600 1200,800" fill={`url(#floor-${uid})`} />
      {/* skirting */}
      <polygon points="250,600 950,600 950,588 250,588" fill="#efeadd" />
      <polygon points="0,800 250,600 250,588 0,784" fill="#d8d2c2" />
      <polygon points="1200,800 950,600 950,588 1200,784" fill="#d8d2c2" />

      {/* window on the right wall */}
      <polygon points="1030,180 1160,110 1160,420 1030,440" fill="#1c2430" opacity="0.9" />
      <polygon points="1038,192 1152,126 1152,408 1038,428" fill="#9fb4c4" opacity="0.85" />
      <line x1="1095" y1="158" x2="1095" y2="418" stroke="#1c2430" strokeWidth="8" />

      {/* rug */}
      <ellipse cx="600" cy="690" rx="260" ry="56" fill="#10100f" opacity="0.16" />
      <ellipse cx="600" cy="684" rx="238" ry="48" fill="#b9ad96" opacity="0.7" />

      {/* sofa */}
      <g>
        <ellipse cx="600" cy="648" rx="200" ry="26" fill="#10100f" opacity="0.28" />
        <rect x="430" y="500" width="340" height="120" rx="18" fill="#2d2b26" />
        <rect x="450" y="452" width="300" height="80" rx="16" fill="#3a372f" />
        <rect x="458" y="508" width="136" height="36" rx="10" fill="#45413a" />
        <rect x="606" y="508" width="136" height="36" rx="10" fill="#45413a" />
        <rect x="414" y="488" width="40" height="110" rx="12" fill="#262420" />
        <rect x="746" y="488" width="40" height="110" rx="12" fill="#262420" />
        <rect x="520" y="470" width="56" height="44" rx="8" fill="#b99a6a" opacity="0.9" />
        <rect x="620" y="470" width="56" height="44" rx="8" fill="#777c61" opacity="0.9" />
      </g>

      {/* floor lamp */}
      <g>
        <rect x="316" y="430" width="6" height="190" fill="#1a1916" />
        <ellipse cx="319" cy="624" rx="30" ry="7" fill="#1a1916" />
        <path d="M296 430 L342 430 L334 384 L304 384 Z" fill="#e8ddc2" />
        <ellipse cx="319" cy="470" rx="34" ry="40" fill="#ffe9b8" opacity="0.18" />
      </g>

      {/* plant */}
      <g>
        <path d="M858 560 L886 560 L880 622 L864 622 Z" fill="#8a6f4d" />
        <path d="M872 560 C 850 520 842 500 852 470 C 872 496 876 520 872 560 Z" fill="#4f6f5a" />
        <path d="M872 560 C 894 516 904 502 898 468 C 878 492 870 522 872 560 Z" fill="#3f5c49" />
        <path d="M872 560 C 866 528 856 516 836 506 C 846 534 858 548 872 560 Z" fill="#5c7a62" />
      </g>

      {/* picture frame on back wall */}
      <rect x="760" y="230" width="110" height="140" fill="none" stroke="#b99a6a" strokeWidth="6" opacity="0.85" />

      {/* light */}
      <rect width="1200" height="800" fill={`url(#glow-${uid})`} />
    </svg>
  );
}
