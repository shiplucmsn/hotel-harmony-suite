import type { LucideIcon } from "lucide-react";
import { getNavIcon, type NavIconName } from "@/config/navigation-icons";
import {
  ROUTE_NAV_PERMISSION_MAP,
  SECTION_MODULE_MAP,
  SECTION_PERMISSION_MAP,
} from "@/config/navigation-permissions";
import type { AuthUser } from "@/modules/auth/types";
import { userHasModule, userHasPermission } from "@/modules/auth/auth-redirect";

export type NavItemMeta = {
  title: string;
  url: string;
  iconName: NavIconName;
  badge?: string;
  roles?: string[];
  permission?: string;
};

export type NavSectionMeta = {
  title: string;
  iconName: NavIconName;
  items: NavItemMeta[];
  roles?: string[];
  permission?: string;
  moduleKey?: string;
};

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
  roles?: string[];
  permission?: string;
};

export type NavSection = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
  roles?: string[];
  permission?: string;
};

function enrichNavPermissions(sections: NavSectionMeta[]): NavSectionMeta[] {
  return sections.map((section) => ({
    ...section,
    moduleKey: section.moduleKey ?? SECTION_MODULE_MAP[section.title],
    permission: section.permission ?? SECTION_PERMISSION_MAP[section.title],
    items: section.items.map((item) => ({
      ...item,
      permission: item.permission ?? ROUTE_NAV_PERMISSION_MAP[item.url] ?? SECTION_PERMISSION_MAP[section.title],
    })),
  }));
}

export function canAccessNav(user: AuthUser | null, permission?: string, moduleKey?: string): boolean {
  if (moduleKey && !userHasModule(user, moduleKey)) return false;
  if (!permission) return true;
  return userHasPermission(user, permission);
}

export function filterNavByPermissions(sections: NavSectionMeta[], user: AuthUser | null): NavSectionMeta[] {
  if (!user) return [];

  return enrichNavPermissions(sections)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        canAccessNav(user, item.permission, section.moduleKey)
      ),
    }))
    .filter(
      (section) =>
        section.items.length > 0 && canAccessNav(user, section.permission, section.moduleKey)
    );
}

