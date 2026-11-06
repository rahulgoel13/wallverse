/**
 * WALLVERSE texture generator.
 * Emits seamless 1024x1024 SVG wallpaper textures into public/textures/.
 * Deterministic (seeded) so regeneration is stable.
 *
 * Run: node scripts/generate-textures.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "textures");
mkdirSync(OUT, { recursive: true });

const T = 1024;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const svg = (body, { bg }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${T}" height="${T}" viewBox="0 0 ${T} ${T}">` +
  `<rect width="${T}" height="${T}" fill="${bg}"/>` +
  body +
  `</svg>`;

const hexToRgb01 = (hex) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

/** Map grayscale noise through a sequence of color stops via feComponentTransfer. */
function duotoneTable(stops) {
  const chans = [0, 1, 2].map((c) =>
    stops.map((hex) => hexToRgb01(hex)[c].toFixed(3)).join(" ")
  );
  return (
    `<feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1"/>` +
    `<feComponentTransfer>` +
    `<feFuncR type="table" tableValues="${chans[0]}"/>` +
    `<feFuncG type="table" tableValues="${chans[1]}"/>` +
    `<feFuncB type="table" tableValues="${chans[2]}"/>` +
    `</feComponentTransfer>`
  );
}

/* ———————————————————— generators ———————————————————— */

function marble({ bg, stops, seed, freqX = 0.0035, freqY = 0.009, octaves = 4 }) {
  const grain = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" seed="${seed + 7}" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.4 0.4 0.4 0 0"/>
  </filter>`;
  return svg(
    `<defs>
      <filter id="m" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="${freqX} ${freqY}" numOctaves="${octaves}" seed="${seed}" stitchTiles="stitch"/>
        ${duotoneTable(stops)}
      </filter>${grain}
    </defs>
    <rect width="${T}" height="${T}" filter="url(#m)"/>
    <rect width="${T}" height="${T}" filter="url(#grain)" opacity="0.14"/>`,
    { bg }
  );
}

function concrete({ bg, stops, seed }) {
  return svg(
    `<defs>
      <filter id="c" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="5" seed="${seed}" stitchTiles="stitch"/>
        ${duotoneTable(stops)}
      </filter>
      <filter id="speck" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed + 3}" stitchTiles="stitch"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.5 0.5 0.5 -0.9 0"/>
      </filter>
    </defs>
    <rect width="${T}" height="${T}" filter="url(#c)"/>
    <rect width="${T}" height="${T}" filter="url(#speck)" opacity="0.1"/>`,
    { bg }
  );
}

function leafSprig(x, y, scale, rot, stem, leaf, leaf2) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})">
    <path d="M0 0 C 4 -22, 2 -44, 0 -64" fill="none" stroke="${stem}" stroke-width="2.4"/>
    <path d="M0 -14 C -14 -20, -22 -32, -20 -44 C -8 -40, -1 -28, 0 -14 Z" fill="${leaf}"/>
    <path d="M1 -26 C 14 -32, 22 -44, 20 -56 C 8 -52, 2 -40, 1 -26 Z" fill="${leaf2}"/>
    <path d="M0 -40 C -11 -46, -17 -56, -15 -66 C -5 -62, -1 -52, 0 -40 Z" fill="${leaf}"/>
    <path d="M0.5 -52 C 10 -58, 15 -68, 13 -78 C 4 -74, 1 -64, 0.5 -52 Z" fill="${leaf2}"/>
  </g>`;
}

function botanical({ bg, stem, leaf, leaf2, seed, cell = 256, scale = 1 }) {
  const rng = mulberry32(seed);
  let body = "";
  const n = T / cell;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cx = i * cell + cell / 2 + (rng() - 0.5) * cell * 0.25;
      const cy = j * cell + cell / 2 + (rng() - 0.5) * cell * 0.25;
      const rot = Math.floor(rng() * 8) * 45;
      const s = scale * (0.8 + rng() * 0.5);
      body += leafSprig(cx, cy, s, rot, stem, leaf, leaf2);
      if (rng() > 0.55) {
        body += `<circle cx="${cx + (rng() - 0.5) * 60}" cy="${cy + (rng() - 0.5) * 60}" r="${2 + rng() * 3}" fill="${stem}" opacity="0.8"/>`;
      }
    }
  }
  return svg(body, { bg });
}

