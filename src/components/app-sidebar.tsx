import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Shield, Bell, Activity, Building2, CreditCard,
  Settings, Boxes, ShoppingCart, FileText, BarChart3, Sparkles, Package,
  UserCog, Briefcase, IdCard, CalendarCheck, CalendarDays, Wallet, Banknote, Target, UserPlus, Phone, Kanban, FileSignature, ClipboardList, BookUser, HandCoins, LifeBuoy, BellRing, LineChart,
  Clock, CalendarRange, Timer, Star, FolderOpen, History, ScrollText,
  BookOpen, BookText, Scale, TrendingUp, Receipt, Landmark, ArrowRightLeft,
  FileBarChart, PiggyBank, ReceiptText,
  Warehouse, Hash, ScanBarcode, Layers, CalendarClock, AlertTriangle,
  Truck, ShoppingBag, PackageCheck, Undo2, ChevronRight, ChevronDown,
  Briefcase as BriefcaseIcon, Building, BarChart2, Headphones,
  Factory, Hammer, Cpu, ShieldCheck, Trash2, GitBranch, Workflow,
  Store, ScanLine, Receipt as ReceiptIcon, Undo, CheckSquare, Kanban as KanbanIcon, Users2, CalendarClock as DeadlineIcon, History as HistoryIcon, Timer as TimerIcon,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";

type MenuItem = { title: string; url: string; icon: LucideIcon };
type MenuSection = { title: string; icon: LucideIcon; items: MenuItem[] };

