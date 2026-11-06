"use client";

import { useActionState } from "react";
import { upsertCollection } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import type { Collection } from "@prisma/client";

const inputCls =
  "w-full border border-ivory/25 bg-transparent px-3 py-2.5 text-sm focus:border-citron outline-none";

export function CollectionForm({ collection }: { collection: Collection | null }) {
  const [state, action, pending] = useActionState(upsertCollection, null);
  const c = collection;

  return (
    <form action={action} className="grid gap-5 md:grid-cols-2 max-w-2xl">
      {c ? <input type="hidden" name="id" value={c.id} /> : null}
      <label className="flex flex-col gap-1.5">
        <span className="label opacity-60">Name</span>
        <input name="name" defaultValue={c?.name} required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label opacity-60">Slug</span>
        <input name="slug" defaultValue={c?.slug} required pattern="[a-z0-9-]+" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5 md:col-span-2">
        <span className="label opacity-60">Description</span>
        <textarea name="description" defaultValue={c?.description} required rows={3} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label opacity-60">Accent colour (hex)</span>
        <input name="accent" defaultValue={c?.accent ?? "#b99a6a"} pattern="#[0-9a-fA-F]{6}" required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label opacity-60">Sort order</span>
        <input name="order" type="number" min={0} defaultValue={c?.order ?? 0} required className={inputCls} />
      </label>
      {state && !state.ok ? (
        <p role="alert" className="text-sm text-error md:col-span-2">
          {state.error}
        </p>
      ) : null}
      <div className="md:col-span-2">
        <Button type="submit" variant="citron" disabled={pending}>
          {pending ? "Saving…" : c ? "Save changes" : "Create collection"}
        </Button>
      </div>
    </form>
  );
}
