import { createFileRoute } from "@tanstack/react-router";
import { VendorInvoiceDetailPage } from "@/modules/purchase/pages/vendor-invoice-detail-page";

export const Route = createFileRoute("/app/inv/vendor-invoices/$invoiceId")({
  component: function VendorInvoiceDetailRoute() {
    const { invoiceId } = Route.useParams();
    return <VendorInvoiceDetailPage invoiceId={invoiceId} />;
  },
});
