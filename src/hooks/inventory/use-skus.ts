import { useDeferredValue } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { withTenantKey } from "@/lib/tenant-query";
import { productionKeys } from "@/hooks/production/use-production";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import { productionApi } from "@/modules/production/production-api";
import type { GenerateSkuInput } from "@/modules/inventory/types";

export const skuKeys = {
  all: () => withTenantKey(["inventory", "skus"] as const),
  list: (params?: Record<string, unknown>) => withTenantKey(["inventory", "skus", "list", params] as const),
  lookup: (sku: string) => withTenantKey(["inventory", "skus", "lookup", sku] as const),
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

export type SkuSearchRegistry = "inventory" | "production";

/** Debounced server search for autocomplete (pass raw search string). */
export function useSkuSearch(
  search: string,
  options?: {
    enabled?: boolean;
    perPage?: number;
    /** Use production API when user lacks inventory.stock.view (BOM sheets). */
    registry?: SkuSearchRegistry;
    /** Raw material line vs finished output (production registry only). */
    purpose?: "component" | "finished";
  },
) {
  const deferred = useDeferredValue(search.trim());
  const enabled = options?.enabled !== false;
  const perPage = options?.perPage ?? 25;
  const registry = options?.registry ?? "inventory";
  const purpose = options?.purpose ?? "finished";

  return useQuery({
    queryKey:
      registry === "production"
        ? productionKeys.productSkus({
            search: deferred || undefined,
            purpose,
            per_page: perPage,
          })
        : skuKeys.list({ search: deferred || undefined, per_page: perPage }),
    queryFn: () =>
      registry === "production"
        ? productionApi.productSkus({
            search: deferred || undefined,
            purpose,
            per_page: perPage,
          })
        : inventoryApi.skus({
            search: deferred || undefined,
            per_page: perPage,
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
      qc.invalidateQueries({ queryKey: skuKeys.all() });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to generate SKU")),
  });
}
