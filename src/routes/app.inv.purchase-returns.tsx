import { createFileRoute } from "@tanstack/react-router";
import { PurchaseReturnsPage } from "@/modules/purchase/pages/purchase-returns-page";

type ReturnSearch = {
  supplier_id?: number;
  new_return?: number;
};

export const Route = createFileRoute("/app/inv/purchase-returns")({
  validateSearch: (search: Record<string, unknown>): ReturnSearch => ({
    supplier_id:
      search.supplier_id != null && search.supplier_id !== ""
        ? Number(search.supplier_id)
        : undefined,
    new_return:
      search.new_return != null && search.new_return !== ""
        ? Number(search.new_return)
        : undefined,
  }),
  component: function PurchaseReturnsRoute() {
    const { supplier_id, new_return } = Route.useSearch();
    return (
      <PurchaseReturnsPage initialSupplierId={supplier_id} openNew={new_return === 1} />
    );
  },
});
