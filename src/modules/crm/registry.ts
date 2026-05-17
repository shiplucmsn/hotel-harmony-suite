export const crmModule = {
  id: "crm" as const,
  queryKeys: {
    leads: ["crm", "leads"] as const,
    customers: ["crm", "customers"] as const,
    orders: ["crm", "orders"] as const,
    invoices: ["crm", "invoices"] as const,
    payments: ["crm", "payments"] as const,
  },
};
