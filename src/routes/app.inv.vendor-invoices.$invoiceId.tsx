import { createFileRoute } from "@tanstack/react-router";
import { requirePermission } from "@/core/auth/require-permission";
import { VendorInvoiceDetailPage } from "@/modules/purchase/pages/vendor-invoice-detail-page";

export const Route = createFileRoute("/app/inv/vendor-invoices/$invoiceId")({
  beforeLoad: () => requirePermission("purchase.invoices.view"),
  component: function VendorInvoiceDetailRoute() {
    const { invoiceId } = Route.useParams();
    return <VendorInvoiceDetailPage invoiceId={invoiceId} />;
  },
});
