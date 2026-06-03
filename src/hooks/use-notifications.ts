import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { withTenantKey } from "@/lib/tenant-query";
import { notificationsApi } from "@/modules/core/notifications-api";

export const notificationKeys = {
  all: () => withTenantKey(["notifications"] as const),
  list: (params?: { unread?: boolean }) => withTenantKey(["notifications", "list", params] as const),
  unreadCount: () => withTenantKey(["notifications", "unread-count"] as const),
};

const NOTIFICATION_POLL_MS = 15_000;

export function useNotifications(params?: { per_page?: number; unread?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.list(params),
    staleTime: 0,
    refetchInterval: NOTIFICATION_POLL_MS,
    refetchOnWindowFocus: true,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.unreadCount(),
    staleTime: 0,
    refetchInterval: NOTIFICATION_POLL_MS,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => notificationsApi.markRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationKeys.all() });

      const previousLists = qc.getQueriesData<{ data: { id: number | string; unread?: boolean }[] }>({
        queryKey: notificationKeys.all(),
      });

      qc.setQueriesData<{ data: { id: number | string; unread?: boolean }[] }>(
        { queryKey: notificationKeys.all() },
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((n) => (n.id === id ? { ...n, unread: false } : n)),
          };
        },
      );

      const previousCount = qc.getQueryData<number>(notificationKeys.unreadCount());
      if (typeof previousCount === "number" && previousCount > 0) {
        qc.setQueryData(notificationKeys.unreadCount(), previousCount - 1);
      }

      return { previousLists, previousCount };
    },
    onError: (_err, _id, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          qc.setQueryData(key, data);
        }
      }
      if (context?.previousCount !== undefined) {
        qc.setQueryData(notificationKeys.unreadCount(), context.previousCount);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all() });
    },
  });
}

export function useMarkTicketNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: number | string) => notificationsApi.markTicketRead(ticketId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all() });
    },
  });
}
