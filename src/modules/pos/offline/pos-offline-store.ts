import type { CheckoutInput, OfflineCheckoutJob } from "@/modules/pos/types";

const QUEUE_KEY = "erp_pos_offline_queue";
const CART_KEY = "erp_pos_active_cart_id";

export function loadOfflineQueue(): OfflineCheckoutJob[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OfflineCheckoutJob[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineCheckoutJob[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueOfflineCheckout(cartId: number, payload: CheckoutInput): OfflineCheckoutJob {
  const job: OfflineCheckoutJob = {
    id: crypto.randomUUID(),
    cartId,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  };
  const queue = loadOfflineQueue();
  queue.push(job);
  saveOfflineQueue(queue);
  return job;
}

export function dequeueOfflineCheckout(id: string): void {
  saveOfflineQueue(loadOfflineQueue().filter((j) => j.id !== id));
}

export function persistActiveCartId(cartId: number): void {
  localStorage.setItem(CART_KEY, String(cartId));
}

export function readActiveCartId(): number | null {
  const v = localStorage.getItem(CART_KEY);
  return v ? Number(v) : null;
}

export function clearActiveCartId(): void {
  localStorage.removeItem(CART_KEY);
}
