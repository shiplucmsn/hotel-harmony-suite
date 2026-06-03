import { useQuery } from "@tanstack/react-query";
import { withTenantKey } from "@/lib/tenant-query";
import { inventoryApi } from "@/modules/inventory/inventory-api";

export const expiryKeys = {
  all: () => withTenantKey(["inventory", "expiry"] as const),
  summary: () => withTenantKey(["inventory", "expiry", "summary"] as const),
  list: (params?: Record<string, unknown>) => withTenantKey(["inventory", "expiry", "list", params] as const),
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
