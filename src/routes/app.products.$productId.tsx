import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "@/modules/inventory/pages/product-detail-page";

type ProductDetailSearch = {
  tab?: "stock" | "movements";
};

export const Route = createFileRoute("/app/products/$productId")({
  validateSearch: (search: Record<string, unknown>): ProductDetailSearch => ({
    tab: search.tab === "movements" ? "movements" : search.tab === "stock" ? "stock" : undefined,
  }),
  component: ProductDetailPage,
});
