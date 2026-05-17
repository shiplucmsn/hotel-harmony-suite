import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";

export type CompanyModuleRow = {
  key: string;
  name: string;
  enabled: boolean;
  always_enabled: boolean;
  source?: string | null;
};

export type CompanyModulesPayload = {
  company_id: number;
  company_slug?: string;
  modules: CompanyModuleRow[];
  enabled_keys: string[];
};

export const platformApi = {
  catalog: () =>
    api
      .get<ApiEnvelope<{ key: string; name: string; always_enabled?: boolean }[]>>(
        "/v1/platform/modules/catalog"
      )
      .then((r) => r.data),

  companyModules: (companyId: number) =>
    api
      .get<ApiEnvelope<CompanyModulesPayload>>(`/v1/platform/companies/${companyId}/modules`)
      .then((r) => r.data),

  syncCompanyModules: (companyId: number, moduleKeys: string[], source = "manual") =>
    api
      .put<ApiEnvelope<CompanyModulesPayload>>(`/v1/platform/companies/${companyId}/modules`, {
        module_keys: moduleKeys,
        source,
      })
      .then((r) => r.data),

  currentCompanyModules: () =>
    api.get<ApiEnvelope<CompanyModulesPayload>>("/v1/company/modules").then((r) => r.data),
};
