import { useAuth } from "@/hooks/auth/use-auth";
import { userHasPermission } from "@/modules/auth/auth-redirect";

export function usePermissions() {
  const { user, isSuperAdmin } = useAuth();

  const can = (permission: string) => userHasPermission(user, permission);

  const canAny = (permissions: string[]) =>
    isSuperAdmin || permissions.some((p) => userHasPermission(user, p));

  const canAll = (permissions: string[]) =>
    isSuperAdmin || permissions.every((p) => userHasPermission(user, p));

  return {
    user,
    isSuperAdmin,
    permissions: user?.permissions ?? [],
    roles: user?.roles ?? [],
    can,
    canAny,
    canAll,
  };
}
