import { createFileRoute } from "@tanstack/react-router";
import { RawMaterialsPage } from "@/modules/production/pages/raw-materials-page";

export const Route = createFileRoute("/app/prod/raw-materials")({
  component: RawMaterialsPage,
});
