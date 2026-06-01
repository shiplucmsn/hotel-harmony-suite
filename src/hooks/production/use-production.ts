import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { showSideEffects } from "@/lib/api-meta";
import { productionApi } from "@/modules/production/production-api";
import type {
  CompleteProductionWorkOrderInput,
  CreateProductionBomInput,
  CreateProductionWorkOrderInput,
  RegisterProductionRawMaterialInput,
  UpdateProductionBomInput,
} from "@/modules/production/types";

export const productionKeys = {
  all: ["production"] as const,
  boms: (params?: Record<string, unknown>) => ["production", "boms", params] as const,
  rawMaterials: (params?: Record<string, unknown>) => ["production", "raw-materials", params] as const,
  finishedGoods: (params?: Record<string, unknown>) => ["production", "finished-goods", params] as const,
  productSkus: (params?: Record<string, unknown>) => ["production", "product-skus", params] as const,
  planning: (params?: Record<string, unknown>) => ["production", "planning", params] as const,
  bom: (id: number | string) => ["production", "boms", id] as const,
  workOrders: (params?: Record<string, unknown>) => ["production", "work-orders", params] as const,
  workOrder: (id: number | string) => ["production", "work-orders", id] as const,
};

function invalidateProduction(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: productionKeys.all });
}

export function useProductionRawMaterials(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  scope?: "all" | "bom";
  stock_status?: "low";
}) {
  return useQuery({
    queryKey: productionKeys.rawMaterials(params),
    queryFn: () => productionApi.rawMaterials(params),
  });
}

export function useProductionPlanning(weekStart?: string) {
  return useQuery({
    queryKey: productionKeys.planning({ week_start: weekStart }),
    queryFn: () => productionApi.planning({ week_start: weekStart }),
  });
}

export function useProductionFinishedGoods(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  bom_status?: string;
}) {
  return useQuery({
    queryKey: productionKeys.finishedGoods(params),
    queryFn: () => productionApi.finishedGoods(params),
  });
}

export function useRegisterProductionRawMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterProductionRawMaterialInput) => productionApi.registerRawMaterial(body),
    onSuccess: (res) => {
      invalidateProduction(qc);
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["purchase"] });
      showSideEffects(res.meta);
      toast.success("Raw material saved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to save raw material")),
  });
}

export function useProductionBoms(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({ queryKey: productionKeys.boms(params), queryFn: () => productionApi.boms(params) });
}

export function useProductionBom(id: number | string | null | undefined) {
  return useQuery({
    queryKey: productionKeys.bom(id ?? ""),
    queryFn: () => productionApi.bom(id!),
    enabled: id != null && id !== "",
  });
}

export function useProductionWorkOrders(params?: { per_page?: number; status?: string; bom_id?: number | string }) {
  return useQuery({ queryKey: productionKeys.workOrders(params), queryFn: () => productionApi.workOrders(params) });
}

export function useProductionWorkOrder(id: number | string | null | undefined) {
  return useQuery({
    queryKey: productionKeys.workOrder(id ?? ""),
    queryFn: () => productionApi.workOrder(id!),
    enabled: id != null && id !== "",
  });
}

export function useProductionMaterialAvailability(bomId: number | string | null | undefined) {
  return useQuery({
    queryKey: ["production", "material-availability", bomId],
    queryFn: () => productionApi.materialAvailability({ bom_id: Number(bomId) }),
    enabled: bomId != null && bomId !== "",
  });
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
    onSuccess: (res, { id }) => {
      invalidateProduction(qc);
      qc.invalidateQueries({ queryKey: productionKeys.workOrder(id) });
      showSideEffects(res.meta);
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["finance"] });
      toast.success("Work order completed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to complete work order")),
  });
}

