"use client";

import { useActionState } from "react";
import { updateSettings } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

const inputCls =
  "w-full border border-ivory/25 bg-transparent px-3 py-2.5 text-sm focus:border-citron outline-none";

export function SettingsForm({
  defaults,
}: {
  defaults: { shippingFlat: number; freeShippingAbove: number; taxRatePct: number };
}) {
  const [state, action, pending] = useActionState(updateSettings, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="label opacity-60">Flat shipping (₹)</span>
        <input name="shippingFlat" type="number" min={0} defaultValue={defaults.shippingFlat} required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label opacity-60">Free shipping above (₹)</span>
        <input name="freeShippingAbove" type="number" min={0} defaultValue={defaults.freeShippingAbove} required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label opacity-60">GST rate (%) — informational, prices stay tax-inclusive</span>
        <input name="taxRatePct" type="number" min={0} max={40} defaultValue={defaults.taxRatePct} required className={inputCls} />
      </label>
      {state && !state.ok ? (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      ) : state?.ok ? (
        <p className="text-sm text-citron">Settings saved and live.</p>
      ) : null}
      <Button type="submit" variant="citron" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
