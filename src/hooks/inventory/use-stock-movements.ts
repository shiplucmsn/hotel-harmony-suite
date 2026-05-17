import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import type { AdjustStockInput, MovementListParams } from "@/modules/inventory/types";
import { productKeys } from "@/hooks/inventory/use-inventory-products";

export const movementKeys = {
  list: (params?: MovementListParams) => ["inventory", "movements", params] as const,
};

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: movementKeys.list() });
      qc.invalidateQueries({ queryKey: ["inventory", "stock-levels"] });
      qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Stock adjusted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to adjust stock")),
  });
}
