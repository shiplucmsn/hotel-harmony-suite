import { createFileRoute } from "@tanstack/react-router";
import { WastePage } from "@/modules/production/pages/waste-page";

export const Route = createFileRoute("/app/prod/waste")({
  component: WastePage,
});
