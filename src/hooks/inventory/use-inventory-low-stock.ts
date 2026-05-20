import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import { notificationKeys } from "@/hooks/use-notifications";

export const lowStockKeys = {
  all: ["inventory", "low-stock"] as const,
  summary: () => [...lowStockKeys.all, "summary"] as const,
  list: (params?: Record<string, unknown>) => [...lowStockKeys.all, "list", params] as const,
};

export function useInventoryLowStockSummary() {
  return useQuery({
    queryKey: lowStockKeys.summary(),
    queryFn: () => inventoryApi.lowStockSummary(),
  });
}

export function useInventoryLowStockList(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  severity?: string;
  warehouse_id?: number;
}) {
  return useQuery({
    queryKey: lowStockKeys.list(params),
    queryFn: () => inventoryApi.lowStock(params),
  });
}

export function useDispatchLowStockAlerts() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => inventoryApi.dispatchLowStockAlerts(),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Alerts sent", {
        description: `${data.total_jobs} notification(s) queued for staff with Administrator or Staff role.`,
      });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to send alerts")),
  });
}
