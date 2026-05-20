import { createFileRoute } from "@tanstack/react-router";
import { SupplierLedgerPage } from "@/modules/purchase/pages/supplier-ledger-page";

type LedgerSearch = {
  supplier_id?: number;
};

export const Route = createFileRoute("/app/inv/supplier-ledger")({
  validateSearch: (search: Record<string, unknown>): LedgerSearch => ({
    supplier_id:
      search.supplier_id != null && search.supplier_id !== ""
        ? Number(search.supplier_id)
        : undefined,
  }),
  component: function SupplierLedgerRoute() {
    const { supplier_id } = Route.useSearch();
    return <SupplierLedgerPage initialSupplierId={supplier_id} />;
  },
});
