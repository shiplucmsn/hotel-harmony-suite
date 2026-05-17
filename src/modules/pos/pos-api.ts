import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type {
  CheckoutInput,
  CreateCartLineInput,
  PaginatedResult,
  PosCartDto,
  PosReceiptDto,
  PosReturnDto,
  PosSaleDto,
} from "@/modules/pos/types";

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

export const posApi = {
  createCart: (body?: { session_id?: number; customer_id?: number; warehouse_id?: number }) =>
    api.post<ApiEnvelope<PosCartDto>>("/v1/pos/carts", body ?? {}, { idempotent: true }).then((r) => r.data),

  getCart: (id: number | string) =>
    api.get<ApiEnvelope<PosCartDto>>(`/v1/pos/carts/${id}`).then((r) => r.data),

  addCartLine: (cartId: number | string, body: CreateCartLineInput) =>
    api
      .post<ApiEnvelope<PosCartDto>>(`/v1/pos/carts/${cartId}/lines`, body, { idempotent: true })
      .then((r) => r.data),

  updateCartLine: (cartId: number | string, lineId: number, body: CreateCartLineInput) =>
    api
      .patch<ApiEnvelope<PosCartDto>>(`/v1/pos/carts/${cartId}/lines/${lineId}`, body, { idempotent: true })
      .then((r) => r.data),

  removeCartLine: (cartId: number | string, lineId: number) =>
    api
      .delete<ApiEnvelope<PosCartDto>>(`/v1/pos/carts/${cartId}/lines/${lineId}`, { idempotent: true })
      .then((r) => r.data),

  applyCartDiscount: (
    cartId: number | string,
    body: { discount_amount?: number; discount_percent?: number; tax_amount?: number },
  ) =>
    api
      .post<ApiEnvelope<PosCartDto>>(`/v1/pos/carts/${cartId}/discount`, body, { idempotent: true })
      .then((r) => r.data),

  checkout: (cartId: number | string, body: CheckoutInput) =>
    api.post<ApiEnvelope<PosSaleDto>>(`/v1/pos/carts/${cartId}/checkout`, body, { idempotent: true }),

  sale: (id: number | string) =>
    api.get<ApiEnvelope<PosSaleDto>>(`/v1/pos/sales/${id}`).then((r) => r.data),

  saleReceipt: (id: number | string) =>
    api.get<ApiEnvelope<PosReceiptDto>>(`/v1/pos/sales/${id}/receipt`).then((r) => r.data),

  sales: (params?: { per_page?: number }) =>
    api.get<ApiEnvelope<PosSaleDto[]>>(`/v1/pos/sales${buildQuery(params)}`).then(paginated),

  postReturn: (body: {
    sale_id: number;
    lines: Array<{ sale_line_id?: number; sku?: string; quantity: number }>;
    tax_amount?: number;
    refund_method?: string;
    reason?: string;
  }) =>
    api.post<ApiEnvelope<PosReturnDto>>("/v1/pos/returns", body, { idempotent: true }).then((r) => r.data),

  returnReceipt: (id: number | string) =>
    api.get<ApiEnvelope<PosReceiptDto>>(`/v1/pos/returns/${id}/receipt`).then((r) => r.data),
};
