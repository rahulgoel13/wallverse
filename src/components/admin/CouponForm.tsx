"use client";

import { useActionState } from "react";
import { upsertCoupon } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

const inputCls =
  "w-full border border-ivory/25 bg-transparent px-3 py-2.5 text-sm focus:border-citron outline-none";

export function CouponForm() {
  const [state, action, pending] = useActionState(upsertCoupon, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="label opacity-60">Code</span>
        <input name="code" required minLength={3} className={`${inputCls} uppercase`} placeholder="FESTIVE20" />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="label opacity-60">Type</span>
          <select name="type" className={`${inputCls} [&>option]:bg-obsidian`}>
            <option value="percent">Percent off</option>
            <option value="flat">Flat ₹ off</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="label opacity-60">Value</span>
          <input name="value" type="number" min={1} required className={inputCls} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="label opacity-60">Minimum subtotal (₹)</span>
        <input name="minSubtotal" type="number" min={0} defaultValue={0} required className={inputCls} />
      </label>
      <label className="flex items-center gap-2 label opacity-80 cursor-pointer">
        <input type="checkbox" name="active" defaultChecked className="accent-citron h-4 w-4" />
        Active
      </label>
      {state && !state.ok ? (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      ) : state?.ok ? (
        <p className="text-sm text-citron">Coupon saved.</p>
      ) : null}
      <Button type="submit" variant="citron" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save coupon"}
      </Button>
    </form>
  );
}
