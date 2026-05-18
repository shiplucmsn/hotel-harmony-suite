import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type {
  CreateCustomerInput,
  CreateInvoiceInput,
  CreateLeadInput,
  CreateOrderInput,
  CreatePaymentInput,
  CrmAnalyticsDto,
  CrmAnalyticsFilters,
  CrmContactDto,
  CreateContactInput,
  CrmCustomerDto,
  UpdateContactInput,
  CrmInvoiceDto,
  CrmLeadDto,
  CrmOrderDto,
  CrmPaymentDto,
  CustomerLedgerEntryDto,
  PaginatedResult,
} from "@/modules/crm/types";

type ListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  customer_id?: number | string;
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

export const crmApi = {
  analytics: (params?: CrmAnalyticsFilters) =>
    api.get<ApiEnvelope<CrmAnalyticsDto>>(`/v1/crm/analytics${buildQuery(params)}`).then((r) => r.data),

  contacts: (params?: ListParams) =>
    api.get<ApiEnvelope<CrmContactDto[]>>(`/v1/crm/contacts${buildQuery(params)}`).then((res) => ({
      data: Array.isArray(res.data) ? res.data : [],
      pagination: res.meta?.pagination,
    })),

  contact: (id: number | string) =>
    api.get<ApiEnvelope<CrmContactDto>>(`/v1/crm/contacts/${id}`).then((r) => r.data),

  createContact: (body: CreateContactInput) =>
    api.post<ApiEnvelope<CrmContactDto>>("/v1/crm/contacts", body, { idempotent: true }).then((r) => r.data),

  updateContact: (id: number | string, body: UpdateContactInput) =>
    api
      .patch<ApiEnvelope<CrmContactDto>>(`/v1/crm/contacts/${id}`, body, { idempotent: true })
      .then((r) => r.data),

  deleteContact: (id: number | string) =>
    api.delete<ApiEnvelope<{ deleted: boolean }>>(`/v1/crm/contacts/${id}`, { idempotent: true }),

  leads: (params?: ListParams) =>
    api.get<ApiEnvelope<CrmLeadDto[]>>(`/v1/crm/leads${buildQuery(params)}`).then(paginated),

  createLead: (body: CreateLeadInput) =>
    api.post<ApiEnvelope<CrmLeadDto>>("/v1/crm/leads", body, { idempotent: true }).then((r) => r.data),

  convertLead: (id: number | string) =>
    api
      .post<ApiEnvelope<CrmCustomerDto>>(`/v1/crm/leads/${id}/convert`, {}, { idempotent: true })
      .then((r) => r.data),

  customers: (params?: ListParams) =>
    api.get<ApiEnvelope<CrmCustomerDto[]>>(`/v1/crm/customers${buildQuery(params)}`).then(paginated),

  customer: (id: number | string) =>
    api.get<ApiEnvelope<CrmCustomerDto>>(`/v1/crm/customers/${id}`).then((r) => r.data),

  createCustomer: (body: CreateCustomerInput) =>
    api.post<ApiEnvelope<CrmCustomerDto>>("/v1/crm/customers", body, { idempotent: true }).then((r) => r.data),

  customerLedger: (id: number | string, params?: ListParams) =>
    api
      .get<ApiEnvelope<CustomerLedgerEntryDto[]>>(`/v1/crm/customers/${id}/ledger${buildQuery(params)}`)
      .then(paginated),

  orders: (params?: ListParams) =>
    api.get<ApiEnvelope<CrmOrderDto[]>>(`/v1/crm/orders${buildQuery(params)}`).then(paginated),

  createOrder: (body: CreateOrderInput) =>
    api.post<ApiEnvelope<CrmOrderDto>>("/v1/crm/orders", body, { idempotent: true }).then((r) => r.data),

  fulfillOrder: (id: number | string, body?: { warehouse_id?: number }) =>
    api
      .post<ApiEnvelope<CrmOrderDto>>(`/v1/crm/orders/${id}/fulfill`, body ?? {}, { idempotent: true })
      .then((r) => r),

  invoices: (params?: ListParams) =>
    api.get<ApiEnvelope<CrmInvoiceDto[]>>(`/v1/crm/invoices${buildQuery(params)}`).then(paginated),

  createInvoice: (body: CreateInvoiceInput) =>
    api.post<ApiEnvelope<CrmInvoiceDto>>("/v1/crm/invoices", body, { idempotent: true }).then((r) => r),

  payments: (params?: ListParams) =>
    api.get<ApiEnvelope<CrmPaymentDto[]>>(`/v1/crm/payments${buildQuery(params)}`).then(paginated),

  createPayment: (body: CreatePaymentInput) =>
    api.post<ApiEnvelope<unknown>>("/v1/crm/payments", body, { idempotent: true }).then((r) => r),
};
