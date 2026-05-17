import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/rbac/use-permissions";

type PermissionGateProps = {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
};

export function PermissionGate({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canAny, canAll } = usePermissions();

  const required = [...permissions, ...(permission ? [permission] : [])];
  if (!required.length) {
    return <>{children}</>;
  }

  const allowed = requireAll ? canAll(required) : canAny(required) || required.some((p) => can(p));

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
