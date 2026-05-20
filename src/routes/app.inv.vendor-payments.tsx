import { createFileRoute } from "@tanstack/react-router";
import { VendorPaymentsPage } from "@/modules/purchase/pages/vendor-payments-page";

type PaymentSearch = {
  supplier_id?: number;
};

export const Route = createFileRoute("/app/inv/vendor-payments")({
  validateSearch: (search: Record<string, unknown>): PaymentSearch => ({
    supplier_id:
      search.supplier_id != null && search.supplier_id !== ""
        ? Number(search.supplier_id)
        : undefined,
  }),
  component: function VendorPaymentsRoute() {
    const { supplier_id } = Route.useSearch();
    return <VendorPaymentsPage initialSupplierId={supplier_id} />;
  },
});
