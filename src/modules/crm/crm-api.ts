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
  CrmDealDto,
  CrmPipelineDto,
  CreateDealInput,
  UpdateDealInput,
  CrmInvoiceDto,
  CrmLeadDto,
  CrmOrderDto,
  CrmQuotationDto,
  CreateQuotationInput,
  UpdateQuotationInput,
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

  pipeline: (params?: { search?: string }) =>
    api.get<ApiEnvelope<CrmPipelineDto>>(`/v1/crm/pipeline${buildQuery(params)}`).then((r) => r.data),

  deals: (params?: ListParams) =>
    api.get<ApiEnvelope<CrmDealDto[]>>(`/v1/crm/deals${buildQuery(params)}`).then(paginated),

  deal: (id: number | string) =>
    api.get<ApiEnvelope<CrmDealDto>>(`/v1/crm/deals/${id}`).then((r) => r.data),

  createDeal: (body: CreateDealInput) =>
    api.post<ApiEnvelope<CrmDealDto>>("/v1/crm/deals", body, { idempotent: true }).then((r) => r.data),

  updateDeal: (id: number | string, body: UpdateDealInput) =>
    api.patch<ApiEnvelope<CrmDealDto>>(`/v1/crm/deals/${id}`, body, { idempotent: true }).then((r) => r.data),

  deleteDeal: (id: number | string) =>
    api.delete<ApiEnvelope<{ deleted: boolean }>>(`/v1/crm/deals/${id}`, { idempotent: true }),

  leads: (params?: ListParams) =>
    api.get<ApiEnvelope<CrmLeadDto[]>>(`/v1/crm/leads${buildQuery(params)}`).then(paginated),

  createLead: (body: CreateLeadInput) =>
    api.post<ApiEnvelope<CrmLeadDto>>("/v1/crm/leads", body, { idempotent: true }).then((r) => r.data),

  convertLead: (id: number | string) =>
    api
      .post<ApiEnvelope<CrmCustomerDto>>(`/v1/crm/leads/${id}/convert`, {}, { idempotent: true })
      .then((r) => r.data),

  moveLeadPipeline: (id: number | string, stage: string) =>
    api
      .post<ApiEnvelope<CrmLeadDto>>(`/v1/crm/leads/${id}/pipeline-move`, { stage }, { idempotent: true })
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

  quotations: (params?: ListParams) =>
    api.get<ApiEnvelope<CrmQuotationDto[]>>(`/v1/crm/quotations${buildQuery(params)}`).then(paginated),

  quotation: (id: number | string) =>
    api.get<ApiEnvelope<CrmQuotationDto>>(`/v1/crm/quotations/${id}`).then((r) => r.data),

  createQuotation: (body: CreateQuotationInput) =>
    api.post<ApiEnvelope<CrmQuotationDto>>("/v1/crm/quotations", body, { idempotent: true }),

  updateQuotation: (id: number | string, body: UpdateQuotationInput) =>
    api.patch<ApiEnvelope<CrmQuotationDto>>(`/v1/crm/quotations/${id}`, body, { idempotent: true }),

  deleteQuotation: (id: number | string) =>
    api.delete<ApiEnvelope<{ deleted: boolean }>>(`/v1/crm/quotations/${id}`, { idempotent: true }),

  convertQuotation: (id: number | string) =>
    api
      .post<ApiEnvelope<CrmOrderDto>>(`/v1/crm/quotations/${id}/convert`, {}, { idempotent: true })
      .then((r) => r),

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
