import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/modules/inventory/inventory-api";

export const expiryKeys = {
  all: ["inventory", "expiry"] as const,
  summary: () => [...expiryKeys.all, "summary"] as const,
  list: (params?: Record<string, unknown>) => [...expiryKeys.all, "list", params] as const,
};

export function useInventoryExpirySummary() {
  return useQuery({
    queryKey: expiryKeys.summary(),
    queryFn: () => inventoryApi.expirySummary(),
  });
}

export function useInventoryExpiryList(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  window?: string;
  in_stock_only?: boolean;
}) {
  return useQuery({
    queryKey: expiryKeys.list(params),
    queryFn: () => inventoryApi.expiry(params),
  });
}
