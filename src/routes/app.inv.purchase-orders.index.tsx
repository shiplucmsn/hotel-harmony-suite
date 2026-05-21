import { createFileRoute } from "@tanstack/react-router";
import { PurchaseOrdersPage } from "@/modules/purchase/pages/purchase-orders-page";

type PoSearch = {
  supplier_id?: number;
  new_po?: number;
};

export const Route = createFileRoute("/app/inv/purchase-orders/")({
  validateSearch: (search: Record<string, unknown>): PoSearch => ({
    supplier_id:
      search.supplier_id != null && search.supplier_id !== ""
        ? Number(search.supplier_id)
        : undefined,
    new_po:
      search.new_po != null && search.new_po !== "" ? Number(search.new_po) : undefined,
  }),
  component: function PurchaseOrdersIndexRoute() {
    const { supplier_id, new_po } = Route.useSearch();
    return (
      <PurchaseOrdersPage
        initialSupplierId={supplier_id}
        openNewPo={new_po === 1}
      />
    );
  },
});
