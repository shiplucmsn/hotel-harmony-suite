import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { showSideEffects } from "@/lib/api-meta";
import { matchesTenantQueryKey, withTenantKey } from "@/lib/tenant-query";
import { productionApi } from "@/modules/production/production-api";
import type {
  CompleteProductionWorkOrderInput,
  CreateProductionBomInput,
  CreateProductionMachineInput,
  CreateProductionQualityInspectionInput,
  CreateProductionWasteRecordInput,
  CreateProductionWorkOrderInput,
  RegisterProductionRawMaterialInput,
  UpdateProductionBomInput,
  UpdateProductionMachineInput,
  UpdateProductionQualityInspectionInput,
  UpdateProductionWasteRecordInput,
} from "@/modules/production/types";

export const productionKeys = {
  all: () => withTenantKey(["production"] as const),
  boms: (params?: Record<string, unknown>) => withTenantKey(["production", "boms", params] as const),
  rawMaterials: (params?: Record<string, unknown>) =>
    withTenantKey(["production", "raw-materials", params] as const),
  finishedGoods: (params?: Record<string, unknown>) =>
    withTenantKey(["production", "finished-goods", params] as const),
  finishedGoodsOutputHistory: (params?: Record<string, unknown>) =>
    withTenantKey(["production", "finished-goods-output", params] as const),
  productSkus: (params?: Record<string, unknown>) =>
    withTenantKey(["production", "product-skus", params] as const),
  planning: (params?: Record<string, unknown>) => withTenantKey(["production", "planning", params] as const),
  workflow: () => withTenantKey(["production", "workflow"] as const),
  analytics: (params?: Record<string, unknown>) => withTenantKey(["production", "analytics", params] as const),
  machines: (params?: Record<string, unknown>) => withTenantKey(["production", "machines", params] as const),
  machine: (id: number | string) => withTenantKey(["production", "machines", id] as const),
  qualityInspections: (params?: Record<string, unknown>) =>
    withTenantKey(["production", "quality-inspections", params] as const),
  qualityInspection: (id: number | string) =>
    withTenantKey(["production", "quality-inspections", id] as const),
  wasteRecords: (params?: Record<string, unknown>) =>
    withTenantKey(["production", "waste-records", params] as const),
  wasteRecord: (id: number | string) => withTenantKey(["production", "waste-records", id] as const),
  bom: (id: number | string) => withTenantKey(["production", "boms", id] as const),
  workOrders: (params?: Record<string, unknown>) =>
    withTenantKey(["production", "work-orders", params] as const),
  workOrder: (id: number | string) => withTenantKey(["production", "work-orders", id] as const),
};

function invalidateProduction(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: productionKeys.all() });
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

export function useProductionWorkflow() {
  return useQuery({
    queryKey: productionKeys.workflow(),
    queryFn: () => productionApi.workflow(),
  });
}

export function useProductionAnalytics(params?: { from?: string; to?: string; group_by?: string }) {
  return useQuery({
    queryKey: productionKeys.analytics(params),
    queryFn: () => productionApi.analytics(params),
  });
}

export function useProductionMachines(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: productionKeys.machines(params),
    queryFn: () => productionApi.machines(params),
  });
}

export function useCreateProductionMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductionMachineInput) => productionApi.createMachine(body),
    onSuccess: (res) => {
      invalidateProduction(qc);
      showSideEffects(res.meta);
      toast.success("Machine saved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to save machine")),
  });
}

export function useUpdateProductionMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdateProductionMachineInput }) =>
      productionApi.updateMachine(id, body),
    onSuccess: (res) => {
      invalidateProduction(qc);
      showSideEffects(res.meta);
      toast.success("Machine updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update machine")),
  });
}

export function useProductionProductSkus(params?: {
  per_page?: number;
  search?: string;
  purpose?: "component" | "finished";
}) {
  return useQuery({
    queryKey: productionKeys.productSkus(params),
    queryFn: () => productionApi.productSkus(params),
  });
}

export function useProductionQualityInspections(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  result?: string;
  work_order_id?: number;
}) {
  return useQuery({
    queryKey: productionKeys.qualityInspections(params),
    queryFn: () => productionApi.qualityInspections(params),
  });
}

export function useCreateProductionQualityInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductionQualityInspectionInput) => productionApi.createQualityInspection(body),
    onSuccess: (res) => {
      invalidateProduction(qc);
      showSideEffects(res.meta);
      toast.success("Inspection recorded");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to save inspection")),
  });
}

export function useUpdateProductionQualityInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdateProductionQualityInspectionInput }) =>
      productionApi.updateQualityInspection(id, body),
    onSuccess: (res) => {
      invalidateProduction(qc);
      showSideEffects(res.meta);
      toast.success("Inspection updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update inspection")),
  });
}

export function useProductionWasteRecords(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  reason?: string;
}) {
  return useQuery({
    queryKey: productionKeys.wasteRecords(params),
    queryFn: () => productionApi.wasteRecords(params),
  });
}

export function useCreateProductionWasteRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductionWasteRecordInput) => productionApi.createWasteRecord(body),
    onSuccess: (res) => {
      invalidateProduction(qc);
      qc.invalidateQueries({ predicate: matchesTenantQueryKey(["inventory"]) });
      showSideEffects(res.meta);
      toast.success("Waste logged");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to log waste")),
  });
}

export function useUpdateProductionWasteRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdateProductionWasteRecordInput }) =>
      productionApi.updateWasteRecord(id, body),
    onSuccess: (res) => {
      invalidateProduction(qc);
      showSideEffects(res.meta);
      toast.success("Waste record updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update waste record")),
  });
}

export function useProductionFinishedGoods(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  bom_status?: string;
  stock_status?: string;
}) {
  return useQuery({
    queryKey: productionKeys.finishedGoods(params),
    queryFn: () => productionApi.finishedGoods(params),
  });
}

export function useProductionFinishedGoodsOutputHistory(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  sku?: string;
}) {
  return useQuery({
    queryKey: productionKeys.finishedGoodsOutputHistory(params),
    queryFn: () => productionApi.finishedGoodsOutputHistory(params),
  });
}

export function useRegisterProductionRawMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterProductionRawMaterialInput) => productionApi.registerRawMaterial(body),
    onSuccess: (res) => {
      invalidateProduction(qc);
      qc.invalidateQueries({ predicate: matchesTenantQueryKey(["inventory"]) });
      qc.invalidateQueries({ predicate: matchesTenantQueryKey(["purchase"]) });
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
    queryKey: withTenantKey(["production", "material-availability", bomId] as const),
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
      qc.invalidateQueries({ predicate: matchesTenantQueryKey(["inventory"]) });
      qc.invalidateQueries({ predicate: matchesTenantQueryKey(["finance"]) });
      toast.success("Work order completed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to complete work order")),
  });
}

