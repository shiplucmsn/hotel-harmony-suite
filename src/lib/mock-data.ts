export type User = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Sales" | "Accountant" | "Viewer";
  status: "active" | "invited" | "suspended";
  department: string;
  lastActive: string;
  avatar?: string;
};

export const mockUsers: User[] = [
  { id: "u1", name: "Alicia Romero", email: "alicia@acme.io", role: "Admin", status: "active", department: "Operations", lastActive: "2m ago" },
  { id: "u2", name: "Marcus Chen", email: "marcus@acme.io", role: "Manager", status: "active", department: "Sales", lastActive: "1h ago" },
  { id: "u3", name: "Priya Natarajan", email: "priya@acme.io", role: "Accountant", status: "active", department: "Finance", lastActive: "3h ago" },
  { id: "u4", name: "Diego Alvarez", email: "diego@acme.io", role: "Sales", status: "invited", department: "Sales", lastActive: "—" },
  { id: "u5", name: "Hana Kobayashi", email: "hana@acme.io", role: "Viewer", status: "active", department: "Marketing", lastActive: "yesterday" },
  { id: "u6", name: "Liam O'Connor", email: "liam@acme.io", role: "Manager", status: "suspended", department: "Procurement", lastActive: "5d ago" },
  { id: "u7", name: "Sofia Bianchi", email: "sofia@acme.io", role: "Sales", status: "active", department: "Sales", lastActive: "12m ago" },
  { id: "u8", name: "Noah Williams", email: "noah@acme.io", role: "Accountant", status: "active", department: "Finance", lastActive: "30m ago" },
];

export const revenueData = [
  { month: "Jan", revenue: 42000, expenses: 28000 },
  { month: "Feb", revenue: 47500, expenses: 31000 },
  { month: "Mar", revenue: 51000, expenses: 32500 },
  { month: "Apr", revenue: 49000, expenses: 33000 },
  { month: "May", revenue: 58200, expenses: 35400 },
  { month: "Jun", revenue: 63500, expenses: 36800 },
  { month: "Jul", revenue: 68900, expenses: 39200 },
  { month: "Aug", revenue: 72400, expenses: 40500 },
  { month: "Sep", revenue: 78100, expenses: 42100 },
  { month: "Oct", revenue: 81600, expenses: 43800 },
  { month: "Nov", revenue: 88300, expenses: 45200 },
  { month: "Dec", revenue: 94500, expenses: 47600 },
];

export const salesByCategory = [
  { name: "Software", value: 38 },
  { name: "Hardware", value: 24 },
  { name: "Services", value: 22 },
  { name: "Support", value: 16 },
];

export const recentActivity = [
  { id: 1, user: "Alicia Romero", action: "approved invoice", target: "INV-2049", time: "2 min ago", type: "approve" },
  { id: 2, user: "Marcus Chen", action: "created new deal", target: "Northwind Renewal", time: "18 min ago", type: "create" },
  { id: 3, user: "Priya Natarajan", action: "posted journal entry", target: "JE-7782", time: "1 hr ago", type: "create" },
  { id: 4, user: "System", action: "completed nightly backup", target: "DB cluster #2", time: "3 hr ago", type: "system" },
  { id: 5, user: "Diego Alvarez", action: "updated customer", target: "Globex Corp.", time: "5 hr ago", type: "update" },
  { id: 6, user: "Hana Kobayashi", action: "uploaded document", target: "Q3 Report.pdf", time: "yesterday", type: "create" },
  { id: 7, user: "Liam O'Connor", action: "deleted purchase order", target: "PO-1132", time: "2 days ago", type: "delete" },
];

export const tenants = [
  { id: "t1", name: "Acme Industries", plan: "Enterprise", initials: "AI" },
  { id: "t2", name: "Globex Corp.", plan: "Business", initials: "GC" },
  { id: "t3", name: "Initech Labs", plan: "Starter", initials: "IL" },
];

export const notifications = [
  { id: "n1", title: "New invoice approved", body: "INV-2049 was approved by Alicia.", time: "2m", unread: true, type: "success" },
  { id: "n2", title: "Subscription renews soon", body: "Your Business plan renews on Dec 12.", time: "1h", unread: true, type: "info" },
  { id: "n3", title: "Failed login attempt", body: "From IP 192.168.1.42 — Chicago, US.", time: "5h", unread: false, type: "warning" },
  { id: "n4", title: "Backup completed", body: "Nightly backup finished successfully.", time: "1d", unread: false, type: "success" },
];

export const sessions = [
  { id: "s1", device: "MacBook Pro · Chrome", location: "Berlin, DE", ip: "92.211.10.4", current: true, lastActive: "Just now" },
  { id: "s2", device: "iPhone 15 · Safari", location: "Berlin, DE", ip: "92.211.10.4", current: false, lastActive: "2 hours ago" },
  { id: "s3", device: "Windows 11 · Edge", location: "Munich, DE", ip: "85.124.31.9", current: false, lastActive: "Yesterday" },
];

export const roles = [
  { id: "r1", name: "Administrator", users: 3, description: "Full access to all modules and settings", permissions: 42 },
  { id: "r2", name: "Manager", users: 8, description: "Can manage team data and approve transactions", permissions: 28 },
  { id: "r3", name: "Sales Rep", users: 14, description: "Access to CRM, deals and contacts", permissions: 16 },
  { id: "r4", name: "Accountant", users: 5, description: "Access to finance, invoicing and reporting", permissions: 22 },
  { id: "r5", name: "Viewer", users: 21, description: "Read-only access to dashboards", permissions: 6 },
];

export const permissionGroups = [
  { group: "CRM", items: ["View contacts", "Create deals", "Delete deals", "Export data"] },
  { group: "Finance", items: ["View invoices", "Create invoices", "Approve invoices", "Manage taxes"] },
  { group: "Inventory", items: ["View stock", "Adjust stock", "Manage warehouses", "Transfer items"] },
  { group: "HR", items: ["View employees", "Manage payroll", "Approve leave", "Hiring access"] },
];

export const plans = [
  {
    name: "Starter",
    price: 19,
    description: "For small teams getting organized.",
    features: ["Up to 5 users", "CRM & invoicing", "5 GB storage", "Email support"],
    highlighted: false,
  },
  {
    name: "Business",
    price: 49,
    description: "For growing companies that need more power.",
    features: ["Up to 50 users", "All ERP modules", "100 GB storage", "Priority support", "Advanced analytics", "Custom roles"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: 129,
    description: "For organizations with advanced needs.",
    features: ["Unlimited users", "Dedicated infrastructure", "1 TB storage", "24/7 support", "SSO & SAML", "Custom SLAs"],
    highlighted: false,
  },
];