function bloom(cx, cy, r, petals, fill, core, rot = 0) {
  let p = "";
  for (let i = 0; i < petals; i++) {
    const a = rot + (i * 360) / petals;
    p += `<ellipse cx="0" cy="${-r * 0.55}" rx="${r * 0.3}" ry="${r * 0.6}" fill="${fill}" transform="rotate(${a})"/>`;
  }
  return `<g transform="translate(${cx} ${cy})" opacity="0.96">${p}<circle r="${r * 0.18}" fill="${core}"/></g>`;
}

function floral({ bg, petal, petal2, core, vine, seed, tile = 512 }) {
  const rng = mulberry32(seed);
  let defsBody = "";
  const r1 = tile * 0.3;
  // center bloom + corner blooms (quartered at corners => seamless)
  defsBody += bloom(tile / 2, tile / 2, r1, 8, petal, core, rng() * 40);
  for (const [cx, cy] of [[0, 0], [tile, 0], [0, tile], [tile, tile]]) {
    defsBody += bloom(cx, cy, r1 * 0.72, 7, petal2, core, 20 + rng() * 40);
  }
  // small sprouts mid-edges (drawn at both opposing edges)
  const sprout = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 q 10 -30 0 -58 M0 -18 q -16 -8 -22 -26 M0 -30 q 16 -8 22 -26" stroke="${vine}" stroke-width="3" fill="none"/></g>`;
  defsBody += sprout(tile / 2, tile * 0.08, 180) + sprout(tile / 2, tile + tile * 0.08, 180);
  defsBody += sprout(tile * 0.08, tile / 2, 90) + sprout(tile + tile * 0.08, tile / 2, 90);
  return svg(
    `<defs><pattern id="p" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse">
      <rect width="${tile}" height="${tile}" fill="${bg}"/>${defsBody}
    </pattern></defs>
    <rect width="${T}" height="${T}" fill="url(#p)"/>`,
    { bg }
  );
}

function linen({ bg, warp, weft, seed }) {
  return svg(
    `<defs>
      <pattern id="w" width="14" height="14" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill="${bg}"/>
        <rect x="0" y="3" width="14" height="1.6" fill="${weft}" opacity="0.5"/>
        <rect x="0" y="10" width="14" height="1.2" fill="${weft}" opacity="0.35"/>
        <rect x="4" y="0" width="1.6" height="14" fill="${warp}" opacity="0.5"/>
        <rect x="11" y="0" width="1.2" height="14" fill="${warp}" opacity="0.3"/>
      </pattern>
      <filter id="n" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="${seed}" stitchTiles="stitch"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.3 0.3 0.3 0 0"/>
      </filter>
    </defs>
    <rect width="${T}" height="${T}" fill="url(#w)"/>
    <rect width="${T}" height="${T}" filter="url(#n)" opacity="0.12"/>`,
    { bg }
  );
}

function stripes({ bg, bands }) {
  // bands: [{w, color, opacity}] repeated horizontally
  const total = bands.reduce((s, b) => s + b.w, 0);
  let x = 0;
  let content = `<rect width="${total}" height="64" fill="${bg}"/>`;
  for (const b of bands) {
    content += `<rect x="${x}" width="${b.w}" height="64" fill="${b.color}" opacity="${b.opacity ?? 1}"/>`;
    x += b.w;
  }
  return svg(
    `<defs><pattern id="s" width="${total}" height="64" patternUnits="userSpaceOnUse">${content}</pattern></defs>
     <rect width="${T}" height="${T}" fill="url(#s)"/>`,
    { bg }
  );
}

