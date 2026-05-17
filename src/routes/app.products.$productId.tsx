import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "@/modules/inventory/pages/product-detail-page";

export const Route = createFileRoute("/app/products/$productId")({
  component: ProductDetailPage,
});
