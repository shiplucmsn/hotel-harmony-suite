export type ModuleContract = {
  name: string;
  endpointPrefix: string;
  requiredSideEffects: string[];
};

export const moduleContracts: ModuleContract[] = [
  {
    name: "Products",
    endpointPrefix: "/products",
    requiredSideEffects: [
      "Sync product master with inventory catalog",
      "Keep purchase references valid (supplier/category/uom)",
      "Expose product in sales and POS listing",
      "Emit product metric dimensions for reports",
    ],
  },
  {
    name: "Purchase",
    endpointPrefix: "/purchases",
    requiredSideEffects: [
      "GRN posting must increase warehouse stock",
      "Inventory quantity and valuation must update",
      "Accounts payable impact must be posted",
      "Purchase cycle metrics must update in reports",
    ],
  },
  {
    name: "Sales",
    endpointPrefix: "/sales",
    requiredSideEffects: [
      "Deduct or reserve inventory stock",
      "Create or update invoice state",
      "Post finance effect (revenue and receivable/cash)",
      "Update sales dashboards and reports",
    ],
  },
  {
    name: "InvoicesPayments",
    endpointPrefix: "/invoices",
    requiredSideEffects: [
      "Invoice due/paid/balance must stay consistent",
      "Ledger entries must reflect payment state",
      "Aging and collection reports must refresh",
    ],
  },
  {
    name: "POS",
    endpointPrefix: "/pos",
    requiredSideEffects: [
      "Reduce inventory stock after sale",
      "Create receipt and payment entry",
      "Post cash/bank movement to finance",
    ],
  },
];
