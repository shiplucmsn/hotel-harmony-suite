import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";

export type RegisterWorkspaceInput = {
  company_name: string;
  slug: string;
  owner_name: string;
  owner_email: string;
  password: string;
  timezone?: string;
  currency_code?: string;
};

export type RegisterWorkspaceResult = {
  tenant_id: string;
  company_id: number;
  name: string;
  primary_host: string;
  trial_ends_at?: string | null;
  subscription_status?: string;
  login_url: string;
};

export const workspaceRegisterApi = {
  register: (body: RegisterWorkspaceInput) =>
    api.post<ApiEnvelope<RegisterWorkspaceResult>>("/v1/public/workspaces/register", body),
};
