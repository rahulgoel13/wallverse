/**
 * WALLVERSE demonstration catalogue — the single source used to seed the database.
 * These are clearly-labelled demo products, not verified seller inventory.
 */

export interface CollectionSeed {
  id: string;
  slug: string;
  name: string;
  description: string;
  accent: string;
  order: number;
}

export interface ProductSeed {
  sku: string;
  slug: string;
  name: string;
  collection: string; // collection slug
  description: string;
  price: number; // INR
  salePrice?: number;
  material: string;
  finish: string;
  colorFamily: string;
  style: string;
  rollWidthCm: number;
  rollLengthM: number;
  coverageSqm: number;
  patternRepeatCm: number;
  patternMatch: string;
  priceUnit: string;
  accent: string;
  inStock: boolean;
  featured: boolean;
  newArrival: boolean;
  popularity: number; // 0–100, demo sort weight
  installationNotes: string;
  related: string[]; // product slugs
}

export const collections: CollectionSeed[] = [
  { id: "col-botanical", slug: "botanical", name: "The Botanical World", order: 1, accent: "#d6ff72", description: "Gardens that never close. Fine foliage, midnight greens and hand-drawn sprigs that turn any wall into an evergreen landscape." },
  { id: "col-abstract", slug: "abstract", name: "Abstract Dimensions", order: 2, accent: "#8a5fb0", description: "Liquid colour, displaced geometry and patterns that refuse to sit still. For rooms that want a point of view." },
  { id: "col-marble-stone", slug: "marble-stone", name: "The Marble Archive", order: 3, accent: "#b9a98c", description: "Quarried light. Veined marbles, warm sandstones and raw strata, rendered at architectural scale." },
  { id: "col-luxury", slug: "luxury", name: "Luxury Textures", order: 4, accent: "#b99a6a", description: "Champagne metallics, deco fans and gilded lines. Surfaces that behave like jewellery." },
  { id: "col-geometric", slug: "geometric", name: "Geometric Systems", order: 5, accent: "#10100f", description: "Grids, chevrons and infinite lines. Order as ornament." },
  { id: "col-floral", slug: "floral", name: "The Floral Section", order: 6, accent: "#d9a0a8", description: "Oversized blooms and quiet gardens — florals with structure, never sugar." },
  { id: "col-minimal", slug: "minimal", name: "Minimal Grounds", order: 7, accent: "#d9d0c1", description: "Weaves, plasters and horizons. The quietest designs in the archive, built from texture alone." },
  { id: "col-kids", slug: "kids", name: "The Imaginarium", order: 8, accent: "#f0b429", description: "Rockets, starfalls and paper skies. Rooms for people still learning that walls are supposed to be boring." },
  { id: "col-nature", slug: "nature", name: "Open Nature", order: 9, accent: "#3f7a5c", description: "Monsoon canopies and golden savannas — landscapes compressed into pattern." },
  { id: "col-artistic-murals", slug: "artistic-murals", name: "The Art Wall", order: 10, accent: "#c96f4a", description: "Full-wall murals painted in panels. One wall becomes the picture." },
];

const d = {
  nonwoven: "Non-woven fleece",
  vinyl: "Heavy-duty vinyl on non-woven backing",
  paper: "FSC-certified smooth paper",
  grass: "Grasscloth-effect non-woven",
};

