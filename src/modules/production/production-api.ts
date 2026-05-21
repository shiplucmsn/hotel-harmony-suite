import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type {
  CompleteProductionWorkOrderInput,
  MaterialAvailabilityLineDto,
  CreateProductionBomInput,
  CreateProductionWorkOrderInput,
  PaginatedResult,
  ProductionBomDto,
  ProductionWorkOrderDto,
  UpdateProductionBomInput,
} from "@/modules/production/types";

type ListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  bom_id?: number | string;
};

function buildQuery(params?: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  if (!params) return "";
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") q.set(key, String(value));
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
  boms: (params?: ListParams) =>
    api.get<ApiEnvelope<ProductionBomDto[]>>(`/v1/production/boms${buildQuery(params)}`).then(paginated),

  createBom: (body: CreateProductionBomInput) =>
    api.post<ApiEnvelope<ProductionBomDto>>("/v1/production/boms", body, { idempotent: true }),

  updateBom: (id: number | string, body: UpdateProductionBomInput) =>
    api.patch<ApiEnvelope<ProductionBomDto>>(`/v1/production/boms/${id}`, body, { idempotent: true }),

  workOrders: (params?: ListParams) =>
    api.get<ApiEnvelope<ProductionWorkOrderDto[]>>(`/v1/production/work-orders${buildQuery(params)}`).then(paginated),

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