export const NAV_MENU: NavSectionMeta[] = [
  {
    title: "Workspace",
    iconName: "layoutDashboard",
    items: [
      { title: "Dashboard", url: "/app/dashboard", iconName: "layoutDashboard" },
      { title: "Analytics", url: "/app/analytics", iconName: "barChart3" },
      { title: "Activity", url: "/app/activity", iconName: "activity" },
    ],
  },
  {
    title: "Operations",
    iconName: "barChart2",
    items: [
      { title: "Sales", url: "/app/sales", iconName: "shoppingCart" },
      { title: "Inventory", url: "/app/inventory", iconName: "boxes" },
      { title: "Products", url: "/app/products", iconName: "package" },
      { title: "Invoices", url: "/app/crm/invoices", iconName: "fileText" },
    ],
  },
  {
    title: "CRM & Sales",
    iconName: "briefcase",
    items: [
      { title: "Sales Analytics", url: "/app/crm/analytics", iconName: "lineChart" },
      { title: "Leads", url: "/app/crm/leads", iconName: "target" },
      { title: "Customers", url: "/app/crm/customers", iconName: "userPlus" },
      { title: "Contacts", url: "/app/crm/contacts", iconName: "phone" },
      { title: "Pipeline", url: "/app/crm/pipeline", iconName: "kanban" },
      { title: "Quotations", url: "/app/crm/quotes", iconName: "fileSignature" },
      { title: "Sales Orders", url: "/app/crm/orders", iconName: "clipboardList" },
      { title: "CRM Invoices", url: "/app/crm/invoices", iconName: "fileText" },
      { title: "Customer Ledger", url: "/app/crm/ledger", iconName: "bookUser" },
      { title: "Payments", url: "/app/crm/payments", iconName: "handCoins" },
      { title: "Support Tickets", url: "/app/crm/tickets", iconName: "headphones" },
      { title: "Follow-ups", url: "/app/crm/followups", iconName: "bellRing" },
    ],
  },
  {
    title: "Inventory",
    iconName: "boxes",
    items: [
      { title: "Products", url: "/app/products", iconName: "package" },
      { title: "Categories", url: "/app/inv/categories", iconName: "folderOpen" },
      { title: "Warehouses", url: "/app/inv/warehouses", iconName: "warehouse" },
      { title: "Multi-Warehouse", url: "/app/inv/warehouses-dashboard", iconName: "building" },
      { title: "Stock movements", url: "/app/inv/movements", iconName: "activity" },
      { title: "Barcodes", url: "/app/inv/barcode", iconName: "scanBarcode" },
      { title: "SKU System", url: "/app/inv/sku", iconName: "hash" },
      { title: "Stock Transfer", url: "/app/inv/transfers", iconName: "arrowRightLeft" },
      { title: "Stock Adjustment", url: "/app/inv/adjustments", iconName: "clipboardList" },
      { title: "Batch Tracking", url: "/app/inv/batches", iconName: "layers" },
      { title: "Expiry Tracking", url: "/app/inv/expiry", iconName: "calendarClock" },
      { title: "Low Stock Alerts", url: "/app/inv/low-stock", iconName: "alertTriangle" },
    ],
  },
  {
    title: "Purchases",
    iconName: "truck",
    items: [
      { title: "Suppliers", url: "/app/inv/suppliers", iconName: "truck" },
      { title: "Purchase Orders", url: "/app/inv/purchase-orders", iconName: "shoppingBag" },
      { title: "GRN", url: "/app/inv/grn", iconName: "packageCheck" },
      { title: "GRN QC Queue", url: "/app/inv/grn-qc", iconName: "clipboardCheck" },
      { title: "Supplier Invoices", url: "/app/inv/vendor-invoices", iconName: "fileText" },
      { title: "Purchase Returns", url: "/app/inv/purchase-returns", iconName: "undo2" },
      { title: "Vendor Payments", url: "/app/inv/vendor-payments", iconName: "wallet" },
      { title: "Supplier Ledger", url: "/app/inv/supplier-ledger", iconName: "bookUser" },
    ],
  },
  {
    title: "Production",
    iconName: "factory",
    items: [
      { title: "BOM", url: "/app/prod/bom", iconName: "gitBranch" },
      { title: "Raw Materials", url: "/app/prod/raw-materials", iconName: "layers" },
      { title: "Planning", url: "/app/prod/planning", iconName: "calendarDays" },
      { title: "Work Orders", url: "/app/prod/work-orders", iconName: "hammer" },
      { title: "Machines", url: "/app/prod/machines", iconName: "cpu" },
      { title: "Quality Control", url: "/app/prod/quality", iconName: "shieldCheck" },
      { title: "Waste", url: "/app/prod/waste", iconName: "trash2" },
      { title: "Finished Goods", url: "/app/prod/finished-goods", iconName: "package" },
      { title: "Analytics", url: "/app/prod/analytics", iconName: "lineChart" },
      { title: "Workflow", url: "/app/prod/workflow", iconName: "workflow" },
    ],
  },
  {
    title: "Point of Sale",
    iconName: "store",
    items: [
      { title: "Billing", url: "/app/pos/billing", iconName: "scanLine" },
      { title: "Refunds", url: "/app/pos/refunds", iconName: "undo" },
    ],
  },
  {
    title: "Projects",
    iconName: "briefcase",
    items: [
      { title: "Dashboard", url: "/app/pm/dashboard", iconName: "layoutDashboard" },
      { title: "Tasks", url: "/app/pm/tasks", iconName: "checkSquare" },
      { title: "Kanban", url: "/app/pm/kanban", iconName: "kanban" },
      { title: "Team", url: "/app/pm/team", iconName: "users2" },
      { title: "Deadlines", url: "/app/pm/deadlines", iconName: "calendarClock" },
      { title: "Timeline", url: "/app/pm/timeline", iconName: "history" },
      { title: "Time Tracking", url: "/app/pm/time-tracking", iconName: "timer" },
    ],
  },
  {
    title: "Human Resources",
    iconName: "userCog",
    items: [
      { title: "Employees", url: "/app/hr/employees", iconName: "userCog" },
      { title: "Departments", url: "/app/hr/departments", iconName: "briefcase" },
      { title: "Designations", url: "/app/hr/designations", iconName: "idCard" },
      { title: "Attendance", url: "/app/hr/attendance", iconName: "calendarCheck" },
      { title: "Daily Attendance", url: "/app/hr/attendance/daily", iconName: "calendarDays" },
      { title: "Leave Requests", url: "/app/hr/leaves", iconName: "calendarRange" },
      { title: "Payroll", url: "/app/hr/payroll", iconName: "wallet" },
      { title: "Salary Structure", url: "/app/hr/salary", iconName: "banknote" },
      { title: "Shifts", url: "/app/hr/shifts", iconName: "clock" },
      { title: "Holidays", url: "/app/hr/holidays", iconName: "calendarDays" },
      { title: "Overtime", url: "/app/hr/overtime", iconName: "timer" },
      { title: "Performance", url: "/app/hr/performance", iconName: "star" },
      { title: "Documents", url: "/app/hr/documents", iconName: "folderOpen" },
      { title: "Timeline", url: "/app/hr/timeline", iconName: "history" },
      { title: "HR Activity", url: "/app/hr/activity", iconName: "scrollText" },
    ],
  },
  {
    title: "Accounting & Finance",
    iconName: "landmark",
    items: [
      { title: "Chart of Accounts", url: "/app/finance/accounts", iconName: "bookOpen" },
      { title: "Journal Entries", url: "/app/finance/journal", iconName: "bookText" },
      { title: "Ledger", url: "/app/finance/ledger", iconName: "scrollText" },
      { title: "Trial Balance", url: "/app/finance/trial-balance", iconName: "scale" },
      { title: "Profit & Loss", url: "/app/finance/profit-loss", iconName: "trendingUp" },
      { title: "Balance Sheet", url: "/app/finance/balance-sheet", iconName: "fileBarChart" },
      { title: "Cash Flow", url: "/app/finance/cash-flow", iconName: "wallet" },
      { title: "Expenses", url: "/app/finance/expenses", iconName: "receipt" },
      { title: "Income", url: "/app/finance/income", iconName: "banknote" },
      { title: "Tax / VAT", url: "/app/finance/tax", iconName: "piggyBank" },
      { title: "Bank Accounts", url: "/app/finance/banks", iconName: "landmark" },
      { title: "Transactions", url: "/app/finance/transactions", iconName: "arrowRightLeft" },
      { title: "Reports", url: "/app/finance/reports", iconName: "fileBarChart" },
      { title: "Invoice Accounting", url: "/app/finance/invoices", iconName: "receiptText" },
      { title: "Payment History", url: "/app/finance/payments", iconName: "creditCard" },
    ],
  },
  {
    title: "Reports & Insights",
    iconName: "fileBarChart",
    items: [
      { title: "Reports Hub", url: "/app/reports", iconName: "fileBarChart" },
      { title: "Analytics", url: "/app/analytics", iconName: "barChart3" },
      { title: "Finance Reports", url: "/app/finance/reports", iconName: "fileBarChart" },
      { title: "Production Analytics", url: "/app/prod/analytics", iconName: "lineChart" },
      { title: "Sales Analytics", url: "/app/crm/analytics", iconName: "lineChart" },
    ],
  },
  {
    title: "Administration",
    iconName: "shield",
    items: [
      { title: "Users", url: "/app/users", iconName: "users" },
      { title: "Roles", url: "/app/roles", iconName: "shield" },
      { title: "Tenants", url: "/app/tenants", iconName: "building2" },
      { title: "Notifications", url: "/app/notifications", iconName: "bell" },
    ],
  },
  {
    title: "Super Admin",
    iconName: "sparkles",
    items: [
      { title: "SaaS Overview", url: "/app/saas", iconName: "layoutDashboard" },
      { title: "Tenant management", url: "/app/saas/tenants", iconName: "building2" },
      { title: "Plans", url: "/app/saas/plans", iconName: "creditCard" },
      { title: "SaaS Billing", url: "/app/saas/billing", iconName: "receipt" },
      { title: "Revenue analytics", url: "/app/saas/revenue", iconName: "trendingUp" },
      { title: "Control Panel", url: "/app/super-admin", iconName: "sparkles" },
      { title: "Workspaces", url: "/app/tenants", iconName: "building2" },
    ],
  },
  {
    title: "Account",
    iconName: "settings",
    items: [
      { title: "Subscription", url: "/app/subscription", iconName: "creditCard" },
      { title: "Components", url: "/app/components", iconName: "sparkles" },
      { title: "Settings", url: "/app/settings", iconName: "settings" },
    ],
  },
];

