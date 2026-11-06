import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrder } from "@/app/actions/orders";
import { usesDatabase } from "@/lib/data-source";
import { OrderConfirmationView } from "@/components/checkout/OrderConfirmationView";
import { LocalOrderConfirmation } from "@/components/checkout/LocalOrderConfirmation";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false },
};

export default async function OrderConfirmationPage({ params }: PageProps<"/order-confirmation/[orderId]">) {
  const { orderId } = await params;
  const id = orderId.toUpperCase();

  if (!usesDatabase) return <LocalOrderConfirmation orderId={id} />;

  const order = await getOrder(id);
  if (!order) notFound();
  return <OrderConfirmationView order={order} />;
}
