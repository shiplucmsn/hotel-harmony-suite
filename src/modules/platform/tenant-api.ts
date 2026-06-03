import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";

export type TenantBrandingDto = {
  app_name?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  primary_color?: string | null;
};

export type TenantDomainDto = {
  id: number;
  host: string;
  type: string;
  is_primary: boolean;
  status: string;
  verified_at?: string | null;
  verification?: { txt_host?: string | null; txt_value?: string | null } | null;
};

export type TenantBranchDto = {
  id: number;
  uuid?: string;
  code: string;
  name: string;
  is_head_office?: boolean;
  status?: string;
};

export type TenantContextDto = {
  tenant_id: string;
  company_id?: number | null;
  name?: string | null;
  slug?: string | null;
  status?: string | null;
  timezone?: string | null;
  currency_code?: string | null;
  enabled_modules?: string[];
  subscription_status?: string | null;
  trial_ends_at?: string | null;
  is_restricted?: boolean;
  primary_host?: string | null;
  branding?: TenantBrandingDto;
  domains?: TenantDomainDto[];
  branches?: TenantBranchDto[];
  active_branch_id?: number | null;
  can_switch_branch?: boolean;
  user_branch_id?: number | null;
};

export type PublicTenantResolveDto = {
  tenant_id: string;
  company_id: number;
  host: string;
  domain_type: string;
  branding: TenantBrandingDto;
};

export const tenantApi = {
  context: () => api.get<ApiEnvelope<TenantContextDto>>("/v1/tenant/context"),
  updateActiveBranch: (branchId: number) =>
    api.patch<ApiEnvelope<{ active_branch_id: number }>>("/v1/tenant/active-branch", {
      branch_id: branchId,
    }),
  resolvePublic: (host: string) =>
    api.get<ApiEnvelope<PublicTenantResolveDto>>(
      `/v1/public/tenant/resolve?host=${encodeURIComponent(host)}`,
    ),
  getBranding: () => api.get<ApiEnvelope<TenantBrandingDto>>("/v1/tenant/branding"),
  updateBranding: (body: Partial<TenantBrandingDto>) =>
    api.patch<ApiEnvelope<TenantBrandingDto>>("/v1/tenant/branding", body),
  listDomains: () => api.get<ApiEnvelope<TenantDomainDto[]>>("/v1/tenant/domains"),
  addDomain: (body: { host: string }) =>
    api.post<ApiEnvelope<TenantDomainDto>>("/v1/tenant/domains", body),
  verifyDomain: (id: number) =>
    api.post<ApiEnvelope<TenantDomainDto>>(`/v1/tenant/domains/${id}/verify`),
  deleteDomain: (id: number) => api.delete<ApiEnvelope<null>>(`/v1/tenant/domains/${id}`),
};
