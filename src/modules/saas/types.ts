import type { ApiMetaSideEffect } from "@/services/api/types";

export type PaginatedResult<T> = {
  data: T[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
};

export type SaasPlanDto = {
  id: number;
  uuid: string;
  code: string;
  name: string;
  description?: string | null;
  currency_code: string;
  price_monthly: number;
  price_yearly: number;
  trial_days: number;
  seats_limit?: number | null;
  storage_limit_mb?: number | null;
  api_calls_limit?: number | null;
  module_keys: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type SaasSubscriptionDto = {
  id: number;
  uuid: string;
  tenant_id: string;
  company_id: number;
  status: string;
  billing_cycle: "monthly" | "yearly" | string;
  seats_allocated: number;
  plan?: SaasPlanDto | null;
  started_at?: string | null;
  trial_ends_at?: string | null;
  current_period_starts_at?: string | null;
  current_period_ends_at?: string | null;
  grace_ends_at?: string | null;
  cancelled_at?: string | null;
  meta?: Record<string, unknown>;
};

export type SaasBillingInvoiceDto = {
  id: number;
  uuid: string;
  tenant_id: string;
  company_id: number;
  subscription_id: number;
  invoice_no: string;
  status: string;
  currency_code: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  period_start?: string | null;
  period_end?: string | null;
  issued_at?: string | null;
  due_at?: string | null;
  paid_at?: string | null;
  line_items?: Array<Record<string, unknown>>;
  subscription?: {
    id: number;
    status: string;
    plan?: { id: number; code: string; name: string } | null;
  };
  created_at?: string;
};

export type SaasUsageSnapshotDto = {
  id: number;
  uuid: string;
  tenant_id: string;
  company_id: number;
  subscription_id: number;
  metric_key: string;
  used_value: number;
  limit_value?: number | null;
  overage_value: number;
  period_start?: string;
  period_end?: string;
};

export type TenantDto = {
  id: number;
  slug: string;
  name: string;
  status: string;
  company_id?: number | null;
  created_at?: string;
  company?: { id: number; slug: string; name: string; status?: string };
};

export type ProvisionTenantInput = {
  slug: string;
  name: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  currency_code?: string;
  owner_name?: string;
  owner_email: string;
  owner_password?: string;
  plan_id?: number;
  plan_code?: string;
  billing_cycle?: "monthly" | "yearly";
  seats_allocated?: number;
};

export type ProvisionTenantResult = {
  tenant: TenantDto;
  company: { id: number; slug: string; name: string; status?: string };
  subscription: SaasSubscriptionDto;
  owner_user: { id: number; email: string; name: string };
  owner_temp_password?: string;
};

export type CreateSaasPlanInput = {
  code: string;
  name: string;
  description?: string;
  currency_code?: string;
  price_monthly?: number;
  price_yearly?: number;
  trial_days?: number;
  seats_limit?: number | null;
  storage_limit_mb?: number | null;
  api_calls_limit?: number | null;
  module_keys?: string[];
  is_active?: boolean;
};

export type UpdateSaasPlanInput = Partial<CreateSaasPlanInput>;

export type ApiEnvelope<T> = {
  data: T;
  meta?: {
    requestId?: string;
    correlationId?: string;
    sideEffects?: ApiMetaSideEffect[];
    pagination?: PaginatedResult<unknown>["pagination"];
  };
};
