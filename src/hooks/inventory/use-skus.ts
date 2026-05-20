import { useDeferredValue } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import type { GenerateSkuInput } from "@/modules/inventory/types";

export const skuKeys = {
  all: ["inventory", "skus"] as const,
  list: (params?: Record<string, unknown>) => ["inventory", "skus", "list", params] as const,
  lookup: (sku: string) => ["inventory", "skus", "lookup", sku] as const,
};

export function useSkuRegistry(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: skuKeys.list(params),
    queryFn: () => inventoryApi.skus(params),
  });
}

/** Debounced server search for autocomplete (pass raw search string). */
export function useSkuSearch(search: string, options?: { enabled?: boolean; perPage?: number }) {
  const deferred = useDeferredValue(search.trim());
  const enabled = options?.enabled !== false;

  return useQuery({
    queryKey: skuKeys.list({ search: deferred || undefined, per_page: options?.perPage ?? 25 }),
    queryFn: () =>
      inventoryApi.skus({
        search: deferred || undefined,
        per_page: options?.perPage ?? 25,
      }),
    enabled,
    staleTime: 20_000,
  });
}

export function useSkuLookup(sku: string | undefined) {
  return useQuery({
    queryKey: skuKeys.lookup(sku ?? ""),
    queryFn: () => inventoryApi.lookupSku(sku!),
    enabled: Boolean(sku?.trim()),
  });
}

export function useGenerateSku() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GenerateSkuInput) => inventoryApi.generateSku(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: skuKeys.all });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to generate SKU")),
  });
}
