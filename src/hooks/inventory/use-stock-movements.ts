import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import type { AdjustStockInput, MovementListParams, PaginatedResult, StockMovementDto } from "@/modules/inventory/types";
import type { ApiEnvelope } from "@/services/api/types";
import { matchesTenantQueryKey, withTenantKey } from "@/lib/tenant-query";
import { productKeys } from "@/hooks/inventory/use-inventory-products";
import { skuKeys } from "@/hooks/inventory/use-skus";
import { lowStockKeys } from "@/hooks/inventory/use-inventory-low-stock";

export const movementKeys = {
  all: () => withTenantKey(["inventory", "movements"] as const),
  list: (params?: MovementListParams) => withTenantKey(["inventory", "movements", params] as const),
};

type AdjustStockResponse = ApiEnvelope<{
  sku: string;
  currentStock: number;
  movement: StockMovementDto;
}>;

export function useStockMovements(params?: MovementListParams) {
  return useQuery({
    queryKey: movementKeys.list(params),
    queryFn: () => inventoryApi.movements(params),
  });
}

export function useStockLevels(params?: { warehouse_id?: number; product_id?: number; sku?: string }) {
  return useQuery({
    queryKey: withTenantKey(["inventory", "stock-levels", params] as const),
    queryFn: () => inventoryApi.stockLevels({ per_page: 200, ...params }),
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdjustStockInput) => inventoryApi.adjustStock(body),
    onSuccess: async (envelope: AdjustStockResponse) => {
      const movement = envelope.data?.movement;

      if (movement) {
        qc.setQueriesData<PaginatedResult<StockMovementDto>>(
          { queryKey: movementKeys.all() },
          (old) => {
            const rows = old?.data ?? [];
            if (rows.some((m) => m.id === movement.id)) return old;
            return {
              data: [movement, ...rows],
              pagination: old?.pagination,
            };
          },
        );
      }

      await qc.invalidateQueries({ queryKey: movementKeys.all() });
      await qc.refetchQueries({ queryKey: movementKeys.all(), type: "active" });
      await qc.invalidateQueries({ predicate: matchesTenantQueryKey(["inventory", "stock-levels"]) });
      await qc.invalidateQueries({ queryKey: lowStockKeys.all() });
      await qc.refetchQueries({ queryKey: lowStockKeys.all(), type: "active" });
      await qc.invalidateQueries({ queryKey: productKeys.all() });
      await qc.invalidateQueries({ queryKey: skuKeys.all() });

      toast.success("Stock adjusted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to adjust stock")),
  });
}