function grid({ bg, line, dot, gap = 128, lw = 1.2 }) {
  return svg(
    `<defs><pattern id="g" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse">
      <rect width="${gap}" height="${gap}" fill="${bg}"/>
      <path d="M ${gap} 0 L 0 0 0 ${gap}" fill="none" stroke="${line}" stroke-width="${lw}"/>
      <circle cx="0" cy="0" r="3.5" fill="${dot}"/>
    </pattern></defs>
    <rect width="${T}" height="${T}" fill="url(#g)"/>`,
    { bg }
  );
}

function chevron({ bg, a, b, h = 96 }) {
  const w = 256;
  return svg(
    `<defs><pattern id="c" width="${w}" height="${h * 2}" patternUnits="userSpaceOnUse">
      <rect width="${w}" height="${h * 2}" fill="${bg}"/>
      <path d="M0 ${h} L ${w / 2} 0 L ${w} ${h} L ${w} ${h + h / 3} L ${w / 2} ${h / 3} L 0 ${h + h / 3} Z" fill="${a}"/>
      <path d="M0 ${2 * h} L ${w / 2} ${h} L ${w} ${2 * h} L ${w} ${2 * h + h / 3} L ${w / 2} ${h + h / 3} L 0 ${2 * h + h / 3} Z" fill="${b}"/>
      <path d="M0 0 L ${w / 2} ${-h} L ${w} 0 L ${w} ${h / 3} L ${w / 2} ${-h + h / 3} L 0 ${h / 3} Z" fill="${b}"/>
    </pattern></defs>
    <rect width="${T}" height="${T}" fill="url(#c)"/>`,
    { bg }
  );
}

function decoFans({ bg, rim, fill2, rows = 4 }) {
  const w = T / rows; // fan width
  const h = w / 2;
  let fan = "";
  for (let i = 5; i >= 1; i--) {
    const r = (w / 2) * (i / 5);
    fan += `<path d="M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0 Z" fill="${i % 2 ? fill2 : bg}" stroke="${rim}" stroke-width="2"/>`;
  }
  let body = `<defs><g id="fan">${fan}</g></defs>`;
  const cols = Math.ceil(T / w) + 1;
  const rws = Math.ceil(T / h) + 1;
  for (let r = 0; r < rws; r++) {
    const off = r % 2 ? w / 2 : 0;
    for (let c = -1; c < cols; c++) {
      body += `<use href="#fan" x="${c * w + w / 2 + off}" y="${(r + 1) * h}"/>`;
    }
  }
  return svg(body, { bg });
}

function liquid({ bg, tones, seed, blobs = 14, freq = 0.004 }) {
  const rng = mulberry32(seed);
  let shapes = "";
  for (let i = 0; i < blobs; i++) {
    const x = rng() * T;
    const y = rng() * T;
    const r = 90 + rng() * 240;
    const color = tones[Math.floor(rng() * tones.length)];
    const op = 0.55 + rng() * 0.4;
    for (const dx of [-T, 0, T]) {
      for (const dy of [-T, 0, T]) {
        shapes += `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="${color}" opacity="${op}"/>`;
      }
    }
  }
  return svg(
    `<defs>
      <filter id="d" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" stitchTiles="stitch" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="420" xChannelSelector="R" yChannelSelector="G"/>
        <feGaussianBlur stdDeviation="1.2"/>
      </filter>
    </defs>
    <g filter="url(#d)">${shapes}</g>`,
    { bg }
  );
}

function terrazzo({ bg, chips, seed, count = 150 }) {
  const rng = mulberry32(seed);
  let body = "";
  for (let i = 0; i < count; i++) {
    const x = rng() * T;
    const y = rng() * T;
    const s = 10 + rng() * 34;
    const color = chips[Math.floor(rng() * chips.length)];
    const rot = rng() * 360;
    const sides = 4 + Math.floor(rng() * 3);
    let pts = "";
    for (let k = 0; k < sides; k++) {
      const a = (k / sides) * Math.PI * 2 + rng() * 0.6;
      pts += `${(Math.cos(a) * s).toFixed(1)},${(Math.sin(a) * s * (0.6 + rng() * 0.6)).toFixed(1)} `;
    }
    for (const dx of [-T, 0, T]) {
      for (const dy of [-T, 0, T]) {
        body += `<polygon points="${pts}" fill="${color}" transform="translate(${x + dx} ${y + dy}) rotate(${rot})"/>`;
      }
    }
  }
  return svg(body, { bg });
}