export const products: ProductSeed[] = [
  /* ————— Botanical ————— */
  {
    sku: "WV-001", slug: "midnight-garden", name: "Midnight Garden", collection: "botanical",
    description: "A garden seen after dark: deep evergreen grounds, inked foliage and sudden flashes of citron. Reads as texture from across the room and as botany up close.",
    price: 4200, material: d.nonwoven, finish: "Matte", colorFamily: "Green", style: "Botanical",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 64, patternMatch: "Offset match",
    priceUnit: "per roll", accent: "#d6ff72", inStock: true, featured: true, newArrival: false, popularity: 92,
    installationNotes: "Paste-the-wall. Align sprig rows at eye level for the strongest effect.",
    related: ["monsoon-canopy", "velvet-botanica", "forgotten-paradise"],
  },
  {
    sku: "WV-002", slug: "velvet-botanica", name: "Velvet Botanica", collection: "botanical",
    description: "Burgundy dusk with champagne stems — a botanical drawn in low light for dining rooms and libraries.",
    price: 4600, salePrice: 3900, material: d.nonwoven, finish: "Soft-sheen", colorFamily: "Burgundy", style: "Botanical",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 51, patternMatch: "Offset match",
    priceUnit: "per roll", accent: "#b99a6a", inStock: true, featured: false, newArrival: false, popularity: 71,
    installationNotes: "Paste-the-wall. Soft-sheen finish rewards warm, low-angle lighting.",
    related: ["midnight-garden", "orchid-eclipse", "gilded-meridian"],
  },
  {
    sku: "WV-003", slug: "the-floating-forest", name: "The Floating Forest", collection: "botanical",
    description: "Oversized fronds drift across warm ivory — an airy botanical that keeps small rooms breathing.",
    price: 3800, material: d.paper, finish: "Matte", colorFamily: "Ivory", style: "Botanical",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 85, patternMatch: "Straight match",
    priceUnit: "per roll", accent: "#777c61", inStock: true, featured: false, newArrival: true, popularity: 64,
    installationNotes: "Paste-the-paper. Large repeat — order a sample to check scale in your room.",
    related: ["bloom-archive", "olive-horizon", "midnight-garden"],
  },

  /* ————— Abstract ————— */
  {
    sku: "WV-010", slug: "fluid-earth", name: "Fluid Earth", collection: "abstract",
    description: "Limestone, champagne and olive poured together and caught mid-flow. Every strip lands differently; the wall reads as one continuous pour.",
    price: 5200, material: d.vinyl, finish: "Satin", colorFamily: "Earth", style: "Abstract",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 102, patternMatch: "Free match",
    priceUnit: "per roll", accent: "#b99a6a", inStock: true, featured: true, newArrival: false, popularity: 88,
    installationNotes: "Free match — no pattern alignment needed between strips.",
    related: ["liquid-terracotta", "sandstone-reverie", "cosmic-bloom"],
  },
  {
    sku: "WV-011", slug: "cosmic-bloom", name: "Cosmic Bloom", collection: "abstract",
    description: "Nebular violets split by a single citron fault line. A dark abstract for media rooms and night-time spaces.",
    price: 5600, material: d.nonwoven, finish: "Matte", colorFamily: "Violet", style: "Abstract",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 102, patternMatch: "Free match",
    priceUnit: "per roll", accent: "#d6ff72", inStock: true, featured: false, newArrival: true, popularity: 77,
    installationNotes: "Free match. Dark grounds: use fresh blades to keep cut edges clean.",
    related: ["cosmic-bloom", "orchid-eclipse", "fluid-earth"],
  },
  {
    sku: "WV-012", slug: "liquid-terracotta", name: "Liquid Terracotta", collection: "abstract",
    description: "Sun-baked clay in motion — terracotta, apricot and cream folded like slow lava.",
    price: 4900, material: d.vinyl, finish: "Satin", colorFamily: "Terracotta", style: "Abstract",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 102, patternMatch: "Free match",
    priceUnit: "per roll", accent: "#c96f4a", inStock: true, featured: false, newArrival: false, popularity: 69,
    installationNotes: "Free match. Wipeable vinyl surface — suitable for hallways.",
    related: ["fluid-earth", "terracotta-dawn", "golden-savanna"],
  },

  /* ————— Marble & Stone ————— */
  {
    sku: "WV-020", slug: "celestial-marble", name: "Celestial Marble", collection: "marble-stone",
    description: "Ivory marble with champagne veining at one-to-one scale. The quarry finish without the quarry weight.",
    price: 6200, material: d.vinyl, finish: "Soft-sheen", colorFamily: "Ivory", style: "Stone",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 0, patternMatch: "Free match",
    priceUnit: "per roll", accent: "#b9a98c", inStock: true, featured: true, newArrival: false, popularity: 95,
    installationNotes: "Free match. Butt joints only — do not overlap-and-cut on sheen finishes.",
    related: ["sandstone-reverie", "quiet-plaster", "stone-strata"],
  },
  {
    sku: "WV-021", slug: "sandstone-reverie", name: "Sandstone Reverie", collection: "marble-stone",
    description: "Banded desert stone in honey and umber. Horizontal strata that widen a room without a single straight line.",
    price: 5400, material: d.grass, finish: "Textured", colorFamily: "Sand", style: "Stone",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 0, patternMatch: "Free match",
    priceUnit: "per roll", accent: "#a97f4e", inStock: true, featured: false, newArrival: false, popularity: 73,
    installationNotes: "Reverse-hang alternate strips for the most even texture read.",
    related: ["celestial-marble", "golden-savanna", "fluid-earth"],
  },
  {
    sku: "WV-022", slug: "stone-strata", name: "Stone Strata", collection: "marble-stone",
    description: "Raw cast concrete with honest speckle and shutter marks. Brutalism, domesticated.",
    price: 4400, material: d.vinyl, finish: "Matte", colorFamily: "Grey", style: "Stone",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 0, patternMatch: "Free match",
    priceUnit: "per roll", accent: "#746f66", inStock: true, featured: false, newArrival: false, popularity: 61,
    installationNotes: "Free match. Pairs well with timber skirting and warm light.",
    related: ["quiet-plaster", "celestial-marble", "modular-grid"],
  },

  /* ————— Luxury ————— */
  {
    sku: "WV-030", slug: "golden-geometry", name: "Golden Geometry", collection: "luxury",
    description: "Art-deco fans traced in champagne over near-black. The wall equivalent of a tailored dinner jacket.",
    price: 6800, material: d.nonwoven, finish: "Metallic", colorFamily: "Black & Gold", style: "Deco",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 32, patternMatch: "Straight match",
    priceUnit: "per roll", accent: "#b99a6a", inStock: true, featured: true, newArrival: false, popularity: 90,
    installationNotes: "Straight match at 32 cm. Metallic inks: avoid harsh downlighting directly above.",
    related: ["champagne-deco", "gilded-meridian", "midnight-garden"],
  },
  {
    sku: "WV-031", slug: "champagne-deco", name: "Champagne Deco", collection: "luxury",
    description: "The same deco geometry poured in daylight — ivory grounds, soft gold scallops.",
    price: 6400, salePrice: 5700, material: d.nonwoven, finish: "Metallic", colorFamily: "Champagne", style: "Deco",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 26, patternMatch: "Straight match",
    priceUnit: "per roll", accent: "#b99a6a", inStock: true, featured: false, newArrival: false, popularity: 68,
    installationNotes: "Straight match at 26 cm. Order 10% extra for pattern alignment.",
    related: ["golden-geometry", "celestial-marble", "bloom-archive"],
  },
  {
    sku: "WV-032", slug: "gilded-meridian", name: "Gilded Meridian", collection: "luxury",
    description: "Fine gold meridians over espresso — a pinstripe for architecture.",
    price: 5800, material: d.nonwoven, finish: "Metallic", colorFamily: "Brown & Gold", style: "Stripe",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 12.8, patternMatch: "Straight match",
    priceUnit: "per roll", accent: "#d6c49a", inStock: true, featured: false, newArrival: true, popularity: 58,
    installationNotes: "Plumb the first strip carefully — stripes forgive nothing.",
    related: ["golden-geometry", "infinite-lines", "velvet-botanica"],
  },

  /* ————— Geometric ————— */
  {
    sku: "WV-040", slug: "infinite-lines", name: "Infinite Lines", collection: "geometric",
    description: "Ink bars of two weights on warm ivory. A rhythm, not a pattern — it recalibrates whole rooms.",
    price: 3600, material: d.paper, finish: "Matte", colorFamily: "Black & Ivory", style: "Stripe",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 9.5, patternMatch: "Free match",
    priceUnit: "per roll", accent: "#10100f", inStock: true, featured: true, newArrival: false, popularity: 85,
    installationNotes: "Free match vertically. Check walls for plumb before starting.",
    related: ["modular-grid", "gilded-meridian", "olive-horizon"],
  },
  {
    sku: "WV-041", slug: "modular-grid", name: "Modular Grid", collection: "geometric",
    description: "A drafting grid with inked nodes — the quiet confidence of graph paper at room scale.",
    price: 3400, material: d.paper, finish: "Matte", colorFamily: "Ivory", style: "Grid",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 12.8, patternMatch: "Straight match",
    priceUnit: "per roll", accent: "#8f8a7c", inStock: true, featured: false, newArrival: false, popularity: 54,
    installationNotes: "Straight match. Level the first horizontal line against a laser level.",
    related: ["infinite-lines", "stone-strata", "quiet-plaster"],
  },
  {
    sku: "WV-042", slug: "chevron-cascade", name: "Chevron Cascade", collection: "geometric",
    description: "Deep forest chevrons falling in alternating weights — directional, dramatic, disciplined.",
    price: 4100, material: d.nonwoven, finish: "Matte", colorFamily: "Green", style: "Chevron",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 25.6, patternMatch: "Straight match",
    priceUnit: "per roll", accent: "#777c61", inStock: true, featured: false, newArrival: false, popularity: 49,
    installationNotes: "Straight match at 25.6 cm. Centre the first chevron on the focal wall.",
    related: ["infinite-lines", "monsoon-canopy", "modular-grid"],
  },

  /* ————— Floral ————— */
  {
    sku: "WV-050", slug: "orchid-eclipse", name: "Orchid Eclipse", collection: "floral",
    description: "Night orchids with citron hearts on aubergine dark. A floral that reads couture, not cottage.",
    price: 5100, material: d.nonwoven, finish: "Soft-sheen", colorFamily: "Plum", style: "Floral",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 51, patternMatch: "Offset match",
    priceUnit: "per roll", accent: "#d6ff72", inStock: true, featured: true, newArrival: true, popularity: 82,
    installationNotes: "Offset match — plan strip layout before cutting.",
    related: ["cosmic-bloom", "velvet-botanica", "forgotten-paradise"],
  },
  {
    sku: "WV-051", slug: "forgotten-paradise", name: "Forgotten Paradise", collection: "floral",
    description: "Terracotta blooms overgrowing a deep green ruin. Lush, warm, slightly feral.",
    price: 4800, material: d.nonwoven, finish: "Matte", colorFamily: "Green & Terracotta", style: "Floral",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 34, patternMatch: "Offset match",
    priceUnit: "per roll", accent: "#c96f4a", inStock: true, featured: false, newArrival: false, popularity: 66,
    installationNotes: "Offset match at 34 cm. Dense pattern hides wall imperfections well.",
    related: ["orchid-eclipse", "midnight-garden", "liquid-terracotta"],
  },
  {
    sku: "WV-052", slug: "bloom-archive", name: "Bloom Archive", collection: "floral",
    description: "Pressed-flower rose and sage on museum ivory — a catalogue of blooms arranged with archival calm.",
    price: 3900, material: d.paper, finish: "Matte", colorFamily: "Rose", style: "Floral",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 25.6, patternMatch: "Straight match",
    priceUnit: "per roll", accent: "#d9a0a8", inStock: true, featured: false, newArrival: false, popularity: 57,
    installationNotes: "Straight match. Delicate paper — use a soft smoothing brush.",
    related: ["the-floating-forest", "champagne-deco", "orchid-eclipse"],
  },

  /* ————— Minimal ————— */
  {
    sku: "WV-060", slug: "limestone-weave", name: "Limestone Weave", collection: "minimal",
    description: "A fine linen weave in limestone — texture you feel with your eyes. The archive's quietest bestseller.",
    price: 3200, material: d.grass, finish: "Textured", colorFamily: "Limestone", style: "Plain",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 0, patternMatch: "Free match",
    priceUnit: "per roll", accent: "#b9ae9a", inStock: true, featured: true, newArrival: false, popularity: 89,
    installationNotes: "Free match. Reverse-hang alternate strips to avoid shading.",
    related: ["quiet-plaster", "olive-horizon", "celestial-marble"],
  },
  {
    sku: "WV-061", slug: "quiet-plaster", name: "Quiet Plaster", collection: "minimal",
    description: "Venetian plaster without the trowel — soft clouded ivory with barely-there movement.",
    price: 3000, material: d.vinyl, finish: "Matte", colorFamily: "Ivory", style: "Plain",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 0, patternMatch: "Free match",
    priceUnit: "per roll", accent: "#cfc6b2", inStock: true, featured: false, newArrival: false, popularity: 75,
    installationNotes: "Free match. Forgiving surface — good first-time installation choice.",
    related: ["limestone-weave", "stone-strata", "celestial-marble"],
  },
  {
    sku: "WV-062", slug: "olive-horizon", name: "Olive Horizon", collection: "minimal",
    description: "Three broad bands — ivory, limestone, olive — like a landscape reduced to its last three lines.",
    price: 3300, material: d.nonwoven, finish: "Matte", colorFamily: "Olive", style: "Stripe",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 48, patternMatch: "Straight match",
    priceUnit: "per roll", accent: "#9aa083", inStock: false, featured: false, newArrival: false, popularity: 44,
    installationNotes: "Hang horizontally-read bands with a laser level for the cleanest result.",
    related: ["infinite-lines", "limestone-weave", "the-floating-forest"],
  },

  /* ————— Kids ————— */
  {
    sku: "WV-070", slug: "paper-rockets", name: "Paper Rockets", collection: "kids",
    description: "Rockets, stars and paper clouds on a sky-wash blue. Launch sequence optional; wonder guaranteed.",
    price: 2900, material: d.paper, finish: "Matte", colorFamily: "Blue", style: "Kids",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 25.6, patternMatch: "Straight match",
    priceUnit: "per roll", accent: "#f0b429", inStock: true, featured: false, newArrival: true, popularity: 62,
    installationNotes: "Wipeable matte surface. Straight match at 25.6 cm.",
    related: ["starfall-nursery", "modular-grid", "bloom-archive"],
  },
  {
    sku: "WV-071", slug: "starfall-nursery", name: "Starfall Nursery", collection: "kids",
    description: "A navy night sky where the stars are always falling gently. Calm enough for bedtime, rich enough for day.",
    price: 3100, material: d.nonwoven, finish: "Matte", colorFamily: "Navy", style: "Kids",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 20.5, patternMatch: "Straight match",
    priceUnit: "per roll", accent: "#f0d060", inStock: true, featured: false, newArrival: false, popularity: 51,
    installationNotes: "Straight match. Dark ground — snap fresh blades often.",
    related: ["paper-rockets", "cosmic-bloom", "starfall-nursery"],
  },

  /* ————— Nature ————— */
  {
    sku: "WV-080", slug: "monsoon-canopy", name: "Monsoon Canopy", collection: "nature",
    description: "Rain-heavy jungle greens layered to the edge of darkness. Stand under it and the room cools a degree.",
    price: 4700, material: d.nonwoven, finish: "Matte", colorFamily: "Green", style: "Botanical",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 42.7, patternMatch: "Offset match",
    priceUnit: "per roll", accent: "#77c49a", inStock: true, featured: true, newArrival: false, popularity: 79,
    installationNotes: "Offset match. Dense foliage pattern conceals uneven plaster.",
    related: ["midnight-garden", "chevron-cascade", "forgotten-paradise"],
  },
  {
    sku: "WV-081", slug: "golden-savanna", name: "Golden Savanna", collection: "nature",
    description: "Dry-season grasslands abstracted into drifting honey bands — warmth that needs no afternoon sun.",
    price: 4300, material: d.grass, finish: "Textured", colorFamily: "Gold", style: "Landscape",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 0, patternMatch: "Free match",
    priceUnit: "per roll", accent: "#b98f56", inStock: true, featured: false, newArrival: false, popularity: 55,
    installationNotes: "Free match. Textured face — press seams gently to avoid burnishing.",
    related: ["sandstone-reverie", "fluid-earth", "liquid-terracotta"],
  },

  /* ————— Artistic Murals ————— */
  {
    sku: "WV-090", slug: "aurora-mural", name: "Aurora Mural", collection: "artistic-murals",
    description: "A rising sun over layered hills, painted as a four-panel mural. One wall becomes the horizon.",
    price: 9800, material: d.nonwoven, finish: "Matte", colorFamily: "Teal & Gold", style: "Mural",
    rollWidthCm: 280, rollLengthM: 3, coverageSqm: 8.4, patternRepeatCm: 0, patternMatch: "Mural — non-repeating",
    priceUnit: "per 4-panel set", accent: "#e8b45a", inStock: true, featured: true, newArrival: true, popularity: 86,
    installationNotes: "Hung as 4 numbered panels, left to right. Covers walls up to 280 × 300 cm.",
    related: ["terracotta-dawn", "golden-savanna", "cosmic-bloom"],
  },
  {
    sku: "WV-091", slug: "terracotta-dawn", name: "Terracotta Dawn", collection: "artistic-murals",
    description: "Overlapping arches in clay, olive and champagne — a mural that files sunrise under architecture.",
    price: 8900, material: d.nonwoven, finish: "Matte", colorFamily: "Terracotta", style: "Mural",
    rollWidthCm: 280, rollLengthM: 3, coverageSqm: 8.4, patternRepeatCm: 0, patternMatch: "Mural — non-repeating",
    priceUnit: "per 4-panel set", accent: "#c96f4a", inStock: true, featured: false, newArrival: true, popularity: 60,
    installationNotes: "Hung as 4 numbered panels. Trim excess at skirting after hanging.",
    related: ["aurora-mural", "liquid-terracotta", "champagne-deco"],
  },

  /* ————— Extra breadth ————— */
  {
    sku: "WV-092", slug: "palazzo-terrazzo", name: "Palazzo Terrazzo", collection: "minimal",
    description: "Milanese terrazzo chips scattered over warm ivory — playful underfoot energy, promoted to the wall.",
    price: 3700, material: d.vinyl, finish: "Satin", colorFamily: "Multi", style: "Terrazzo",
    rollWidthCm: 53, rollLengthM: 10, coverageSqm: 5.3, patternRepeatCm: 0, patternMatch: "Free match",
    priceUnit: "per roll", accent: "#c96f4a", inStock: true, featured: false, newArrival: true, popularity: 59,
    installationNotes: "Free match. Satin vinyl wipes clean — suited to kitchens and halls.",
    related: ["limestone-weave", "paper-rockets", "fluid-earth"],
  },
];

export const textureUrl = (slug: string) => `/textures/${slug}.svg`;
