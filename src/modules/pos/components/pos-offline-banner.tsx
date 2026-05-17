import { CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadOfflineQueue } from "@/modules/pos/offline/pos-offline-store";

type PosOfflineBannerProps = {
  online: boolean;
  onSync?: () => void;
  syncing?: boolean;
};

export function PosOfflineBanner({ online, onSync, syncing }: PosOfflineBannerProps) {
  const pending = loadOfflineQueue().length;

  if (online && pending === 0) return null;

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <CloudOff className="h-4 w-4 text-amber-600" />
        <span>
          {!online
            ? "Offline mode — sales will queue locally until connection returns."
            : `${pending} queued checkout(s) waiting to sync.`}
        </span>
      </div>
      {online && pending > 0 && onSync && (
        <Button size="sm" variant="outline" onClick={onSync} disabled={syncing}>
          <RefreshCw className={`mr-1 h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
          Sync
        </Button>
      )}
    </div>
  );
}