function kids({ bg, tones, seed, tile = 256 }) {
  const rng = mulberry32(seed);
  const star = (s, c) =>
    `<path d="M0 ${-s} L ${s * 0.3} ${-s * 0.3} L ${s} 0 L ${s * 0.3} ${s * 0.3} L 0 ${s} L ${-s * 0.3} ${s * 0.3} L ${-s} 0 L ${-s * 0.3} ${-s * 0.3} Z" fill="${c}"/>`;
  const moon = (s, c) => `<path d="M ${s} 0 A ${s} ${s} 0 1 1 ${-s * 0.2} ${-s * 0.98} A ${s * 0.78} ${s * 0.78} 0 1 0 ${s} 0 Z" fill="${c}"/>`;
  const cloud = (s, c) =>
    `<g fill="${c}"><circle r="${s * 0.5}"/><circle cx="${s * 0.5}" cy="${s * 0.12}" r="${s * 0.38}"/><circle cx="${-s * 0.5}" cy="${s * 0.12}" r="${s * 0.36}"/><rect x="${-s * 0.75}" y="${s * 0.05}" width="${s * 1.5}" height="${s * 0.42}" rx="${s * 0.2}"/></g>`;
  const rocket = (s, c, c2) =>
    `<g><path d="M0 ${-s} C ${s * 0.5} ${-s * 0.4} ${s * 0.5} ${s * 0.3} ${s * 0.25} ${s * 0.6} L ${-s * 0.25} ${s * 0.6} C ${-s * 0.5} ${s * 0.3} ${-s * 0.5} ${-s * 0.4} 0 ${-s} Z" fill="${c}"/><circle cy="${-s * 0.2}" r="${s * 0.16}" fill="${bg}"/><path d="M ${-s * 0.25} ${s * 0.6} L ${-s * 0.5} ${s} L ${-s * 0.1} ${s * 0.75} Z M ${s * 0.25} ${s * 0.6} L ${s * 0.5} ${s} L ${s * 0.1} ${s * 0.75} Z" fill="${c2}"/></g>`;
  let content = `<rect width="${tile}" height="${tile}" fill="${bg}"/>`;
  const spots = [
    [tile * 0.25, tile * 0.25],
    [tile * 0.75, tile * 0.3],
    [tile * 0.3, tile * 0.75],
    [tile * 0.78, tile * 0.78],
    [tile * 0.52, tile * 0.52],
  ];
  const kinds = ["star", "moon", "cloud", "rocket", "star"];
  spots.forEach(([x, y], i) => {
    const c = tones[Math.floor(rng() * tones.length)];
    const c2 = tones[(Math.floor(rng() * tones.length) + 1) % tones.length];
    const s = 16 + rng() * 18;
    const rot = Math.floor(rng() * 4) * 15 - 20;
    const shape =
      kinds[i] === "star" ? star(s, c) : kinds[i] === "moon" ? moon(s * 0.8, c) : kinds[i] === "cloud" ? cloud(s, c) : rocket(s, c, c2);
    content += `<g transform="translate(${x} ${y}) rotate(${rot})">${shape}</g>`;
  });
  for (let i = 0; i < 7; i++) {
    content += `<circle cx="${rng() * tile}" cy="${rng() * tile}" r="${1.5 + rng() * 2}" fill="${tones[Math.floor(rng() * tones.length)]}" opacity="0.7"/>`;
  }
  return svg(
    `<defs><pattern id="k" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse">${content}</pattern></defs>
     <rect width="${T}" height="${T}" fill="url(#k)"/>`,
    { bg }
  );
}

