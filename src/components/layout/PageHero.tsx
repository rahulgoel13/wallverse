import { TexturePreview } from "@/components/ui/TexturePreview";

/** Standard hero for editorial/info pages — texture-washed, dark, consistent. */
export function PageHero({
  eyebrow,
  title,
  copy,
  texture,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  texture?: string;
}) {
  return (
    <header className="relative overflow-hidden">
      {texture ? (
        <TexturePreview texture={texture} tileSize={300} className="absolute inset-0 opacity-30" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/70 to-ink" />
      <div className="container-wv relative pt-[calc(var(--header-h)+5rem)] pb-16">
        <p className="label text-citron mb-4">{eyebrow}</p>
        <h1 className="display text-4xl md:text-6xl max-w-4xl">{title}</h1>
        {copy ? <p className="mt-6 max-w-xl text-sm md:text-base opacity-75 leading-relaxed">{copy}</p> : null}
      </div>
    </header>
  );
}
