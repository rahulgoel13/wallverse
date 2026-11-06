"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseLocalOrders, readLocalOrdersRaw } from "@/lib/local-orders";
import { OrderConfirmationView } from "@/components/checkout/OrderConfirmationView";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

/** Static mode: the demo order lives only in the browser that placed it. */
export function LocalOrderConfirmation({ orderId }: { orderId: string }) {
  // undefined during server render, then the raw stored string on the client.
  const raw = useSyncExternalStore(subscribe, readLocalOrdersRaw, () => undefined);
  const order = useMemo(
    () => (raw === undefined ? undefined : (parseLocalOrders(raw)[orderId] ?? null)),
    [raw, orderId]
  );

  if (order === undefined) {
    return <div className="section-dark min-h-dvh" aria-busy="true" aria-label="Loading order" />;
  }

  if (order === null) {
    return (
      <div className="section-dark min-h-dvh pt-[calc(var(--header-h)+4rem)] pb-24">
        <div className="container-wv max-w-2xl">
          <EmptyState
            label="Order not found"
            message="Demo orders are saved only in the browser that placed them, and this one isn't here."
            action={
              <Button href="/shop" variant="citron">
                Continue exploring
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return <OrderConfirmationView order={order} />;
}
