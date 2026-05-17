import { useAuthStore } from "@/stores/auth-store";
import { userHasPermission } from "@/modules/auth/auth-redirect";
import type { AuthUser } from "@/modules/auth/types";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const hydrate = useAuthStore((s) => s.hydrate);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const hasPermission = (permission: string) => userHasPermission(user, permission);
  const hasRole = (role: string) => user?.roles.includes(role) ?? false;
  const isSuperAdmin = user?.userType === "super_admin";

  return {
    user,
    token,
    isAuthenticated,
    isHydrated,
    setSession,
    clearSession,
    hydrate,
    fetchMe,
    hasPermission,
    hasRole,
    isSuperAdmin,
  };
}

export type { AuthUser };
