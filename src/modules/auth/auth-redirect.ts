import { DEFAULT_APP_ROUTE } from "@/config/routes";
import type { AuthUser } from "@/modules/auth/types";

export function getPostAuthRoute(user: AuthUser, redirect?: string): string {
  if (user.mustChangePassword) {
    return "/change-password";
  }

  if (user.requiresRoleAssignment) {
    return "/access-pending";
  }

  if (redirect?.startsWith("/app")) {
    return redirect;
  }

  if (user.userType === "super_admin") {
    return "/app/super-admin";
  }

  if (user.userType === "company_admin") {
    return DEFAULT_APP_ROUTE;
  }

  return DEFAULT_APP_ROUTE;
}

export function userHasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false;
  if (user.permissions.includes("*")) return true;
  return user.permissions.includes(permission);
}

export function userHasModule(user: AuthUser | null, moduleKey?: string): boolean {
  if (!moduleKey) return true;
  if (!user) return false;
  if (user.userType === "super_admin") return true;
  const modules = user.enabledModules ?? [];
  if (modules.length === 0) return true;
  return modules.includes(moduleKey);
}
