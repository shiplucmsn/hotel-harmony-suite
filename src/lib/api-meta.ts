import { toast } from "sonner";

export type ApiMetaSideEffect = {
  domain: string;
  entity: string;
  action: string;
  reference?: string;
};

export type ApiEnvelope<T> = {
  data: T;
  meta?: {
    requestId?: string;
    correlationId?: string;
    sideEffects?: ApiMetaSideEffect[];
    cacheTags?: string[];
  };
};

const ACTION_LABELS: Record<string, string> = {
  "purchase.grn.posted": "GRN posted",
  "inventory.stock.incremented": "Stock increased",
  "finance.journal.posted": "AP journal posted",
  "purchase.vendor_ledger.credited": "Supplier balance updated",
  "purchase.order.receipt_updated": "PO receive status updated",
  "inventory.product.cost_updated": "Product cost updated",
};

function labelForEffect(s: ApiMetaSideEffect): string {
  const key = `${s.domain}.${s.entity}.${s.action}`;
  return ACTION_LABELS[key] ?? key;
}

export function showSideEffects(meta?: ApiEnvelope<unknown>["meta"]) {
  if (!meta?.sideEffects?.length) return;
  const summary = meta.sideEffects
    .slice(0, 5)
    .map((s) => labelForEffect(s))
    .join(" · ");
  toast.message(summary, { description: "Purchase receive completed" });
}
