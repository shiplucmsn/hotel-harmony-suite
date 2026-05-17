/** Section-level nav visibility permissions. */
export const SECTION_PERMISSION_MAP: Record<string, string> = {
  Workspace: "nav.workspace.view",
  Operations: "nav.operations.view",
  "CRM & Sales": "nav.crm.view",
  Inventory: "nav.inventory.view",
  Purchases: "nav.purchases.view",
  Production: "nav.production.view",
  POS: "nav.pos.view",
  "Human Resources": "nav.hr.view",
  Projects: "nav.projects.view",
  Finance: "nav.finance.view",
  "Reports & Insights": "nav.reports.view",
  Administration: "nav.admin.view",
  "Super Admin": "platform.super_admin.view",
  Account: "nav.workspace.view",
};

/** Route-specific overrides (finer than section). */
export const ROUTE_NAV_PERMISSION_MAP: Record<string, string> = {
  "/app/users": "core.users.view",
  "/app/roles": "core.roles.view",
  "/app/tenants": "platform.tenants.manage",
  "/app/super-admin": "platform.super_admin.view",
  "/app/settings": "core.settings.view",
  "/app/subscription": "core.settings.view",
};
