import { createFileRoute } from "@tanstack/react-router";
import { BomPage } from "@/modules/production/pages/bom-page";

export const Route = createFileRoute("/app/prod/bom")({
  component: BomPage,
});
