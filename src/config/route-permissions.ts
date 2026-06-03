/** Longest-prefix match for route-level permission guards. */
export const ROUTE_PERMISSIONS: Record<string, string | string[]> = {
  "/app/super-admin": "platform.super_admin.view",
  "/app/saas": "platform.tenants.manage",
  "/app/tenants": "platform.tenants.manage",
  "/app/users": "core.users.view",
  "/app/roles": "core.roles.view",
  "/app/settings": "core.settings.view",
  "/app/inv/grn-qc": "purchase.grn.qc.view",
  "/app/inv/vendor-invoices": "purchase.invoices.view",
  "/app/prod/bom": "production.boms.view",
  "/app/prod/raw-materials": "production.materials.view",
  "/app/prod/finished-goods": "production.materials.view",
  "/app/prod/planning": "production.boms.view",
  "/app/prod/work-orders": "production.boms.view",
  "/app/prod/workflow": "production.boms.view",
  "/app/prod/analytics": "production.boms.view",
  "/app/pm": "nav.projects.view",
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
