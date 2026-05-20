import { createFileRoute } from "@tanstack/react-router";
import { SkuSystemPage } from "@/modules/inventory/pages/sku-system-page";

export const Route = createFileRoute("/app/inv/sku")({
  component: SkuSystemPage,
});
