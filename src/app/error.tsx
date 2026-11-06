"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="section-dark min-h-dvh flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <p className="label text-error mb-4">Something tore</p>
        <h1 className="display text-5xl">A seam came loose.</h1>
        <p className="mt-5 text-sm opacity-70">
          An unexpected error interrupted the page. Your cart and wishlist are safe.
          {error.digest ? <span className="label block mt-2 opacity-50">Ref: {error.digest}</span> : null}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="citron" onClick={reset}>
            Try again
          </Button>
          <Button href="/" variant="outline" className="text-ivory">
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
