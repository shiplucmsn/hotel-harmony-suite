import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/lib/api-meta";

export type NotificationDto = {
  id: number;
  uuid?: string;
  type: string;
  title: string;
  body?: string | null;
  data?: Record<string, unknown>;
  read_at?: string | null;
  unread: boolean;
  time?: string;
  created_at?: string;
};

type ListMeta = {
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export const notificationsApi = {
  list: (params?: { per_page?: number; unread?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.per_page) q.set("per_page", String(params.per_page));
    if (params?.unread) q.set("unread", "1");
    const qs = q.toString();

    return api
      .get<ApiEnvelope<NotificationDto[]>>(`/v1/notifications${qs ? `?${qs}` : ""}`)
      .then((r) => ({ data: r.data ?? [], meta: r.meta as ListMeta }));
  },

  unreadCount: () =>
    api.get<ApiEnvelope<{ count: number }>>("/v1/notifications/unread-count").then((r) => r.data?.count ?? 0),

  markRead: (id: number | string) =>
    api.patch<ApiEnvelope<NotificationDto>>(`/v1/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.post<ApiEnvelope<{ marked: number }>>("/v1/notifications/read-all").then((r) => r.data?.marked ?? 0),
};
