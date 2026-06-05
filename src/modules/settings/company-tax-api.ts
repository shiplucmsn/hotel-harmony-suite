import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";

export type TaxRuleDto = {
  id: number;
  uuid: string;
  branch_id: number | null;
  code: string;
  name: string;
  rate: number;
  type: string;
  is_compound: boolean;
  is_active: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
};

export type TaxRuleInput = {
  code: string;
  name: string;
  rate: number;
  type?: string;
  is_compound?: boolean;
  is_active?: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
};

type TaxListMeta = {
  pagination?: { total?: number };
};

export const companyTaxApi = {
  list: (per_page = 50) =>
    api.get<ApiEnvelope<TaxRuleDto[], TaxListMeta>>(
      `/v1/company/tax-rules?per_page=${per_page}`,
    ),

  create: (payload: TaxRuleInput) =>
    api.post<ApiEnvelope<TaxRuleDto>>("/v1/company/tax-rules", payload, {
      idempotent: true,
    }),

  update: (id: number, payload: Partial<TaxRuleInput>) =>
    api.patch<ApiEnvelope<TaxRuleDto>>(`/v1/company/tax-rules/${id}`, payload),

  remove: (id: number) =>
    api.delete<ApiEnvelope<null>>(`/v1/company/tax-rules/${id}`),
};

export function formatTaxRate(rule: TaxRuleDto): string {
  if (rule.type === "percentage" || !rule.type) {
    return `${rule.rate}%`;
  }
  return String(rule.rate);
}
