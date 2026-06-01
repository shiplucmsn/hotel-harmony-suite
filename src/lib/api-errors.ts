import { ApiError } from "@/lib/api-client";

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
};

function formatStockErrorDetails(details?: Record<string, unknown>): string | null {
  if (!details) return null;

  const materials = details.materials;
  if (Array.isArray(materials) && materials.length > 0) {
    const lines = materials
      .slice(0, 3)
      .map((row) => {
        const item = row as { sku?: string; planned_qty?: number; available_qty?: number; shortfall?: number };
        return `${item.sku ?? "SKU"}: need ${item.planned_qty ?? "?"}, available ${item.available_qty ?? 0}`;
      })
      .join("; ");

    return materials.length > 3 ? `${lines}; …` : lines;
  }

  const sku = details.sku;
  if (typeof sku === "string") {
    const requested = details.requested;
    const available = details.available;
    return `${sku}: need ${requested ?? "?"}, available ${available ?? 0}`;
  }

  return null;
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ApiError) {
    const payload = error.payload as ApiErrorPayload;
    const base = payload?.error?.message ?? error.message ?? fallback;
    const stockDetail = formatStockErrorDetails(payload?.error?.details);
    if (stockDetail) {
      return `${base} ${stockDetail}`;
    }
    return base;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function getApiValidationErrors(error: unknown): Record<string, string[]> | null {
  if (error instanceof ApiError) {
    const payload = error.payload as ApiErrorPayload;
    return payload?.error?.details ?? null;
  }
  return null;
}
