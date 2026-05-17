export const operationsModule = {
  id: "operations" as const,
  queryKeys: {
    products: ["operations", "products"] as const,
    sales: ["operations", "sales"] as const,
    inventory: ["operations", "inventory"] as const,
    invoices: ["operations", "invoices"] as const,
  },
};
