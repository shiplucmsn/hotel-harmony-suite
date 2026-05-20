import { createFileRoute } from "@tanstack/react-router";
import { ProductsListPage } from "@/modules/inventory/pages/products-list-page";

export const Route = createFileRoute("/app/products/")({
  component: ProductsListPage,
});
