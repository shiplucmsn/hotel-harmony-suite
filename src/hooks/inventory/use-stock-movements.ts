import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import type { AdjustStockInput, MovementListParams, PaginatedResult, StockMovementDto } from "@/modules/inventory/types";
import type { ApiEnvelope } from "@/services/api/types";
import { productKeys } from "@/hooks/inventory/use-inventory-products";
import { skuKeys } from "@/hooks/inventory/use-skus";

export const movementKeys = {
  all: ["inventory", "movements"] as const,
  list: (params?: MovementListParams) => [...movementKeys.all, params] as const,
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
    queryKey: ["inventory", "stock-levels", params],
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
          { queryKey: movementKeys.all },
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

      await qc.invalidateQueries({ queryKey: movementKeys.all });
      await qc.refetchQueries({ queryKey: movementKeys.all, type: "active" });
      await qc.invalidateQueries({ queryKey: ["inventory", "stock-levels"] });
      await qc.invalidateQueries({ queryKey: productKeys.all });
      await qc.invalidateQueries({ queryKey: skuKeys.all });

      toast.success("Stock adjusted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to adjust stock")),
  });
}
