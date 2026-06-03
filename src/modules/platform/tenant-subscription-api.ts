import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type { SaasPlanDto } from "@/modules/saas/types";

export type TenantSubscriptionDto = {
  id: number;
  status: string;
  billing_cycle?: string;
  trial_ends_at?: string | null;
  saas_plan_id?: number;
  plan?: SaasPlanDto;
};

export type TenantSubscriptionState = {
  subscription: TenantSubscriptionDto | null;
  enabled_modules: string[];
};

export const tenantSubscriptionApi = {
  listPlans: () => api.get<ApiEnvelope<SaasPlanDto[]>>("/v1/tenant/subscription/plans"),

  current: () => api.get<ApiEnvelope<TenantSubscriptionState>>("/v1/tenant/subscription"),

  upgrade: (plan_code: string) =>
    api.post<ApiEnvelope<TenantSubscriptionState & { plan: SaasPlanDto }>>(
      "/v1/tenant/subscription/upgrade",
      { plan_code },
      { idempotent: true },
    ),
};
