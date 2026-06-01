import { createFileRoute } from "@tanstack/react-router";
import { requirePermission } from "@/core/auth/require-permission";
import { VendorInvoicesListPage } from "@/modules/purchase/pages/vendor-invoices-list-page";

export const Route = createFileRoute("/app/inv/vendor-invoices/")({
  beforeLoad: () => requirePermission("purchase.invoices.view"),
  component: VendorInvoicesListPage,
});
