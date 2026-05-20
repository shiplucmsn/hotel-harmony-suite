import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { apiRequest } from "@/lib/api-client";
import { buildApiHeaders } from "@/lib/api-auth";

export type BroadcastClientConfig = {
  enabled: boolean;
  provider: string | null;
  source: string | null;
  tenant_id: string;
  user_id?: number | null;
  key: string | null;
  cluster: string | null;
  channel: string;
  channels?: {
    tickets?: string;
    notifications?: string | null;
  };
};

type EchoInstance = InstanceType<typeof Echo>;

let echoInstance: EchoInstance | null = null;
let echoKey: string | null = null;

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

export async function fetchBroadcastClientConfig(
  userId?: number | string | null,
): Promise<BroadcastClientConfig | null> {
  const paths = ["/v1/realtime/client", "/v1/company/broadcast/client"];
  let client: BroadcastClientConfig | undefined;

  for (const path of paths) {
    try {
      const res = await apiRequest<{ data?: { client?: BroadcastClientConfig } }>(path);
      client = res.data?.client;
      if (client?.enabled && client.key && client.cluster) break;
    } catch {
      // try fallback path
    }
  }

  if (!client?.enabled || !client.key || !client.cluster) {
    return null;
  }

  const resolvedUserId = client.user_id ?? (userId != null ? Number(userId) : null);
  if (resolvedUserId && !client.user_id) {
    return {
      ...client,
      user_id: resolvedUserId,
      channels: {
        ...client.channels,
        notifications: echoUserNotificationsChannel(resolvedUserId),
      },
    };
  }

  return client;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    echoKey = null;
  }
}

export async function connectEcho(config: BroadcastClientConfig): Promise<EchoInstance | null> {
  const cacheKey = `${config.key}:${config.cluster}:${config.tenant_id}`;
  if (echoInstance && echoKey === cacheKey) {
    return echoInstance;
  }

  disconnectEcho();

  window.Pusher = Pusher;
  if (import.meta.env.DEV) {
    Pusher.logToConsole = true;
  }

  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

  echoInstance = new Echo({
    broadcaster: "pusher",
    key: config.key,
    cluster: config.cluster,
    forceTLS: true,
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${apiBase}/v1/broadcasting/auth`,
    auth: {
      headers: buildApiHeaders(),
    },
  });

  echoKey = cacheKey;
  return echoInstance;
}

/** Channel name without `private-` prefix (Echo adds it). */
export function echoChannelName(tenantId: string): string {
  return `tenant.${tenantId}.crm.tickets`;
}

export function echoUserNotificationsChannel(userId: number): string {
  return `user.${userId}.notifications`;
}

export const TICKET_MESSAGE_EVENT = ".Crm.Ticket.MessageCreated";
export const NOTIFICATION_CREATED_EVENT = ".Core.Notification.Created";
