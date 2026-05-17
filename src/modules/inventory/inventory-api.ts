import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type {
  CreateCategoryInput,
  CreateProductInput,
  InventoryCategoryDto,
  PaginatedResult,
  ProductDto,
  UpdateProductInput,
  WarehouseDto,
} from "@/modules/inventory/types";

type ListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
};

function buildQuery(params?: ListParams): string {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.per_page) q.set("per_page", String(params.per_page));
  if (params?.search) q.set("search", params.search);
  if (params?.status) q.set("status", params.status);
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
    api
      .post<ApiEnvelope<ProductDto>>("/v1/products", body, { idempotent: true })
      .then((r) => r),

  updateProduct: (id: number | string, body: UpdateProductInput) =>
    api
      .patch<ApiEnvelope<ProductDto>>(`/v1/products/${id}`, body, { idempotent: true })
      .then((r) => r),

  warehouses: () =>
    api
      .get<ApiEnvelope<WarehouseDto[]>>(`/v1/inventory/warehouses?per_page=100`)
      .then(paginated),

  items: () => inventoryApi.products({ per_page: 100 }),
};
