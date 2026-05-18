import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { showSideEffects } from "@/lib/api-meta";
import { productionApi } from "@/modules/production/production-api";
import type {
  CompleteProductionWorkOrderInput,
  CreateProductionBomInput,
  CreateProductionWorkOrderInput,
  UpdateProductionBomInput,
} from "@/modules/production/types";

export const productionKeys = {
  all: ["production"] as const,
  boms: (params?: Record<string, unknown>) => ["production", "boms", params] as const,
  workOrders: (params?: Record<string, unknown>) => ["production", "work-orders", params] as const,
};

function invalidateProduction(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: productionKeys.all });
}

export function useProductionBoms(params?: { per_page?: number; search?: string; status?: string }) {
  return useQuery({ queryKey: productionKeys.boms(params), queryFn: () => productionApi.boms(params) });
}

export function useProductionWorkOrders(params?: { per_page?: number; status?: string; bom_id?: number | string }) {
  return useQuery({ queryKey: productionKeys.workOrders(params), queryFn: () => productionApi.workOrders(params) });
}

export function useCreateProductionBom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductionBomInput) => productionApi.createBom(body),
    onSuccess: (res) => {
      invalidateProduction(qc);
      showSideEffects(res.meta);
      toast.success("BOM created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create BOM")),
  });
}

export function useUpdateProductionBom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdateProductionBomInput }) => productionApi.updateBom(id, body),
    onSuccess: (res) => {
      invalidateProduction(qc);
      showSideEffects(res.meta);
      toast.success("BOM updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update BOM")),
  });
}

export function useCreateProductionWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductionWorkOrderInput) => productionApi.createWorkOrder(body),
    onSuccess: (res) => {
      invalidateProduction(qc);
      showSideEffects(res.meta);
      toast.success("Work order created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create work order")),
  });
}

export function useStartProductionWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => productionApi.startWorkOrder(id),
    onSuccess: (res) => {
      invalidateProduction(qc);
      showSideEffects(res.meta);
      toast.success("Work order started");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to start work order")),
  });
}

export function useCompleteProductionWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: CompleteProductionWorkOrderInput }) =>
      productionApi.completeWorkOrder(id, body),
    onSuccess: (res) => {
      invalidateProduction(qc);
      showSideEffects(res.meta);
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["finance"] });
      toast.success("Work order completed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to complete work order")),
  });
}

