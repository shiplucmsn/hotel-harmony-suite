import { createFileRoute } from "@tanstack/react-router";
import { VendorInvoicesListPage } from "@/modules/purchase/pages/vendor-invoices-list-page";

export const Route = createFileRoute("/app/inv/vendor-invoices/")({
  component: VendorInvoicesListPage,
});
