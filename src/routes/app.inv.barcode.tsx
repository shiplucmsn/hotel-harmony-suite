import { createFileRoute } from "@tanstack/react-router";
import { BarcodePage } from "@/modules/inventory/pages/barcode-page";

export const Route = createFileRoute("/app/inv/barcode")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: BarcodeRoute,
});

function BarcodeRoute() {
  const { q } = Route.useSearch();
  return <BarcodePage initialQuery={q} />;
}
