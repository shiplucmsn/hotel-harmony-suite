import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { withTenantKey } from "@/lib/tenant-query";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import type { CreateCategoryInput } from "@/modules/inventory/types";

export const inventoryCategoryKeys = {
  all: () => withTenantKey(["inventory", "categories"] as const),
};

export function useInventoryCategories() {
  return useQuery({
    queryKey: inventoryCategoryKeys.all(),
    queryFn: () => inventoryApi.categories(),
  });
}

export function useCreateInventoryCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCategoryInput) => inventoryApi.createCategory(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryCategoryKeys.all() });
      toast.success("Category created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create category")),
  });
}
