import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  connectEcho,
  echoUserNotificationsChannel,
  fetchBroadcastClientConfig,
  NOTIFICATION_CREATED_EVENT,
  type BroadcastClientConfig,
} from "@/lib/realtime/echo-client";
import { notificationKeys } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { showRealtimeToastOnce } from "@/lib/realtime/realtime-toast";
import { setNotificationRealtimeActive } from "@/lib/realtime/realtime-state";
import type { NotificationDto } from "@/modules/core/notifications-api";

type NotificationCreatedPayload = {
  notification?: NotificationDto;
};

export function useNotificationRealtime(authReady = true) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!authReady) {
      setNotificationRealtimeActive(false);
      return;
    }

    let cancelled = false;
    let channel: { stopListening: (event: string) => void; unsubscribe: () => void } | null = null;

    const setup = async () => {
      try {
        const config: BroadcastClientConfig | null = await fetchBroadcastClientConfig(user?.id);
        const userId = config?.user_id ?? (user?.id != null ? Number(user.id) : null);
        if (cancelled || !config || !userId) {
          setNotificationRealtimeActive(false);
          return;
        }

        const echo = await connectEcho(config);
        if (cancelled || !echo) {
          setNotificationRealtimeActive(false);
          return;
        }

        const name = echoUserNotificationsChannel(userId);
        const ch = echo.private(name);

        const onCreated = (payload: NotificationCreatedPayload) => {
          const n = payload.notification;
          if (!n) return;

          queryClient.setQueriesData<{ data: NotificationDto[]; meta?: unknown }>(
            { queryKey: notificationKeys.all },
            (old) => {
              const rows = old?.data ?? [];
              if (rows.some((row) => row.id === n.id)) {
                return old ?? { data: rows };
              }
              return { ...old, data: [n, ...rows] };
            },
          );

          void queryClient.invalidateQueries({ queryKey: notificationKeys.all });

          if (n.unread) {
            const messageId =
              typeof n.data?.message_id === "number" ? n.data.message_id : n.id;
            showRealtimeToastOnce(`notif-${messageId}`, () => {
              toast.info(n.title, {
                description: n.body ?? undefined,
                duration: 8_000,
              });
            });
          }
        };

        ch.listen(NOTIFICATION_CREATED_EVENT, onCreated);
        ch.listen("Core.Notification.Created", onCreated);
        ch.subscribed(() => {
          setNotificationRealtimeActive(true);
        });
        ch.error(() => {
          setNotificationRealtimeActive(false);
          if (import.meta.env.DEV) {
            console.warn("[realtime] notification channel subscription failed");
          }
        });

        channel = ch;
      } catch (error) {
        setNotificationRealtimeActive(false);
        if (import.meta.env.DEV) {
          console.warn("[realtime] notification channel failed", error);
        }
      }
    };

    void setup();

    return () => {
      cancelled = true;
      setNotificationRealtimeActive(false);
      channel?.stopListening(NOTIFICATION_CREATED_EVENT);
      channel?.stopListening("Core.Notification.Created");
      channel?.unsubscribe();
    };
  }, [authReady, queryClient, user?.id]);
}
