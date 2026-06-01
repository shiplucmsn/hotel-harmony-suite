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
  ProductionPlanningDashboardDto,
  ProductionRawMaterialDto,
  ProductionWorkOrderDto,
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

  finishedGoods: (params?: ListParams) =>
    api
      .get<ApiEnvelope<ProductionFinishedGoodsDto[]>>(`/v1/production/finished-goods${buildQuery(params)}`)
      .then(paginated),

  /** BOM / production SKU autocomplete (production.boms.view — no inventory.stock.view required). */
  productSkus: (params?: ListParams & { purpose?: "component" | "finished" }) =>
    api.get<ApiEnvelope<SkuDto[]>>(`/v1/production/product-skus${buildQuery(params)}`).then(paginated),

  planning: (params?: { week_start?: string }) =>
    api
      .get<ApiEnvelope<ProductionPlanningDashboardDto>>(`/v1/production/planning${buildQuery(params)}`)
      .then((r) => r.data),

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

