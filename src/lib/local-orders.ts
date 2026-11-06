import type { OrderView } from "@/types";

/**
 * Static mode keeps demo orders in the visitor's browser so the confirmation
 * page can show them; nothing stores them on a server.
 */
const KEY = "wv-demo-orders";
const LIMIT = 10;

export function readLocalOrdersRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function parseLocalOrders(raw: string | null): Record<string, OrderView> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, OrderView>) : {};
  } catch {
    return {};
  }
}

export function saveLocalOrder(order: OrderView): boolean {
  try {
    const orders = parseLocalOrders(readLocalOrdersRaw());
    orders[order.id] = order;
    const kept = Object.values(orders)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, LIMIT);
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(kept.map((o) => [o.id, o]))));
    return true;
  } catch {
    return false;
  }
}
