import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  connectEcho,
  disconnectEcho,
  echoChannelName,
  fetchBroadcastClientConfig,
  TICKET_MESSAGE_EVENT,
  type BroadcastClientConfig,
} from "@/lib/realtime/echo-client";
import { crmKeys } from "@/hooks/crm/use-crm";
import { setTicketRealtimeActive } from "@/lib/realtime/realtime-state";

type TicketMessagePayload = {
  ticket_id: number;
  ticket_number: string;
  ticket_subject?: string;
  customer?: string;
  message?: {
    id: number;
    from: string;
    author: string;
    body: string;
  };
  test?: boolean;
};

function messagePreview(body: string, max = 100): string {
  const trimmed = body.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max)}…`;
}

export function useTicketRealtime(authReady = true) {
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const notifiedIdsRef = useRef<Set<number>>(new Set());
  const configRef = useRef<BroadcastClientConfig | null>(null);

  useEffect(() => {
    if (!authReady) {
      setTicketRealtimeActive(false);
      return;
    }

    let cancelled = false;
    let channel: { stopListening: (event: string) => void; unsubscribe: () => void } | null = null;

    const setup = async () => {
      try {
        const config = await fetchBroadcastClientConfig();
        if (cancelled || !config) {
          setTicketRealtimeActive(false);
          return;
        }

        configRef.current = config;
        setTicketRealtimeActive(true);
        const echo = await connectEcho(config);
        if (cancelled || !echo) return;

        const name = echoChannelName(config.tenant_id);
        const ch = echo.private(name);

        const onMessage = (payload: TicketMessagePayload) => {
          if (payload.test) {
            toast.info("Realtime connection OK", {
              description: "Broadcast test received from server.",
            });
            return;
          }

          const msg = payload.message;
          if (!msg) return;

          void queryClient.invalidateQueries({ queryKey: crmKeys.tickets() });
          void queryClient.invalidateQueries({ queryKey: crmKeys.ticket(payload.ticket_id) });

          if (msg.from === "customer" && !notifiedIdsRef.current.has(msg.id)) {
            notifiedIdsRef.current.add(msg.id);
            const label = payload.ticket_number
              ? `${payload.ticket_number}${payload.customer ? ` · ${payload.customer}` : ""}`
              : undefined;
            toast.info(label ? `New customer message · ${label}` : "New customer message", {
              description: `${msg.author}: ${messagePreview(msg.body)}`,
              duration: 8_000,
            });
          }
        };

        ch.listen(TICKET_MESSAGE_EVENT, onMessage);
        ch.listen("Crm.Ticket.MessageCreated", onMessage);

        channel = ch;
      } catch (error) {
        setTicketRealtimeActive(false);
        if (import.meta.env.DEV) {
          console.warn("[realtime] Failed to connect", error);
        }
      }
    };

    void setup();

    return () => {
      cancelled = true;
      setTicketRealtimeActive(false);
      channel?.stopListening(TICKET_MESSAGE_EVENT);
      channel?.stopListening("Crm.Ticket.MessageCreated");
      channel?.unsubscribe();
    };
  }, [authReady, queryClient]);

  useEffect(() => {
    return () => {
      if (!pathname.startsWith("/app")) {
        disconnectEcho();
      }
    };
  }, [pathname]);

  return { realtimeEnabled: Boolean(configRef.current?.enabled) };
}
