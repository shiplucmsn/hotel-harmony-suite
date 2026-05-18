import { api } from "@/lib/api-client";
import type {
  ApiEnvelope,
  CreateSaasPlanInput,
  PaginatedResult,
  ProvisionTenantInput,
  ProvisionTenantResult,
  SaasBillingInvoiceDto,
  SaasPlanDto,
  SaasSubscriptionDto,
  SaasUsageSnapshotDto,
  TenantDto,
  UpdateSaasPlanInput,
} from "@/modules/saas/types";

type ListParams = Record<string, string | number | boolean | undefined>;

function buildQuery(params?: ListParams): string {
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

export const saasApi = {
  tenants: (params?: ListParams) =>
    api.get<ApiEnvelope<TenantDto[]>>(`/v1/tenants${buildQuery(params)}`).then(paginated),

  provisionTenant: (body: ProvisionTenantInput) =>
    api.post<ApiEnvelope<ProvisionTenantResult>>("/v1/tenants/provision", body, { idempotent: true }),

  updateTenantStatus: (id: number | string, status: string) =>
    api.patch<ApiEnvelope<TenantDto>>(`/v1/tenants/${id}/status`, { status }, { idempotent: true }),

  plans: (params?: ListParams) =>
    api.get<ApiEnvelope<SaasPlanDto[]>>(`/v1/platform/saas/plans${buildQuery(params)}`).then(paginated),

  createPlan: (body: CreateSaasPlanInput) =>
    api.post<ApiEnvelope<SaasPlanDto>>("/v1/platform/saas/plans", body, { idempotent: true }),

  updatePlan: (id: number | string, body: UpdateSaasPlanInput) =>
    api.patch<ApiEnvelope<SaasPlanDto>>(`/v1/platform/saas/plans/${id}`, body, { idempotent: true }),

  subscriptions: (params?: ListParams) =>
    api
      .get<ApiEnvelope<SaasSubscriptionDto[]>>(`/v1/platform/saas/subscriptions${buildQuery(params)}`)
      .then(paginated),

  assignSubscription: (body: {
    tenant_id: string;
    plan_id: number;
    billing_cycle?: string;
    seats_allocated?: number;
    force_active?: boolean;
  }) =>
    api.post<ApiEnvelope<SaasSubscriptionDto>>("/v1/platform/saas/subscriptions/assign", body, {
      idempotent: true,
    }),

  changeSubscriptionStatus: (id: number | string, status: string) =>
    api.post<ApiEnvelope<SaasSubscriptionDto>>(
      `/v1/platform/saas/subscriptions/${id}/status`,
      { status },
      { idempotent: true }
    ),

  invoices: (params: ListParams & { tenant_id: string }) =>
    api
      .get<ApiEnvelope<SaasBillingInvoiceDto[]>>(`/v1/platform/saas/billing/invoices${buildQuery(params)}`)
      .then(paginated),

  issueInvoice: (body: { subscription_id: number; tax_rate?: number; due_days?: number }) =>
    api.post<ApiEnvelope<SaasBillingInvoiceDto>>("/v1/platform/saas/billing/invoices", body, {
      idempotent: true,
    }),

  markInvoicePaid: (id: number | string, amount?: number) =>
    api.post<ApiEnvelope<SaasBillingInvoiceDto>>(
      `/v1/platform/saas/billing/invoices/${id}/pay`,
      amount !== undefined ? { amount } : {},
      { idempotent: true }
    ),

  usage: (tenantId: string, params?: ListParams) =>
    api
      .get<ApiEnvelope<SaasUsageSnapshotDto[]>>(`/v1/platform/saas/usage/${tenantId}${buildQuery(params)}`)
      .then(paginated),
};
