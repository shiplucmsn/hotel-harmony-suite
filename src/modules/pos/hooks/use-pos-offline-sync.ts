import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { posApi } from "@/modules/pos/pos-api";
import {
  dequeueOfflineCheckout,
  loadOfflineQueue,
  saveOfflineQueue,
} from "@/modules/pos/offline/pos-offline-store";

export function usePosOfflineSync() {
  const [syncing, setSyncing] = useState(false);

  const syncQueue = useCallback(async () => {
    const queue = loadOfflineQueue();
    if (queue.length === 0) return 0;

    setSyncing(true);
    let synced = 0;
    const remaining = [...queue];

    for (const job of queue) {
      try {
        await posApi.checkout(job.cartId, job.payload);
        dequeueOfflineCheckout(job.id);
        synced += 1;
      } catch (e) {
        const idx = remaining.findIndex((j) => j.id === job.id);
        if (idx >= 0) {
          remaining[idx] = { ...job, retries: job.retries + 1 };
        }
        toast.error(getApiErrorMessage(e, `Failed to sync sale ${job.id.slice(0, 8)}`));
        break;
      }
    }

    saveOfflineQueue(remaining.filter((j) => j.retries < 5));
    setSyncing(false);

    if (synced > 0) {
      toast.success(`Synced ${synced} queued sale(s)`);
    }
    return synced;
  }, []);

  return { syncing, syncQueue };
}
