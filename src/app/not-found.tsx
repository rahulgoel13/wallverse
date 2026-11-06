import { TexturePreview } from "@/components/ui/TexturePreview";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="section-dark relative min-h-dvh flex items-center justify-center overflow-hidden">
      <TexturePreview texture="/textures/cosmic-bloom.svg" tileSize={340} className="absolute inset-0 opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/75 to-ink" />
      <div className="relative text-center px-5">
        <p className="label text-citron mb-4">404 — off the wall</p>
        <h1 className="display text-6xl md:text-8xl">This wall<br />does not exist.</h1>
        <p className="mt-6 text-sm opacity-70 max-w-sm mx-auto">
          The page you were looking for was never hung — or has been taken down for re-papering.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button href="/" variant="citron">
            Back to the Wallverse
          </Button>
          <Button href="/shop" variant="outline" className="text-ivory">
            Browse designs
          </Button>
        </div>
      </div>
    </div>
  );
}
