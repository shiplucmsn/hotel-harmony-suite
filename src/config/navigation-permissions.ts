/** Section → purchasable module entitlement key. */
export const SECTION_MODULE_MAP: Record<string, string> = {
  Workspace: "workspace",
  Operations: "operations",
  "CRM & Sales": "crm",
  Inventory: "inventory",
  Purchases: "purchase",
  Production: "production",
  POS: "pos",
  "Human Resources": "hr",
  Projects: "projects",
  Finance: "finance",
  "Reports & Insights": "reports",
  Administration: "admin",
  "Super Admin": "platform",
  Account: "workspace",
};

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
  "/app/saas": "platform.tenants.manage",
  "/app/saas/tenants": "platform.tenants.manage",
  "/app/saas/plans": "platform.tenants.manage",
  "/app/saas/billing": "platform.tenants.manage",
  "/app/saas/revenue": "platform.tenants.manage",
  "/app/super-admin": "platform.super_admin.view",
  "/app/settings": "core.settings.view",
  "/app/subscription": "core.settings.view",
  "/app/inv/grn": "purchase.grn.view",
  "/app/inv/grn-qc": "purchase.grn.qc.view",
  "/app/inv/vendor-invoices": "purchase.invoices.view",
  "/app/inv/vendor-payments": "purchase.payments.view",
  "/app/prod/bom": "production.boms.view",
  "/app/prod/raw-materials": "production.materials.view",
  "/app/prod/finished-goods": "production.materials.view",
  "/app/prod/planning": "production.boms.view",
  "/app/prod/work-orders": "production.boms.view",
};
