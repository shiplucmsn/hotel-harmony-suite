import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import type { CreateProductInput, UpdateProductInput } from "@/modules/inventory/types";

export const productKeys = {
  all: ["inventory", "products"] as const,
  list: (params?: Record<string, unknown>) => ["inventory", "products", "list", params] as const,
  detail: (id: string | number) => ["inventory", "products", "detail", id] as const,
};

export function useInventoryProducts(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => inventoryApi.products(params),
  });
}

export function useInventoryProduct(id: string | number | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ""),
    queryFn: () => inventoryApi.product(id!),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductInput) => inventoryApi.createProduct(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Product created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create product")),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string | number; body: UpdateProductInput }) =>
      inventoryApi.updateProduct(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      qc.invalidateQueries({ queryKey: productKeys.detail(id) });
      toast.success("Product updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update product")),
  });
}