export function resolveNavMenu(sections: NavSectionMeta[] = NAV_MENU, user: AuthUser | null = null): NavSection[] {
  const visible = user ? filterNavByPermissions(sections, user) : enrichNavPermissions(sections);

  return visible.map((section) => ({
    title: section.title,
    icon: getNavIcon(section.iconName),
    roles: section.roles,
    items: section.items.map((item) => ({
      title: item.title,
      url: item.url,
      icon: getNavIcon(item.iconName),
      badge: item.badge,
      roles: item.roles,
    })),
  }));
}

export function isNavItemActive(pathname: string, url: string): boolean {
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function sectionHasActiveRoute(pathname: string, section: NavSection | NavSectionMeta): boolean {
  return section.items.some((item) => isNavItemActive(pathname, item.url));
}

export function openSectionsForPath(pathname: string, sections: NavSectionMeta[] = NAV_MENU): Record<string, boolean> {
  const open: Record<string, boolean> = {};
  sections.forEach((section) => {
    open[section.title] = sectionHasActiveRoute(pathname, section);
  });
  if (!Object.values(open).some(Boolean) && sections[0]) {
    open[sections[0].title] = true;
  }
  return open;
}

/** Section title for current route (first matching section). */
export function activeSectionTitleForPath(
  pathname: string,
  sections: NavSectionMeta[] = NAV_MENU
): string | null {
  const hit = sections.find((section) => sectionHasActiveRoute(pathname, section));
  return hit?.title ?? sections[0]?.title ?? null;
}

/** Accordion: at most one section open — prefers explicit user choice, else active route. */
export function mergeSectionsOpen(
  userOpen: Record<string, boolean>,
  pathname: string,
  sections: NavSectionMeta[] = NAV_MENU
): Record<string, boolean> {
  const userOpened = Object.entries(userOpen).find(([, open]) => open)?.[0];
  const title = userOpened ?? activeSectionTitleForPath(pathname, sections);
  return title ? { [title]: true } : {};
}

export const NAV_FILTER = {
  byRole: (sections: NavSection[], role: string) =>
    sections.filter((s) => !s.roles?.length || s.roles.includes(role)),
};
