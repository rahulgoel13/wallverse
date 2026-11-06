import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our World — the WALLVERSE philosophy",
  description:
    "WALLVERSE treats wallpaper as architecture: pattern, light and proportion working together. The story and philosophy behind the studio.",
  alternates: { canonical: "/about" },
};

const beliefs = [
  {
    n: "01",
    title: "Walls are the largest objects you own",
    copy: "A sofa is two metres of a room. The walls are all of it. Changing them changes everything the room does to you — which is why we treat wallpaper as architecture, not decoration.",
  },
  {
    n: "02",
    title: "Choosing should feel like exploring",
    copy: "Nobody falls in love with a thumbnail. Our corridor, takeover and Room Studio exist so you meet a design the way you will live with it: at full scale, in light, on a wall.",
  },
  {
    n: "03",
    title: "Confidence before checkout",
    copy: "Real roll dimensions, honest pattern-repeat arithmetic, an A4 sample for every design and a calculator that shows its working. You should know exactly what arrives.",
  },
];

export default function AboutPage() {
  return (
    <div className="section-dark min-h-dvh pb-24">
      <PageHero
        eyebrow="Our World"
        title="Walls are no longer just walls."
        copy={site.description}
        texture="/textures/aurora-mural.svg"
      />
      <div className="container-wv">
        <Reveal className="prose-wv mt-16">
          <p>
            {site.name} began with a simple irritation: wallpaper — the most transformative object
            in interior design — was being sold like printer paper. Flat thumbnails. Vague sizes.
            No sense of what a pattern does when it stands three metres tall and wraps a corner.
          </p>
          <p>
            So we built the opposite. A place where designs hang in impossible architecture, where
            a sample can swallow the whole screen, where a 3D room lets you dress every wall
            separately before a single roll is cut. The theatre is the point — but underneath it is
            a working store with honest arithmetic.
          </p>
          <p>
            The catalogue you see today is a demonstration archive: twenty-eight designs across ten
            worlds, every texture rendered by our own pattern engine so the same asset follows a
            design from thumbnail to 3D wall to your cart.
          </p>
        </Reveal>

        <div className="mt-20 grid gap-10 md:grid-cols-3">
          {beliefs.map((b) => (
            <Reveal key={b.n}>
              <p className="label text-citron mb-3">{b.n}</p>
              <h2 className="font-serif text-2xl mb-3">{b.title}</h2>
              <p className="text-sm opacity-70 leading-relaxed">{b.copy}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-24 grid grid-cols-3 gap-2" aria-hidden>
          {["/textures/midnight-garden.svg", "/textures/celestial-marble.svg", "/textures/golden-geometry.svg"].map((t) => (
            <TexturePreview key={t} texture={t} tileSize={220} className="aspect-square" />
          ))}
        </Reveal>

        <Reveal className="mt-16 flex flex-wrap gap-4">
          <Button href="/collections" variant="citron">
            Explore the collections
          </Button>
          <Button href="/contact" variant="outline" className="text-ivory">
            Talk to the studio
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
