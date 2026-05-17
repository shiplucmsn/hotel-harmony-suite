export const crmModule = {
  id: "crm" as const,
  queryKeys: {
    customers: ["crm", "customers"] as const,
    orders: ["crm", "orders"] as const,
    invoices: ["crm", "invoices"] as const,
  },
};
