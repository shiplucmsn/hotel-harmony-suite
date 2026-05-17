import { useEffect, useRef } from "react";
import { isAuthenticated } from "@/lib/auth-session";
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

    hydrate();

    if (!isAuthenticated()) {
      return;
    }

    fetchMe().catch(() => {
      clearSession();
    });
  }, [hydrate, fetchMe, clearSession]);
}
