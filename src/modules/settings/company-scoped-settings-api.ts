import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";

export type ScopedSettingDto = {
  id: number;
  branch_id: number | null;
  group: string;
  key: string;
  value: unknown;
  value_type: string;
  is_public: boolean;
  updated_at?: string | null;
};

export type ScopedSettingInput = {
  value: unknown;
  value_type?: string;
  is_public?: boolean;
};

export const companyScopedSettingsApi = {
  list: (group?: string) => {
    const qs = group ? `?group=${encodeURIComponent(group)}` : "";
    return api.get<ApiEnvelope<ScopedSettingDto[]>>(`/v1/company/scoped-settings${qs}`);
  },

  upsert: (group: string, key: string, payload: ScopedSettingInput) =>
    api.put<ApiEnvelope<ScopedSettingDto>>(
      `/v1/company/scoped-settings/${encodeURIComponent(group)}/${encodeURIComponent(key)}`,
      payload,
    ),
};

export function readBooleanSetting(
  settings: ScopedSettingDto[],
  key: string,
  fallback = false,
): boolean {
  const row = settings.find((s) => s.key === key);
  if (!row) return fallback;
  if (typeof row.value === "boolean") return row.value;
  if (row.value === "true" || row.value === 1 || row.value === "1") return true;
  if (row.value === "false" || row.value === 0 || row.value === "0") return false;
  return fallback;
}
