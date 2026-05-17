import { DEFAULT_APP_ROUTE } from "@/config/routes";
import type { AuthUser } from "@/modules/auth/types";

export function getPostAuthRoute(user: AuthUser, redirect?: string): string {
  if (redirect?.startsWith("/app")) {
    return redirect;
  }

  if (user.userType === "super_admin") {
    return "/app/super-admin";
  }

  if (user.roles.includes("company-admin")) {
    return DEFAULT_APP_ROUTE;
  }

  return DEFAULT_APP_ROUTE;
}

export function userHasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false;
  if (user.permissions.includes("*")) return true;
  return user.permissions.includes(permission);
}
