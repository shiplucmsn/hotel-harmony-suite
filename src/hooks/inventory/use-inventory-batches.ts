import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { matchesTenantQueryKey, withTenantKey } from "@/lib/tenant-query";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import type { AdjustInventoryBatchInput, CreateInventoryBatchInput } from "@/modules/inventory/types";
import { movementKeys } from "@/hooks/inventory/use-stock-movements";
import { productKeys } from "@/hooks/inventory/use-inventory-products";
import { skuKeys } from "@/hooks/inventory/use-skus";
import { expiryKeys } from "@/hooks/inventory/use-inventory-expiry";
import { lowStockKeys } from "@/hooks/inventory/use-inventory-low-stock";

export const batchKeys = {
  all: () => withTenantKey(["inventory", "batches"] as const),
  list: (params?: Record<string, unknown>) => withTenantKey(["inventory", "batches", params] as const),
  detail: (id: string | number) => withTenantKey(["inventory", "batches", "detail", id] as const),
};

export function useInventoryBatches(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: batchKeys.list(params),
    queryFn: () => inventoryApi.batches(params),
  });
}

export function useCreateInventoryBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInventoryBatchInput) => inventoryApi.createBatch(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: batchKeys.all() });
      await qc.invalidateQueries({ queryKey: expiryKeys.all() });
      await qc.invalidateQueries({ queryKey: lowStockKeys.all() });
      await qc.refetchQueries({ queryKey: batchKeys.all(), type: "active" });
      await qc.refetchQueries({ queryKey: expiryKeys.all(), type: "active" });
      await qc.invalidateQueries({ queryKey: movementKeys.all() });
      await qc.invalidateQueries({ predicate: matchesTenantQueryKey(["inventory", "stock-levels"]) });
      await qc.invalidateQueries({ queryKey: productKeys.all() });
      await qc.invalidateQueries({ queryKey: skuKeys.all() });
      toast.success("Batch created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create batch")),
  });
}
