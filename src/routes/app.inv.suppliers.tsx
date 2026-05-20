import { createFileRoute } from "@tanstack/react-router";
import { SuppliersListPage } from "@/modules/purchase/pages/suppliers-list-page";

export const Route = createFileRoute("/app/inv/suppliers")({
  component: SuppliersListPage,
});
