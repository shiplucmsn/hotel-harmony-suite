import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type {
  CreateGrnInput,
  PurchaseActivityDto,
  PurchaseApSummaryDto,
  PurchaseOpenSummaryDto,
  SupplierSuggestionDto,
  CreatePurchaseOrderInput,
  CreatePurchaseReturnInput,
  CreateSupplierInput,
  CreateSupplierInvoiceInput,
  CreateVendorPaymentInput,
  SupplierInvoiceDto,
  PaginatedResult,
  PurchaseGrnDto,
  PurchaseOrderDto,
  PurchaseReturnDto,
  SupplierDto,
  UpdatePurchaseOrderInput,
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
  purchase_order_id?: number;
  uninvoiced?: boolean;
  invoiceable?: boolean;
  qc_status?: string;
};

function buildQuery(params?: Record<string, string | number | undefined>): string {
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
  const meta = res.meta as
    | { pagination?: PaginatedResult<T>["pagination"]; invoice_eligibility?: PaginatedResult<T>["invoiceEligibility"] }
    | undefined;
  return {
    data: Array.isArray(res.data) ? res.data : [],
    pagination: meta?.pagination,
    invoiceEligibility: meta?.invoice_eligibility,
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

  openOrdersSummary: () =>
    api
      .get<ApiEnvelope<PurchaseOpenSummaryDto>>("/v1/purchase/orders/open-summary")
      .then((r) => r.data),

  apSummary: () =>
    api.get<ApiEnvelope<PurchaseApSummaryDto>>("/v1/purchase/ap-summary").then((r) => r.data),

  order: (id: number | string) =>
    api.get<ApiEnvelope<PurchaseOrderDto>>(`/v1/purchase/orders/${id}`).then((r) => r.data),

  createOrder: (body: CreatePurchaseOrderInput) =>
    api.post<ApiEnvelope<PurchaseOrderDto>>("/v1/purchase/orders", body, { idempotent: true }),

  updateOrder: (id: number | string, body: UpdatePurchaseOrderInput) =>
    api.patch<ApiEnvelope<PurchaseOrderDto>>(`/v1/purchase/orders/${id}`, body, { idempotent: true }),

  submitOrder: (id: number | string, body?: { requires_approval?: boolean }) =>
    api.post<ApiEnvelope<PurchaseOrderDto>>(`/v1/purchase/orders/${id}/submit`, body ?? {}, {
      idempotent: true,
    }),

  approveOrder: (id: number | string) =>
    api.post<ApiEnvelope<PurchaseOrderDto>>(`/v1/purchase/orders/${id}/approve`, {}, { idempotent: true }),

  cancelOrder: (id: number | string) =>
    api.post<ApiEnvelope<PurchaseOrderDto>>(`/v1/purchase/orders/${id}/cancel`, {}, { idempotent: true }),

  payments: (params?: ListParams) =>
    api
      .get<ApiEnvelope<VendorPaymentDto[]>>(`/v1/purchase/payments${buildQuery(params)}`)
      .then(paginated),

  createPayment: (body: CreateVendorPaymentInput) =>
    api.post<ApiEnvelope<VendorPaymentDto>>("/v1/purchase/payments", body, { idempotent: true }),

  supplierInvoices: (params?: ListParams) =>
    api
      .get<ApiEnvelope<SupplierInvoiceDto[]>>(`/v1/purchase/supplier-invoices${buildQuery(params)}`)
      .then(paginated),

  supplierInvoice: (id: number | string) =>
    api.get<ApiEnvelope<SupplierInvoiceDto>>(`/v1/purchase/supplier-invoices/${id}`).then((r) => r.data),

  createSupplierInvoice: (body: CreateSupplierInvoiceInput) =>
    api
      .post<ApiEnvelope<SupplierInvoiceDto>>("/v1/purchase/supplier-invoices", body, { idempotent: true })
      .then((r) => r),

  matchSupplierInvoice: (id: number | string, body?: { force?: boolean }) =>
    api.post<ApiEnvelope<SupplierInvoiceDto>>(`/v1/purchase/supplier-invoices/${id}/match`, body ?? {}, {
      idempotent: true,
    }),

  approveSupplierInvoice: (id: number | string) =>
    api.post<ApiEnvelope<SupplierInvoiceDto>>(`/v1/purchase/supplier-invoices/${id}/approve`, {}, {
      idempotent: true,
    }),

  grns: (params?: ListParams) =>
    api
      .get<ApiEnvelope<PurchaseGrnDto[]>>(`/v1/purchase/grns${buildQuery(params)}`)
      .then(paginated),

  grn: (id: number | string) =>
    api.get<ApiEnvelope<PurchaseGrnDto>>(`/v1/purchase/grns/${id}`).then((r) => r.data),

  activity: (params?: {
    purchase_order_id?: number;
    purchase_grn_id?: number;
    supplier_id?: number;
    limit?: number;
  }) =>
    api
      .get<ApiEnvelope<PurchaseActivityDto[]>>(
        `/v1/purchase/activity${buildQuery(params as Record<string, string | number | undefined>)}`,
      )
      .then((r) => r.data ?? []),

  orderActivity: (orderId: number | string, limit = 50) =>
    api
      .get<ApiEnvelope<PurchaseActivityDto[]>>(`/v1/purchase/orders/${orderId}/activity?limit=${limit}`)
      .then((r) => r.data ?? []),

  supplierSuggestions: (sku: string) =>
    api
      .get<ApiEnvelope<SupplierSuggestionDto>>(`/v1/purchase/supplier-suggestions?sku=${encodeURIComponent(sku)}`)
      .then((r) => r.data),

  createGrn: (body: CreateGrnInput) =>
    api.post<ApiEnvelope<{ grnId?: number; grn?: PurchaseGrnDto; amount?: number }>>(
      "/v1/purchase/grn",
      body,
      { idempotent: true },
    ),

  voidGrn: (id: number | string) =>
    api.post<ApiEnvelope<PurchaseGrnDto>>(`/v1/purchase/grns/${id}/void`, {}, { idempotent: true }),

  grnQcQueue: (params?: { page?: number; per_page?: number; supplier_id?: number }) =>
    api
      .get<ApiEnvelope<PurchaseGrnDto[]>>(`/v1/purchase/grns/qc-queue${buildQuery(params)}`)
      .then(paginated),

  qcAcceptGrn: (id: number | string) =>
    api.post<ApiEnvelope<PurchaseGrnDto>>(`/v1/purchase/grns/${id}/qc-accept`, {}, { idempotent: true }),

  qcRejectGrn: (id: number | string, body?: { create_return?: boolean; notes?: string }) =>
    api.post<ApiEnvelope<PurchaseGrnDto>>(`/v1/purchase/grns/${id}/qc-reject`, body ?? {}, {
      idempotent: true,
    }),

  returns: (params?: ListParams) =>
    api
      .get<ApiEnvelope<PurchaseReturnDto[]>>(`/v1/purchase/returns${buildQuery(params)}`)
      .then(paginated),

  createReturn: (body: CreatePurchaseReturnInput) =>
    api.post<ApiEnvelope<PurchaseReturnDto>>("/v1/purchase/returns", body, { idempotent: true }),
};
