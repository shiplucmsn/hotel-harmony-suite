export type ErpModuleId =
  | "workspace"
  | "operations"
  | "crm"
  | "inventory"
  | "purchase"
  | "production"
  | "pos"
  | "projects"
  | "hr"
  | "finance"
  | "reports"
  | "admin";

export type ErpModuleMeta = {
  id: ErpModuleId;
  name: string;
  routePrefix: string;
};

export const ERP_MODULES: ErpModuleMeta[] = [
  { id: "workspace", name: "Workspace", routePrefix: "/app/dashboard" },
  { id: "operations", name: "Operations", routePrefix: "/app/sales" },
  { id: "crm", name: "CRM & Sales", routePrefix: "/app/crm" },
  { id: "inventory", name: "Inventory", routePrefix: "/app/inv" },
  { id: "purchase", name: "Purchases", routePrefix: "/app/inv/purchase-orders" },
  { id: "production", name: "Production", routePrefix: "/app/prod" },
  { id: "pos", name: "Point of Sale", routePrefix: "/app/pos" },
  { id: "projects", name: "Projects", routePrefix: "/app/pm" },
  { id: "hr", name: "Human Resources", routePrefix: "/app/hr" },
  { id: "finance", name: "Finance", routePrefix: "/app/finance" },
  { id: "reports", name: "Reports", routePrefix: "/app/reports" },
  { id: "admin", name: "Administration", routePrefix: "/app/users" },
];
