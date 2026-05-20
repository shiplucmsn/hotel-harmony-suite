import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";

export type NotificationCatalogItem = {
  key: string;
  module: string;
  label: string;
  description: string;
  trigger: string;
  default_enabled?: boolean;
  default_channels?: { email: boolean; push: boolean; sms: boolean };
  default_role_slugs?: string[];
};

export type NotificationPreference = {
  key: string;
  enabled: boolean;
  channels: { email: boolean; push: boolean; sms: boolean };
  role_slugs: string[];
};

export type NotificationChannelStatus = {
  email: { configured: boolean; label?: string };
  push: { configured: boolean; label?: string };
  sms: { configured: boolean; label?: string };
};

export type CompanySmsDto = {
  provider?: string;
  account_sid?: string | null;
  from_number?: string | null;
  has_auth_token?: boolean;
  updated_at?: string | null;
};

export const companyNotificationsApi = {
  catalog: () =>
    api
      .get<ApiEnvelope<{ catalog: NotificationCatalogItem[] }>>("/v1/company/notification-catalog")
      .then((r) => r.data?.catalog ?? []),

  preferences: () =>
    api
      .get<ApiEnvelope<{ preferences: Record<string, NotificationPreference> }>>(
        "/v1/company/notification-preferences",
      )
      .then((r) => r.data?.preferences ?? {}),

  savePreferences: (preferences: Record<string, Partial<NotificationPreference>>) =>
    api
      .put<ApiEnvelope<{ preferences: Record<string, NotificationPreference> }>>(
        "/v1/company/notification-preferences",
        { preferences },
      )
      .then((r) => r.data?.preferences ?? {}),

  channelStatus: () =>
    api
      .get<ApiEnvelope<{ channels: NotificationChannelStatus }>>("/v1/company/notification-channels")
      .then((r) => r.data?.channels),

  sms: () =>
    api.get<ApiEnvelope<{ sms: CompanySmsDto | null }>>("/v1/company/sms").then((r) => r.data?.sms),

  saveSms: (body: { account_sid: string; from_number: string; auth_token?: string | null }) =>
    api.put<ApiEnvelope<{ sms: CompanySmsDto }>>("/v1/company/sms", body).then((r) => r.data?.sms),

  testSms: (to?: string) =>
    api.post<ApiEnvelope<{ sent: boolean; to: string }>>("/v1/company/sms/test", to ? { to } : {}),
};
