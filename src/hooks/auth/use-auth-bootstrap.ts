import { useEffect, useRef } from "react";
import { isAuthenticated } from "@/lib/auth-session";
import { bootstrapTenantFromHostAsync } from "@/lib/tenant-resolve";
import { useAuthStore } from "@/stores/auth-store";

/** Restores persisted session and validates with /auth/me when a token exists. */
export function useAuthBootstrap() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const clearSession = useAuthStore((s) => s.clearSession);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void bootstrapTenantFromHostAsync().then((status) => {
      if (status === "not_found" && typeof window !== "undefined") {
        window.location.replace("/workspace-not-found");
      }
    });
    hydrate();

    if (!isAuthenticated()) {
      return;
    }

    fetchMe().catch(() => {
      clearSession();
    });
  }, [hydrate, fetchMe, clearSession]);
}
