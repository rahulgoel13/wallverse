export interface JournalSeed {
  slug: string;
  title: string;
  excerpt: string;
  cover: string; // texture path used as editorial cover
  tags: string;
  publishedAt: string; // ISO date
  content: string; // markdown-ish paragraphs separated by \n\n
}

export const journalPosts: JournalSeed[] = [
  {
    slug: "how-pattern-changes-the-size-of-a-room",
    title: "How Pattern Changes the Size of a Room",
    excerpt:
      "Vertical rhythm lifts ceilings, horizontal strata widen walls, and dense foliage dissolves corners. A field guide to optical architecture.",
    cover: "/textures/infinite-lines.svg",
    tags: "Theory,Interiors",
    publishedAt: "2026-09-14",
    content: `Rooms are not measured in metres. They are measured in what the eye believes — and pattern is the fastest way to change its mind.\n\nVertical stripes behave like columns: the eye climbs them, and the ceiling recedes. In a low-slung city flat, a fine two-weight stripe such as Infinite Lines can recover the thirty centimetres the builder took away.\n\nHorizontal strata do the opposite work. Banded stone patterns pull the gaze sideways, stretching short walls into long ones. Use them on the narrow wall of a corridor-shaped room and the proportions settle.\n\nDense, non-directional pattern — a midnight botanical, a tight terrazzo — does something stranger: it dissolves the corners. When every surface carries the same visual weight, the eye stops reading edges, and the room becomes atmosphere rather than box.\n\nThe practical rule: decide which dimension of the room you distrust, then choose the pattern that argues against it.`,
  },
  {
    slug: "the-case-for-the-fifth-wall",
    title: "The Case for the Fifth Wall",
    excerpt:
      "Ceilings are the largest uninterrupted surface in your home, and the most ignored. What happens when wallpaper looks up.",
    cover: "/textures/celestial-marble.svg",
    tags: "Ideas,Installation",
    publishedAt: "2026-08-02",
    content: `Every room has a wall nobody decorates. It has no windows, no doors, no furniture pushed against it — a perfect, uninterrupted plane. It is the ceiling, and it is wasted on white.\n\nPapering a ceiling is not an eccentricity. Hotels have done it for a century because lying down is when a guest finally looks up. Bedrooms and bathrooms — the two rooms where the ceiling gets genuine attention — are the natural candidates.\n\nChoose low-contrast, non-directional designs: a clouded plaster, a soft marble, a fine weave. Directional pattern on a ceiling forces an orientation the room may not agree with.\n\nOne warning from our installers: ceilings are the most demanding surface to hang, and the least forgiving of shortcuts. This is the project where you hire the professional.`,
  },
  {
    slug: "dark-walls-are-not-small-walls",
    title: "Dark Walls Are Not Small Walls",
    excerpt:
      "The most persistent myth in interiors, examined. Deep grounds absorb edges, flatter light, and make rooms feel carved rather than cramped.",
    cover: "/textures/midnight-garden.svg",
    tags: "Theory,Colour",
    publishedAt: "2026-06-21",
    content: `Somewhere along the way, 'light and airy' became the only permitted ambition for a small room — and a generation of box bedrooms was painted into bright, shadowless blandness.\n\nDarkness does the opposite of what the myth claims. A deep ground absorbs the room's edges; walls stop announcing where they end, and the space reads as carved out of something larger. This is why jewel-box studies and midnight dining rooms feel generous at eight square metres.\n\nThe technique has rules. Darkness needs texture or pattern to stay alive — a flat black wall is a dead wall, but a near-black botanical or a deco fan catching lamplight is velvet. And it needs warm, low, multiple light sources; a single cold downlight will flatten the richest wall in the archive.\n\nStart with one wall if the leap feels long. It rarely stays at one.`,
  },
  {
    slug: "a-short-history-of-the-repeat",
    title: "A Short History of the Repeat",
    excerpt:
      "From hand-blocked damasks to algorithmic seamlessness — how the pattern repeat quietly became the most engineered centimetre in design.",
    cover: "/textures/champagne-deco.svg",
    tags: "History,Craft",
    publishedAt: "2026-04-09",
    content: `Every wallpaper hides a piece of engineering in plain sight: the repeat — the exact interval at which the design returns to its beginning.\n\nIn the hand-blocked era, the repeat was the size of the pearwood block a printer could physically lift, which is why historic damasks cluster around half-metre repeats. The machine age shrank it; rotary printing wanted small, efficient cylinders, and pattern obediently tightened.\n\nThe repeat dictates more than appearance. A straight match hangs quickly and wastes little. An offset match — where alternate strips shift by half a repeat — produces richer, less gridded walls at the cost of extra material. Our calculator accounts for exactly this arithmetic.\n\nDigital design has made the repeat invisible but not optional. However organic a pattern looks, somewhere a mathematician has folded its edges together. The craft is in making sure you never find the seam.`,
  },
];
