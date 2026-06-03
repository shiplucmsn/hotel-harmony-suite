import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { matchesTenantQueryKey, withTenantKey } from "@/lib/tenant-query";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import type { CreateStockTransferInput } from "@/modules/inventory/types";
import { lowStockKeys } from "@/hooks/inventory/use-inventory-low-stock";

export const transferKeys = {
  all: () => withTenantKey(["inventory", "transfers"] as const),
  list: (params?: Record<string, unknown>) => withTenantKey(["inventory", "transfers", "list", params] as const),
  detail: (number: string) => withTenantKey(["inventory", "transfers", "detail", number] as const),
};

export function useStockTransfers(params?: { page?: number; per_page?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: transferKeys.list(params),
    queryFn: () => inventoryApi.transfers(params),
  });
}

export function useStockTransfer(number: string | undefined) {
  return useQuery({
    queryKey: transferKeys.detail(number ?? ""),
    queryFn: () => inventoryApi.transfer(number!),
    enabled: Boolean(number),
  });
}

export function useCreateStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStockTransferInput) => inventoryApi.createTransfer(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transferKeys.all() });
      qc.invalidateQueries({ predicate: matchesTenantQueryKey(["inventory", "stock-levels"]) });
      qc.invalidateQueries({ queryKey: lowStockKeys.all() });
      qc.invalidateQueries({ predicate: matchesTenantQueryKey(["inventory", "movements"]) });
      qc.invalidateQueries({ predicate: matchesTenantQueryKey(["inventory", "products"]) });
      toast.success("Stock transfer completed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create transfer")),
  });
}
