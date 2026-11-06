import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Installation guide — measure, prepare, hang, keep",
  description:
    "How to measure walls for wallpaper, prepare surfaces, hang paste-the-wall and paste-the-paper designs, and maintain them.",
  alternates: { canonical: "/installation" },
};

const steps = [
  {
    n: "01",
    title: "Measure",
    items: [
      "Measure the width of every wall you want to paper, skirting to ceiling height at the tallest point.",
      "Measure in centimetres where possible — pattern repeats are metric.",
      "Note doors and windows, but deduct conservatively: strips above and below openings still use material.",
      "Run your numbers through the roll calculator; it accounts for repeat and trim.",
    ],
  },
  {
    n: "02",
    title: "Prepare",
    items: [
      "Walls must be clean, dry, smooth and uniform in colour — fill cracks and sand proud spots.",
      "Prime fresh plaster or very absorbent walls with wallpaper primer (size).",
      "Switch off power before working around sockets and switches; loosen face plates rather than cutting around them.",
      "Plan the layout: start from the most-seen corner and plumb the first strip with a level.",
    ],
  },
  {
    n: "03",
    title: "Hang",
    items: [
      "Paste-the-wall (non-woven): paste one strip-width of wall, hang the dry strip top-down, smooth from the centre outwards.",
      "Paste-the-paper: paste the strip, book it (fold paste-to-paste) for the time stated on the label, then hang.",
      "Match the pattern at eye level first — small misalignments are least visible there.",
      "Butt seams, never overlap. Trim top and bottom with a fresh blade against a wide guide.",
      "Murals: hang numbered panels left to right, aligning the printed artwork before trimming.",
    ],
  },
  {
    n: "04",
    title: "Keep",
    items: [
      "Let the wall dry naturally — no heaters pointed at fresh paper.",
      "Matte papers: dust with a dry microfibre cloth.",
      "Vinyl and satin finishes: wipe with a damp (not wet) cloth and mild soap.",
      "Keep one spare roll from the same batch for future repairs.",
    ],
  },
];

export default function InstallationPage() {
  return (
    <div className="section-dark min-h-dvh pb-24">
      <PageHero
        eyebrow="The Manual"
        title="Measure. Prepare. Hang. Keep."
        copy="Everything a first-time hanger needs, and the details professionals check twice. Ten careful minutes of reading saves a roll of mistakes."
        texture="/textures/modular-grid.svg"
      />
      <div className="container-wv mt-16">
        <div className="grid gap-12 md:grid-cols-2">
          {steps.map((s) => (
            <Reveal key={s.n}>
              <article className="border border-ivory/15 p-7 h-full">
                <p className="label text-citron mb-2">{s.n}</p>
                <h2 className="font-serif text-3xl mb-5">{s.title}</h2>
                <ul className="flex flex-col gap-3 text-sm opacity-75 leading-relaxed list-disc pl-4">
                  {s.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-16 border border-citron/30 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl">Not sure how many rolls?</h2>
            <p className="mt-2 text-sm opacity-70 max-w-md">
              The calculator does the strip arithmetic for any design in the archive — repeat,
              trim and deductions included.
            </p>
          </div>
          <div className="flex gap-3">
            <Button href="/calculator" variant="citron">
              Open the calculator
            </Button>
            <Link href="/contact" className="label self-center text-citron hover:underline underline-offset-4">
              Ask the studio →
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
