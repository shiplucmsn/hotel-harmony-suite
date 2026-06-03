import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";

export type BranchAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export type BranchDto = {
  id: number;
  uuid: string;
  code: string;
  name: string;
  is_head_office: boolean;
  email?: string | null;
  phone?: string | null;
  address?: BranchAddress | null;
  status: string;
  users_count?: number;
};

export type BranchInput = {
  code?: string;
  name: string;
  is_head_office?: boolean;
  email?: string | null;
  phone?: string | null;
  address?: BranchAddress | null;
  status?: string;
};

type BranchListMeta = {
  pagination?: { total?: number };
};

export const tenantBranchesApi = {
  list: (per_page = 50) =>
    api.get<ApiEnvelope<BranchDto[], BranchListMeta>>(
      `/v1/tenant/branches?per_page=${per_page}`,
    ),

  create: (payload: BranchInput) =>
    api.post<ApiEnvelope<BranchDto>>("/v1/tenant/branches", payload, { idempotent: true }),

  update: (id: number, payload: Partial<BranchInput>) =>
    api.patch<ApiEnvelope<BranchDto>>(`/v1/tenant/branches/${id}`, payload),

  remove: (id: number) => api.delete<ApiEnvelope<null>>(`/v1/tenant/branches/${id}`),
};

export function formatBranchLocation(address?: BranchAddress | null): string {
  if (!address) return "—";
  const parts = [address.city, address.state, address.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : address.line1 ?? "—";
}
