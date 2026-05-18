/** Longest-prefix match for route-level permission guards. */
export const ROUTE_PERMISSIONS: Record<string, string | string[]> = {
  "/app/super-admin": "platform.super_admin.view",
  "/app/saas": "platform.tenants.manage",
  "/app/tenants": "platform.tenants.manage",
  "/app/users": "core.users.view",
  "/app/roles": "core.roles.view",
  "/app/settings": "core.settings.view",
  "/app/subscription": "core.settings.view",
};

export function permissionForPath(pathname: string): string | string[] | null {
  const entries = Object.entries(ROUTE_PERMISSIONS).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [prefix, permission] of entries) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return permission;
    }
  }

  return null;
}
