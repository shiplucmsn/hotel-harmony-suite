import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type {
  AdjustStockInput,
  CreateCategoryInput,
  CreateProductInput,
  CreateWarehouseInput,
  InventoryCategoryDto,
  MovementListParams,
  PaginatedResult,
  GenerateSkuInput,
  GenerateSkuResult,
  ProductDto,
  SkuDto,
  StockLevelDto,
  StockLevelListParams,
  AdjustInventoryBatchInput,
  CreateInventoryBatchInput,
  CreateStockTransferInput,
  InventoryBatchDto,
  InventoryExpirySummaryDto,
  InventoryLowStockDto,
  InventoryLowStockSummaryDto,
  StockMovementDto,
  StockTransferDto,
  StockTransferLineDto,
  UpdateProductInput,
  WarehouseDto,
} from "@/modules/inventory/types";

type ListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  category_id?: number;
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

export const inventoryApi = {
  categories: () =>
    api.get<ApiEnvelope<InventoryCategoryDto[]>>("/v1/inventory/categories").then((r) => r.data),

  createCategory: (body: CreateCategoryInput) =>
    api
      .post<ApiEnvelope<InventoryCategoryDto>>("/v1/inventory/categories", body, { idempotent: true })
      .then((r) => r.data),

  products: (params?: ListParams) =>
    api
      .get<ApiEnvelope<ProductDto[]>>(`/v1/products${buildQuery(params)}`)
      .then(paginated),

  product: (id: number | string) =>
    api.get<ApiEnvelope<ProductDto>>(`/v1/products/${id}`).then((r) => r.data),

  createProduct: (body: CreateProductInput) =>
    api.post<ApiEnvelope<ProductDto>>("/v1/products", body, { idempotent: true }),

  updateProduct: (id: number | string, body: UpdateProductInput) =>
    api.patch<ApiEnvelope<ProductDto>>(`/v1/products/${id}`, body, { idempotent: true }),

  lookupBarcode: (barcode: string) =>
    api.get<ApiEnvelope<ProductDto>>(`/v1/inventory/barcodes/${encodeURIComponent(barcode)}`).then((r) => r.data),

  warehouses: (params?: { page?: number; per_page?: number }) =>
    api
      .get<ApiEnvelope<WarehouseDto[]>>(`/v1/inventory/warehouses${buildQuery(params)}`)
      .then(paginated),

  createWarehouse: (body: CreateWarehouseInput) =>
    api
      .post<ApiEnvelope<WarehouseDto>>("/v1/inventory/warehouses", body, { idempotent: true })
      .then((r) => r.data),

  stockLevels: (params?: StockLevelListParams) =>
    api
      .get<ApiEnvelope<StockLevelDto[]>>(`/v1/inventory/stock-levels${buildQuery(params)}`)
      .then(paginated),

  movements: (params?: MovementListParams) =>
    api
      .get<ApiEnvelope<StockMovementDto[]>>(`/v1/inventory/movements${buildQuery(params)}`)
      .then(paginated),

  adjustStock: (body: AdjustStockInput) =>
    api.post<ApiEnvelope<{ sku: string; currentStock: number; movement: StockMovementDto }>>(
      "/v1/inventory/adjustments",
      body,
      { idempotent: true },
    ),

  skus: (params?: ListParams) =>
    api.get<ApiEnvelope<SkuDto[]>>(`/v1/inventory/skus${buildQuery(params)}`).then(paginated),

  lookupSku: (sku: string) =>
    api
      .get<ApiEnvelope<SkuDto>>(`/v1/inventory/skus/lookup/${encodeURIComponent(sku)}`)
      .then((r) => r.data),

  generateSku: (body: GenerateSkuInput) =>
    api
      .post<ApiEnvelope<GenerateSkuResult>>("/v1/inventory/skus/generate", body, { idempotent: true })
      .then((r) => r.data),

  transfers: (params?: ListParams) =>
    api
      .get<ApiEnvelope<StockTransferDto[]>>(`/v1/inventory/transfers${buildQuery(params)}`)
      .then(paginated),

  transfer: (number: string) =>
    api
      .get<ApiEnvelope<{ number: string; lines: StockTransferLineDto[] }>>(
        `/v1/inventory/transfers/${encodeURIComponent(number)}`,
      )
      .then((r) => r.data),

  createTransfer: (body: CreateStockTransferInput) =>
    api.post<ApiEnvelope<{ transfer: StockTransferDto; lines: StockTransferLineDto[] }>>(
      "/v1/inventory/transfers",
      body,
      { idempotent: true },
    ),

  lowStockSummary: () =>
    api
      .get<ApiEnvelope<InventoryLowStockSummaryDto>>("/v1/inventory/low-stock/summary")
      .then((r) => r.data),

  lowStock: (params?: ListParams & { severity?: string }) =>
    api
      .get<ApiEnvelope<InventoryLowStockDto[]>>(`/v1/inventory/low-stock${buildQuery(params)}`)
      .then(paginated),

  expirySummary: () =>
    api
      .get<ApiEnvelope<InventoryExpirySummaryDto>>("/v1/inventory/expiry/summary")
      .then((r) => r.data),

  expiry: (params?: ListParams & { window?: string; in_stock_only?: boolean }) =>
    api
      .get<ApiEnvelope<InventoryBatchDto[]>>(`/v1/inventory/expiry${buildQuery(params)}`)
      .then(paginated),

  batches: (params?: ListParams) =>
    api
      .get<ApiEnvelope<InventoryBatchDto[]>>(`/v1/inventory/batches${buildQuery(params)}`)
      .then(paginated),

  batch: (id: number | string) =>
    api.get<ApiEnvelope<InventoryBatchDto>>(`/v1/inventory/batches/${id}`).then((r) => r.data),

  createBatch: (body: CreateInventoryBatchInput) =>
    api
      .post<ApiEnvelope<InventoryBatchDto>>("/v1/inventory/batches", body, { idempotent: true })
      .then((r) => r.data),

  adjustBatch: (id: number | string, body: AdjustInventoryBatchInput) =>
    api
      .post<ApiEnvelope<InventoryBatchDto>>(`/v1/inventory/batches/${id}/adjust`, body, { idempotent: true })
      .then((r) => r.data),
};
