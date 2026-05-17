import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import type { CreateWarehouseInput } from "@/modules/inventory/types";

export const warehouseKeys = {
  all: ["inventory", "warehouses"] as const,
};

export function useInventoryWarehouses() {
  return useQuery({
    queryKey: warehouseKeys.all,
    queryFn: () => inventoryApi.warehouses({ per_page: 100 }),
  });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWarehouseInput) => inventoryApi.createWarehouse(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: warehouseKeys.all });
      qc.invalidateQueries({ queryKey: ["inventory", "stock-levels"] });
      toast.success("Warehouse created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create warehouse")),
  });
}
