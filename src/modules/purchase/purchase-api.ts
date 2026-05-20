import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type {
  CreateGrnInput,
  CreatePurchaseOrderInput,
  CreatePurchaseReturnInput,
  CreateSupplierInput,
  CreateVendorPaymentInput,
  PaginatedResult,
  PurchaseGrnDto,
  PurchaseOrderDto,
  PurchaseReturnDto,
  SupplierDto,
  UpdateSupplierInput,
  VendorLedgerEntryDto,
  VendorPaymentDto,
} from "@/modules/purchase/types";

type ListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  supplier_id?: number;
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

export const purchaseApi = {
  suppliers: (params?: ListParams) =>
    api
      .get<ApiEnvelope<SupplierDto[]>>(`/v1/purchase/suppliers${buildQuery(params)}`)
      .then(paginated),

  supplier: (id: number | string) =>
    api.get<ApiEnvelope<SupplierDto>>(`/v1/purchase/suppliers/${id}`).then((r) => r.data),

  createSupplier: (body: CreateSupplierInput) =>
    api
      .post<ApiEnvelope<SupplierDto>>("/v1/purchase/suppliers", body, { idempotent: true })
      .then((r) => r.data),

  updateSupplier: (id: number | string, body: UpdateSupplierInput) =>
    api
      .patch<ApiEnvelope<SupplierDto>>(`/v1/purchase/suppliers/${id}`, body, { idempotent: true })
      .then((r) => r.data),

  supplierLedger: (id: number | string, params?: { page?: number; per_page?: number }) =>
    api
      .get<ApiEnvelope<VendorLedgerEntryDto[]>>(
        `/v1/purchase/suppliers/${id}/ledger${buildQuery(params)}`,
      )
      .then(paginated),

  orders: (params?: ListParams) =>
    api
      .get<ApiEnvelope<PurchaseOrderDto[]>>(`/v1/purchase/orders${buildQuery(params)}`)
      .then(paginated),

  order: (id: number | string) =>
    api.get<ApiEnvelope<PurchaseOrderDto>>(`/v1/purchase/orders/${id}`).then((r) => r.data),

  createOrder: (body: CreatePurchaseOrderInput) =>
    api
      .post<ApiEnvelope<PurchaseOrderDto>>("/v1/purchase/orders", body, { idempotent: true })
      .then((r) => r.data),

  cancelOrder: (id: number | string) =>
    api
      .post<ApiEnvelope<PurchaseOrderDto>>(`/v1/purchase/orders/${id}/cancel`, {}, { idempotent: true })
      .then((r) => r.data),

  payments: (params?: ListParams) =>
    api
      .get<ApiEnvelope<VendorPaymentDto[]>>(`/v1/purchase/payments${buildQuery(params)}`)
      .then(paginated),

  createPayment: (body: CreateVendorPaymentInput) =>
    api
      .post<ApiEnvelope<VendorPaymentDto>>("/v1/purchase/payments", body, { idempotent: true })
      .then((r) => r.data),

  grns: (params?: ListParams) =>
    api
      .get<ApiEnvelope<PurchaseGrnDto[]>>(`/v1/purchase/grns${buildQuery(params)}`)
      .then(paginated),

  createGrn: (body: CreateGrnInput) =>
    api
      .post<ApiEnvelope<{ grn: PurchaseGrnDto }>>("/v1/purchase/grn", body, { idempotent: true })
      .then((r) => r.data?.grn ?? (r.data as unknown as PurchaseGrnDto)),

  returns: (params?: ListParams) =>
    api
      .get<ApiEnvelope<PurchaseReturnDto[]>>(`/v1/purchase/returns${buildQuery(params)}`)
      .then(paginated),

  createReturn: (body: CreatePurchaseReturnInput) =>
    api
      .post<ApiEnvelope<PurchaseReturnDto>>("/v1/purchase/returns", body, { idempotent: true })
      .then((r) => r.data),
};