function muralArcs({ bg, tones, rows = 5 }) {
  // Overlapping arch rows — an artistic, non-directional mural that still tiles vertically.
  let body = "";
  const rh = T / rows;
  for (let r = 0; r <= rows; r++) {
    const cols = 4 + (r % 2);
    const w = T / cols;
    for (let c = -1; c <= cols; c++) {
      const color = tones[(r * 3 + c + tones.length * 4) % tones.length];
      const x = c * w + (r % 2 ? w / 2 : 0);
      body += `<path d="M ${x} ${r * rh} a ${w / 2} ${w / 2} 0 0 1 ${w} 0 l 0 ${rh} l ${-w} 0 Z" fill="${color}" opacity="0.92"/>`;
    }
  }
  return svg(body, { bg });
}

function muralSun({ bg, sun, rays, hills, hills2 }) {
  let rayPaths = "";
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const x1 = 512 + Math.cos(a) * 240;
    const y1 = 430 + Math.sin(a) * 240;
    const x2 = 512 + Math.cos(a) * (300 + (i % 2) * 60);
    const y2 = 430 + Math.sin(a) * (300 + (i % 2) * 60);
    rayPaths += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${rays}" stroke-width="5"/>`;
  }
  return svg(
    `<circle cx="512" cy="430" r="190" fill="${sun}"/>
     ${rayPaths}
     <path d="M0 780 Q 256 640 512 780 T 1024 780 L 1024 1024 L 0 1024 Z" fill="${hills}"/>
     <path d="M0 880 Q 340 760 680 880 T 1024 860 L 1024 1024 L 0 1024 Z" fill="${hills2}"/>`,
    { bg }
  );
}

/* ———————————————————— the catalogue of textures ———————————————————— */

