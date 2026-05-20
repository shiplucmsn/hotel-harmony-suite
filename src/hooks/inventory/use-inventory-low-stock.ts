import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/modules/inventory/inventory-api";

export const lowStockKeys = {
  all: ["inventory", "low-stock"] as const,
  summary: () => [...lowStockKeys.all, "summary"] as const,
  list: (params?: Record<string, unknown>) => [...lowStockKeys.all, "list", params] as const,
};

export function useInventoryLowStockSummary() {
  return useQuery({
    queryKey: lowStockKeys.summary(),
    queryFn: () => inventoryApi.lowStockSummary(),
  });
}

export function useInventoryLowStockList(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  severity?: string;
  warehouse_id?: number;
}) {
  return useQuery({
    queryKey: lowStockKeys.list(params),
    queryFn: () => inventoryApi.lowStock(params),
  });
}
