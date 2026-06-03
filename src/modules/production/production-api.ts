import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type { SkuDto } from "@/modules/inventory/types";
import type {
  CompleteProductionWorkOrderInput,
  MaterialAvailabilityLineDto,
  CreateProductionBomInput,
  CreateProductionWorkOrderInput,
  PaginatedResult,
  ProductionBomDto,
  ProductionFinishedGoodsDto,
  ProductionFinishedGoodsListResult,
  ProductionOutputHistoryDto,
  ProductionOutputHistoryListResult,
  ProductionMachinesListResult,
  ProductionMachineDto,
  ProductionPlanningDashboardDto,
  ProductionWorkflowDashboardDto,
  ProductionAnalyticsDto,
  ProductionAnalyticsFilters,
  ProductionRawMaterialDto,
  ProductionWorkOrderDto,
  CreateProductionMachineInput,
  CreateProductionQualityInspectionInput,
  UpdateProductionMachineInput,
  UpdateProductionQualityInspectionInput,
  CreateProductionWasteRecordInput,
  UpdateProductionWasteRecordInput,
  ProductionQualityInspectionDto,
  ProductionQualityListResult,
  ProductionWasteRecordDto,
  ProductionWasteListResult,
  RegisterProductionRawMaterialInput,
  UpdateProductionBomInput,
} from "@/modules/production/types";

type ListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  bom_id?: number | string;
  scope?: string;
  stock_status?: string;
};

function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams();
  if (!params) return "";
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    if (typeof value === "boolean") {
      q.set(key, value ? "1" : "0");
      continue;
    }
    q.set(key, String(value));
  }
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

function paginated<T>(res: ApiEnvelope<T[]>): PaginatedResult<T> {
  return {
    data: Array.isArray(res.data) ? res.data : [],
    pagination: res.meta?.pagination,
  };
}