const textures = {
  /* Botanical */
  "midnight-garden": () =>
    botanical({ bg: "#122017", stem: "#6f8f5e", leaf: "#2e5c3f", leaf2: "#d6ff72", seed: 11, cell: 256 }),
  "velvet-botanica": () =>
    botanical({ bg: "#2b1e24", stem: "#b99a6a", leaf: "#7a4a5a", leaf2: "#c98a7a", seed: 23, cell: 204.8 }),
  "the-floating-forest": () =>
    botanical({ bg: "#e9e4d5", stem: "#777c61", leaf: "#9aa37f", leaf2: "#5c6648", seed: 37, cell: 341.33, scale: 1.5 }),

  /* Abstract */
  "fluid-earth": () =>
    liquid({ bg: "#d9d0c1", tones: ["#b99a6a", "#8a6f4d", "#777c61", "#efe7d8"], seed: 41 }),
  "cosmic-bloom": () =>
    liquid({ bg: "#131325", tones: ["#4b3a7a", "#8a5fb0", "#d6ff72", "#2a2a4d"], seed: 57, blobs: 16, freq: 0.005 }),
  "liquid-terracotta": () =>
    liquid({ bg: "#c96f4a", tones: ["#a8512f", "#e2a177", "#f4e4d4", "#8a3b22"], seed: 63, blobs: 12, freq: 0.003 }),

  /* Marble & Stone */
  "celestial-marble": () =>
    marble({ bg: "#f4f0e8", stops: ["#f6f2ea", "#ded5c4", "#f4f0e8", "#b9a98c", "#f6f2ea"], seed: 5 }),
  "sandstone-reverie": () =>
    marble({ bg: "#e2cfae", stops: ["#e8d7b8", "#caa872", "#e2cfae", "#a97f4e", "#e8d7b8"], seed: 19, freqX: 0.003, freqY: 0.006 }),
  "stone-strata": () =>
    concrete({ bg: "#9b968c", stops: ["#a7a299", "#89847a", "#9b968c", "#746f66"], seed: 29 }),

  /* Luxury */
  "golden-geometry": () => decoFans({ bg: "#181817", rim: "#b99a6a", fill2: "#2a2822", rows: 4 }),
  "champagne-deco": () => decoFans({ bg: "#f0e8d8", rim: "#b99a6a", fill2: "#e2d4b8", rows: 5 }),
  "gilded-meridian": () =>
    stripes({
      bg: "#1c1a16",
      bands: [
        { w: 84, color: "#1c1a16" },
        { w: 4, color: "#b99a6a" },
        { w: 22, color: "#2a2620" },
        { w: 2, color: "#d6c49a" },
        { w: 16, color: "#1c1a16" },
      ],
    }),

  /* Geometric */
  "infinite-lines": () =>
    stripes({
      bg: "#f4f0e8",
      bands: [
        { w: 10, color: "#10100f" },
        { w: 54, color: "#f4f0e8" },
        { w: 2.5, color: "#10100f" },
        { w: 28, color: "#f4f0e8" },
      ],
    }),
  "modular-grid": () => grid({ bg: "#eee9dd", line: "#8f8a7c", dot: "#10100f", gap: 128 }),
  "chevron-cascade": () => chevron({ bg: "#1d2320", a: "#777c61", b: "#39423a", h: 128 }),

  /* Floral */
  "orchid-eclipse": () =>
    floral({ bg: "#1c1420", petal: "#8a4a6a", petal2: "#5a3a56", core: "#d6ff72", vine: "#6a5a74", seed: 71 }),
  "forgotten-paradise": () =>
    floral({ bg: "#13241f", petal: "#c96f4a", petal2: "#b99a6a", core: "#f4f0e8", vine: "#4f6f5a", seed: 83, tile: 341.33 }),
  "bloom-archive": () =>
    floral({ bg: "#efe9db", petal: "#d9a0a8", petal2: "#b7c0a2", core: "#8a6f4d", vine: "#9aa38a", seed: 97, tile: 256 }),

  /* Minimal */
  "limestone-weave": () => linen({ bg: "#d9d0c1", warp: "#b9ae9a", weft: "#c6bba8", seed: 101 }),
  "quiet-plaster": () =>
    concrete({ bg: "#e8e2d4", stops: ["#ece6d9", "#dcd4c2", "#e8e2d4", "#cfc6b2"], seed: 113 }),
  "olive-horizon": () =>
    stripes({
      bg: "#e9e4d5",
      bands: [
        { w: 160, color: "#e9e4d5" },
        { w: 160, color: "#c9c4ae" },
        { w: 160, color: "#9aa083" },
      ],
    }),

  /* Kids */
  "paper-rockets": () => kids({ bg: "#e8f0f2", tones: ["#3a6ea5", "#e2574c", "#f0b429", "#4a9b7f"], seed: 131 }),
  "starfall-nursery": () => kids({ bg: "#1d2440", tones: ["#f0d060", "#e8e2d4", "#8fb3d9", "#d98fb3"], seed: 139, tile: 204.8 }),

  /* Nature */
  "monsoon-canopy": () =>
    botanical({ bg: "#0f2a22", stem: "#3f7a5c", leaf: "#1f5c42", leaf2: "#77c49a", seed: 149, cell: 170.67, scale: 1.2 }),
  "golden-savanna": () =>
    marble({ bg: "#d9b98a", stops: ["#e2c99e", "#b98f56", "#d9b98a", "#8a6232", "#e2c99e"], seed: 151, freqX: 0.002, freqY: 0.012, octaves: 3 }),

  /* Artistic Murals */
  "aurora-mural": () => muralSun({ bg: "#14202b", sun: "#e8b45a", rays: "#b99a6a", hills: "#2a4a44", hills2: "#16302c" }),
  "terracotta-dawn": () => muralArcs({ bg: "#efe2d2", tones: ["#c96f4a", "#b99a6a", "#8a5a44", "#e2c9ae", "#777c61"] }),

  /* Extra: terrazzo for luxury/minimal breadth */
  "palazzo-terrazzo": () =>
    terrazzo({ bg: "#efe9dd", chips: ["#10100f", "#b99a6a", "#777c61", "#c96f4a", "#9b968c"], seed: 163 }),
};

let count = 0;
for (const [slug, gen] of Object.entries(textures)) {
  const content = gen();
  writeFileSync(join(OUT, `${slug}.svg`), content);
  count++;
}
console.log(`Generated ${count} textures into public/textures/`);
