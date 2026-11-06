"use client";

import Link from "next/link";
import { useToast } from "@/store/toast";

export function ToastViewport() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[90] flex flex-col gap-2 max-w-[calc(100vw-2.5rem)]"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-obsidian text-ivory border border-ivory/15 pl-3 pr-4 py-3 shadow-xl animate-[toast-in_0.3s_ease-out]"
        >
          {t.texture ? (
            <span
              aria-hidden
              className="block h-9 w-9 shrink-0 texture-tile"
              style={{ backgroundImage: `url(${t.texture})`, backgroundSize: "90px" }}
            />
          ) : null}
          <p className="text-sm">{t.message}</p>
          {t.href ? (
            <Link
              href={t.href}
              onClick={() => dismiss(t.id)}
              className="label text-citron whitespace-nowrap hover:underline underline-offset-4"
            >
              {t.hrefLabel ?? "View"}
            </Link>
          ) : null}
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="opacity-50 hover:opacity-100 cursor-pointer ml-1"
          >
            ✕
          </button>
        </div>
      ))}
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
