import { redirect } from "@tanstack/react-router";
import { DEFAULT_APP_ROUTE } from "@/config/routes";
import { permissionForPath } from "@/config/route-permissions";
import { userHasPermission } from "@/modules/auth/auth-redirect";
import { useAuthStore } from "@/stores/auth-store";

export function requirePermission(permissions: string | string[], fallback = DEFAULT_APP_ROUTE) {
  if (typeof window === "undefined") {
    return;
  }

  const user = useAuthStore.getState().user;
  const required = Array.isArray(permissions) ? permissions : [permissions];

  if (!user) {
    throw redirect({ to: "/login", search: {} });
  }

  if (user.userType === "super_admin") {
    return;
  }

  const allowed = required.some((p) => userHasPermission(user, p));
  if (!allowed) {
    throw redirect({ to: fallback });
  }
}

/** Uses ROUTE_PERMISSIONS map for the current pathname. */
export function requireRoutePermission(pathname: string, fallback = DEFAULT_APP_ROUTE) {
  const required = permissionForPath(pathname);
  if (!required) {
    return;
  }
  requirePermission(required, fallback);
}