const menu: MenuSection[] = [
  {
    title: "Workspace",
    icon: LayoutDashboard,
    items: [
      { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
      { title: "Analytics", url: "/app/analytics", icon: BarChart3 },
      { title: "Activity", url: "/app/activity", icon: Activity },
    ],
  },
  {
    title: "Operations",
    icon: BarChart2,
    items: [
      { title: "Sales", url: "/app/sales", icon: ShoppingCart },
      { title: "Inventory", url: "/app/inventory", icon: Boxes },
      { title: "Products", url: "/app/products", icon: Package },
      { title: "Invoices", url: "/app/invoices", icon: FileText },
    ],
  },
  {
    title: "CRM & Sales",
    icon: BriefcaseIcon,
    items: [
      { title: "Sales Analytics", url: "/app/crm/analytics", icon: LineChart },
      { title: "Leads", url: "/app/crm/leads", icon: Target },
      { title: "Customers", url: "/app/crm/customers", icon: UserPlus },
      { title: "Contacts", url: "/app/crm/contacts", icon: Phone },
      { title: "Pipeline", url: "/app/crm/pipeline", icon: Kanban },
      { title: "Quotations", url: "/app/crm/quotes", icon: FileSignature },
      { title: "Sales Orders", url: "/app/crm/orders", icon: ClipboardList },
      { title: "CRM Invoices", url: "/app/crm/invoices", icon: FileText },
      { title: "Customer Ledger", url: "/app/crm/ledger", icon: BookUser },
      { title: "Payments", url: "/app/crm/payments", icon: HandCoins },
      { title: "Support Tickets", url: "/app/crm/tickets", icon: Headphones },
      { title: "Follow-ups", url: "/app/crm/followups", icon: BellRing },
    ],
  },
  {
    title: "Inventory",
    icon: Boxes,
    items: [
      { title: "Products", url: "/app/inv/products", icon: Package },
      { title: "Categories", url: "/app/inv/categories", icon: FolderOpen },
      { title: "SKU System", url: "/app/inv/sku", icon: Hash },
      { title: "Barcodes", url: "/app/inv/barcode", icon: ScanBarcode },
      { title: "Warehouses", url: "/app/inv/warehouses", icon: Warehouse },
      { title: "Multi-Warehouse", url: "/app/inv/warehouses-dashboard", icon: Building },
      { title: "Stock Transfer", url: "/app/inv/transfers", icon: ArrowRightLeft },
      { title: "Stock Adjustment", url: "/app/inv/adjustments", icon: ClipboardList },
      { title: "Batch Tracking", url: "/app/inv/batches", icon: Layers },
      { title: "Expiry Tracking", url: "/app/inv/expiry", icon: CalendarClock },
      { title: "Low Stock Alerts", url: "/app/inv/low-stock", icon: AlertTriangle },
    ],
  },
  {
    title: "Purchases",
    icon: Truck,
    items: [
      { title: "Suppliers", url: "/app/inv/suppliers", icon: Truck },
      { title: "Purchase Orders", url: "/app/inv/purchase-orders", icon: ShoppingBag },
      { title: "GRN", url: "/app/inv/grn", icon: PackageCheck },
      { title: "Purchase Returns", url: "/app/inv/purchase-returns", icon: Undo2 },
      { title: "Vendor Payments", url: "/app/inv/vendor-payments", icon: Wallet },
      { title: "Supplier Ledger", url: "/app/inv/supplier-ledger", icon: BookUser },
    ],
  },
  {
    title: "Production",
    icon: Factory,
    items: [
      { title: "BOM", url: "/app/prod/bom", icon: GitBranch },
      { title: "Raw Materials", url: "/app/prod/raw-materials", icon: Layers },
      { title: "Planning", url: "/app/prod/planning", icon: CalendarDays },
      { title: "Work Orders", url: "/app/prod/work-orders", icon: Hammer },
      { title: "Machines", url: "/app/prod/machines", icon: Cpu },
      { title: "Quality Control", url: "/app/prod/quality", icon: ShieldCheck },
      { title: "Waste", url: "/app/prod/waste", icon: Trash2 },
      { title: "Finished Goods", url: "/app/prod/finished-goods", icon: Package },
      { title: "Analytics", url: "/app/prod/analytics", icon: LineChart },
      { title: "Workflow", url: "/app/prod/workflow", icon: Workflow },
    ],
  },
  {
    title: "Point of Sale",
    icon: Store,
    items: [
      { title: "Billing", url: "/app/pos/billing", icon: ScanLine },
      { title: "Refunds", url: "/app/pos/refunds", icon: Undo },
    ],
  },
  {
    title: "Projects",
    icon: BriefcaseIcon,
    items: [
      { title: "Dashboard", url: "/app/pm/dashboard", icon: LayoutDashboard },
      { title: "Tasks", url: "/app/pm/tasks", icon: CheckSquare },
      { title: "Kanban", url: "/app/pm/kanban", icon: KanbanIcon },
      { title: "Team", url: "/app/pm/team", icon: Users2 },
      { title: "Deadlines", url: "/app/pm/deadlines", icon: DeadlineIcon },
      { title: "Timeline", url: "/app/pm/timeline", icon: HistoryIcon },
      { title: "Time Tracking", url: "/app/pm/time-tracking", icon: TimerIcon },
    ],
  },
  {
    title: "Human Resources",
    icon: UserCog,
    items: [
      { title: "Employees", url: "/app/hr/employees", icon: UserCog },
      { title: "Departments", url: "/app/hr/departments", icon: Briefcase },
      { title: "Designations", url: "/app/hr/designations", icon: IdCard },
      { title: "Attendance", url: "/app/hr/attendance", icon: CalendarCheck },
      { title: "Daily Attendance", url: "/app/hr/attendance/daily", icon: CalendarDays },
      { title: "Leave Requests", url: "/app/hr/leaves", icon: CalendarRange },
      { title: "Payroll", url: "/app/hr/payroll", icon: Wallet },
      { title: "Salary Structure", url: "/app/hr/salary", icon: Banknote },
      { title: "Shifts", url: "/app/hr/shifts", icon: Clock },
      { title: "Holidays", url: "/app/hr/holidays", icon: CalendarDays },
      { title: "Overtime", url: "/app/hr/overtime", icon: Timer },
      { title: "Performance", url: "/app/hr/performance", icon: Star },
      { title: "Documents", url: "/app/hr/documents", icon: FolderOpen },
      { title: "Timeline", url: "/app/hr/timeline", icon: History },
      { title: "HR Activity", url: "/app/hr/activity", icon: ScrollText },
    ],
  },
  {
    title: "Accounting & Finance",
    icon: Landmark,
    items: [
      { title: "Chart of Accounts", url: "/app/finance/accounts", icon: BookOpen },
      { title: "Journal Entries", url: "/app/finance/journal", icon: BookText },
      { title: "Ledger", url: "/app/finance/ledger", icon: ScrollText },
      { title: "Trial Balance", url: "/app/finance/trial-balance", icon: Scale },
      { title: "Profit & Loss", url: "/app/finance/profit-loss", icon: TrendingUp },
      { title: "Balance Sheet", url: "/app/finance/balance-sheet", icon: FileBarChart },
      { title: "Cash Flow", url: "/app/finance/cash-flow", icon: Wallet },
      { title: "Expenses", url: "/app/finance/expenses", icon: Receipt },
      { title: "Income", url: "/app/finance/income", icon: Banknote },
      { title: "Tax / VAT", url: "/app/finance/tax", icon: PiggyBank },
      { title: "Bank Accounts", url: "/app/finance/banks", icon: Landmark },
      { title: "Transactions", url: "/app/finance/transactions", icon: ArrowRightLeft },
      { title: "Reports", url: "/app/finance/reports", icon: FileBarChart },
      { title: "Invoice Accounting", url: "/app/finance/invoices", icon: ReceiptText },
      { title: "Payment History", url: "/app/finance/payments", icon: CreditCard },
    ],
  },
  {
    title: "Administration",
    icon: Shield,
    items: [
      { title: "Users", url: "/app/users", icon: Users },
      { title: "Roles", url: "/app/roles", icon: Shield },
      { title: "Tenants", url: "/app/tenants", icon: Building2 },
      { title: "Notifications", url: "/app/notifications", icon: Bell },
    ],
  },
  {
    title: "Account",
    icon: Settings,
    items: [
      { title: "Subscription", url: "/app/subscription", icon: CreditCard },
      { title: "Components", url: "/app/components", icon: Sparkles },
      { title: "Settings", url: "/app/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Track which sections are open. Auto-open the section containing the active route.
  const initialOpen = () => {
    const o: Record<string, boolean> = {};
    menu.forEach(s => {
      o[s.title] = s.items.some(i => pathname === i.url || pathname.startsWith(i.url + "/"));
    });
    if (!Object.values(o).some(Boolean)) o[menu[0].title] = true;
    return o;
  };
  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

  useEffect(() => {
    setOpen(prev => {
      const next = { ...prev };
      menu.forEach(s => {
        if (s.items.some(i => pathname === i.url || pathname.startsWith(i.url + "/"))) next[s.title] = true;
      });
      return next;
    });
  }, [pathname]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/app/dashboard" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow shrink-0">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Nebula ERP</span>
              <span className="text-xs text-muted-foreground">Acme Industries</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map(section => {
                const isActive = section.items.some(i => pathname === i.url || pathname.startsWith(i.url + "/"));
                const isOpen = !!open[section.title];

                if (collapsed) {
                  // In collapsed mode: just show the parent icon as a tooltip-button linking to first item.
                  return (
                    <SidebarMenuItem key={section.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={section.title}>
                        <Link to={section.items[0].url}><section.icon className="h-4 w-4" /></Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible key={section.title} open={isOpen} onOpenChange={(v) => setOpen(p => ({ ...p, [section.title]: v }))}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isActive} className="group/menu w-full justify-between font-medium">
                          <span className="flex items-center gap-2">
                            <section.icon className="h-4 w-4 text-primary" />
                            <span>{section.title}</span>
                          </span>
                          <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.items.map(item => {
                            const active = pathname === item.url || pathname.startsWith(item.url + "/");
                            return (
                              <SidebarMenuSubItem key={item.url}>
                                <SidebarMenuSubButton asChild isActive={active}>
                                  <Link to={item.url} className="flex items-center gap-2">
                                    <item.icon className="h-3.5 w-3.5" />
                                    <span>{item.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="rounded-lg bg-sidebar-accent/60 p-3 text-xs">
            <div className="font-semibold text-sidebar-accent-foreground">Upgrade to Enterprise</div>
            <div className="mt-1 text-sidebar-foreground/70">Unlock SSO, audit logs and dedicated support.</div>
            <Link to="/pricing" className="mt-2 inline-flex text-primary font-medium hover:underline">
              View plans →
            </Link>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
