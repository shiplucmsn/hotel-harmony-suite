export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export const PAYMENT_METHODS = [
  { id: "cash" as const, label: "Cash" },
  { id: "card" as const, label: "Card" },
  { id: "bank" as const, label: "Bank" },
  { id: "mobile" as const, label: "Mobile" },
  { id: "account" as const, label: "On account" },
];

export function newIdempotencyKey(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const POS_SHORTCUTS = [
  { keys: "F2", action: "Focus barcode scanner" },
  { keys: "F4", action: "Open checkout" },
  { keys: "F8", action: "Clear cart" },
  { keys: "F9", action: "Show shortcuts" },
  { keys: "Esc", action: "Close dialog" },
  { keys: "Enter", action: "Confirm scan / checkout step" },
];