export const productionApi = {
  rawMaterials: (params?: ListParams) =>
    api
      .get<ApiEnvelope<ProductionRawMaterialDto[]>>(`/v1/production/raw-materials${buildQuery(params)}`)
      .then(paginated),

  finishedGoods: (params?: ListParams & { bom_status?: string; stock_status?: string }) =>
    api.get<ApiEnvelope<ProductionFinishedGoodsDto[]>>(`/v1/production/finished-goods${buildQuery(params)}`).then((r) => ({
      data: Array.isArray(r.data) ? r.data : [],
      pagination: r.meta?.pagination,
      summary: r.meta?.summary as ProductionFinishedGoodsListResult["summary"],
    })),

  finishedGoodsOutputHistory: (params?: ListParams & { sku?: string }) =>
    api
      .get<ApiEnvelope<ProductionOutputHistoryDto[]>>(`/v1/production/finished-goods/output-history${buildQuery(params)}`)
      .then((r) => ({
        data: Array.isArray(r.data) ? r.data : [],
        pagination: r.meta?.pagination,
        summary: r.meta?.summary as ProductionOutputHistoryListResult["summary"],
      })),

  /** BOM / production SKU autocomplete (production.boms.view — no inventory.stock.view required). */
  productSkus: (params?: ListParams & { purpose?: "component" | "finished" }) =>
    api.get<ApiEnvelope<SkuDto[]>>(`/v1/production/product-skus${buildQuery(params)}`).then(paginated),

  planning: (params?: { week_start?: string }) =>
    api
      .get<ApiEnvelope<ProductionPlanningDashboardDto>>(`/v1/production/planning${buildQuery(params)}`)
      .then((r) => r.data),

  workflow: () =>
    api.get<ApiEnvelope<ProductionWorkflowDashboardDto>>("/v1/production/workflow").then((r) => r.data),

  analytics: (params?: ProductionAnalyticsFilters) =>
    api
      .get<ApiEnvelope<ProductionAnalyticsDto>>(`/v1/production/analytics${buildQuery(params)}`)
      .then((r) => r.data),

  machines: (params?: ListParams) =>
    api.get<ApiEnvelope<ProductionMachineDto[]>>(`/v1/production/machines${buildQuery(params)}`).then((r) => ({
      data: Array.isArray(r.data) ? r.data : [],
      pagination: r.meta?.pagination,
      summary: r.meta?.summary as ProductionMachinesListResult["summary"],
    })),

  machine: (id: number | string) =>
    api.get<ApiEnvelope<ProductionMachineDto>>(`/v1/production/machines/${id}`).then((r) => r.data),

  createMachine: (body: CreateProductionMachineInput) =>
    api.post<ApiEnvelope<ProductionMachineDto>>("/v1/production/machines", body, { idempotent: true }),

  updateMachine: (id: number | string, body: UpdateProductionMachineInput) =>
    api.patch<ApiEnvelope<ProductionMachineDto>>(`/v1/production/machines/${id}`, body, { idempotent: true }),

  qualityInspections: (params?: ListParams & { result?: string; work_order_id?: number }) =>
    api
      .get<ApiEnvelope<ProductionQualityInspectionDto[]>>(`/v1/production/quality-inspections${buildQuery(params)}`)
      .then((r) => ({
        data: Array.isArray(r.data) ? r.data : [],
        pagination: r.meta?.pagination,
        summary: r.meta?.summary as ProductionQualityListResult["summary"],
      })),

  qualityInspection: (id: number | string) =>
    api
      .get<ApiEnvelope<ProductionQualityInspectionDto>>(`/v1/production/quality-inspections/${id}`)
      .then((r) => r.data),

  createQualityInspection: (body: CreateProductionQualityInspectionInput) =>
    api.post<ApiEnvelope<ProductionQualityInspectionDto>>("/v1/production/quality-inspections", body, {
      idempotent: true,
    }),

  updateQualityInspection: (id: number | string, body: UpdateProductionQualityInspectionInput) =>
    api.patch<ApiEnvelope<ProductionQualityInspectionDto>>(`/v1/production/quality-inspections/${id}`, body, {
      idempotent: true,
    }),

  wasteRecords: (params?: ListParams & { reason?: string }) =>
    api
      .get<ApiEnvelope<ProductionWasteRecordDto[]>>(`/v1/production/waste-records${buildQuery(params)}`)
      .then((r) => ({
        data: Array.isArray(r.data) ? r.data : [],
        pagination: r.meta?.pagination,
        summary: r.meta?.summary as ProductionWasteListResult["summary"],
      })),

  wasteRecord: (id: number | string) =>
    api.get<ApiEnvelope<ProductionWasteRecordDto>>(`/v1/production/waste-records/${id}`).then((r) => r.data),

  createWasteRecord: (body: CreateProductionWasteRecordInput) =>
    api.post<ApiEnvelope<ProductionWasteRecordDto>>("/v1/production/waste-records", body, { idempotent: true }),

  updateWasteRecord: (id: number | string, body: UpdateProductionWasteRecordInput) =>
    api.patch<ApiEnvelope<ProductionWasteRecordDto>>(`/v1/production/waste-records/${id}`, body, { idempotent: true }),

  registerRawMaterial: (body: RegisterProductionRawMaterialInput) =>
    api.post<ApiEnvelope<{ material: ProductionRawMaterialDto; product_supplier_id?: number | null }>>(
      "/v1/production/raw-materials",
      body,
      { idempotent: true },
    ),

  boms: (params?: ListParams) =>
    api.get<ApiEnvelope<ProductionBomDto[]>>(`/v1/production/boms${buildQuery(params)}`).then(paginated),

  bom: (id: number | string) =>
    api.get<ApiEnvelope<ProductionBomDto>>(`/v1/production/boms/${id}`).then((r) => r.data),

  createBom: (body: CreateProductionBomInput) =>
    api.post<ApiEnvelope<ProductionBomDto>>("/v1/production/boms", body, { idempotent: true }),

  updateBom: (id: number | string, body: UpdateProductionBomInput) =>
    api.patch<ApiEnvelope<ProductionBomDto>>(`/v1/production/boms/${id}`, body, { idempotent: true }),

  workOrders: (params?: ListParams) =>
    api.get<ApiEnvelope<ProductionWorkOrderDto[]>>(`/v1/production/work-orders${buildQuery(params)}`).then(paginated),

  workOrder: (id: number | string) =>
    api.get<ApiEnvelope<ProductionWorkOrderDto>>(`/v1/production/work-orders/${id}`).then((r) => r.data),

  createWorkOrder: (body: CreateProductionWorkOrderInput) =>
    api.post<ApiEnvelope<ProductionWorkOrderDto>>("/v1/production/work-orders", body, { idempotent: true }),

  startWorkOrder: (id: number | string) =>
    api.post<ApiEnvelope<ProductionWorkOrderDto>>(`/v1/production/work-orders/${id}/start`, {}, { idempotent: true }),

  completeWorkOrder: (id: number | string, body: CompleteProductionWorkOrderInput) =>
    api.post<ApiEnvelope<ProductionWorkOrderDto>>(`/v1/production/work-orders/${id}/complete`, body, { idempotent: true }),

  materialAvailability: (params?: { bom_id?: number; warehouse_id?: number; skus?: string[] }) => {
    const q = new URLSearchParams();
    if (params?.bom_id) q.set("bom_id", String(params.bom_id));
    if (params?.warehouse_id) q.set("warehouse_id", String(params.warehouse_id));
    if (params?.skus?.length) q.set("skus", params.skus.join(","));
    const qs = q.toString();

    return api
      .get<ApiEnvelope<{ warehouse_id: number | null; lines: MaterialAvailabilityLineDto[] }>>(
        `/v1/production/material-availability${qs ? `?${qs}` : ""}`,
      )
      .then((r) => r.data);
  },
};

