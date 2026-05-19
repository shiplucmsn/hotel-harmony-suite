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
import type { NotificationDto } from "@/modules/core/notifications-api";

type NotificationCreatedPayload = {
  notification?: NotificationDto;
};

export function useNotificationRealtime(authReady = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;
    let channel: { stopListening: (event: string) => void; unsubscribe: () => void } | null = null;

    const setup = async () => {
      try {
        const config: BroadcastClientConfig | null = await fetchBroadcastClientConfig();
        if (cancelled || !config?.user_id) return;

        const echo = await connectEcho(config);
        if (cancelled || !echo) return;

        const name = echoUserNotificationsChannel(config.user_id);
        const ch = echo.private(name);

        const onCreated = (payload: NotificationCreatedPayload) => {
          const n = payload.notification;
          if (!n) return;

          void queryClient.invalidateQueries({ queryKey: notificationKeys.all });

          if (n.unread) {
            toast.info(n.title, {
              description: n.body ?? undefined,
              duration: 8_000,
            });
          }
        };

        ch.listen(NOTIFICATION_CREATED_EVENT, onCreated);
        ch.listen("Core.Notification.Created", onCreated);

        channel = ch;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("[realtime] notification channel failed", error);
        }
      }
    };

    void setup();

    return () => {
      cancelled = true;
      channel?.stopListening(NOTIFICATION_CREATED_EVENT);
      channel?.stopListening("Core.Notification.Created");
      channel?.unsubscribe();
    };
  }, [authReady, queryClient]);
}
