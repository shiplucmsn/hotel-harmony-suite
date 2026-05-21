import { createFileRoute } from "@tanstack/react-router";
import { GrnListPage } from "@/modules/purchase/pages/grn-list-page";

type GrnSearch = {
  supplier_id?: number;
  new_grn?: number;
};

export const Route = createFileRoute("/app/inv/grn/")({
  validateSearch: (search: Record<string, unknown>): GrnSearch => ({
    supplier_id:
      search.supplier_id != null && search.supplier_id !== ""
        ? Number(search.supplier_id)
        : undefined,
    new_grn:
      search.new_grn != null && search.new_grn !== "" ? Number(search.new_grn) : undefined,
  }),
  component: function GrnIndexRoute() {
    const { supplier_id, new_grn } = Route.useSearch();
    return <GrnListPage initialSupplierId={supplier_id} openNew={new_grn === 1} />;
  },
});
