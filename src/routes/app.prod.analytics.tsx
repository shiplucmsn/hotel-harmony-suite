import { createFileRoute } from "@tanstack/react-router";
import { ProductionAnalyticsPage } from "@/modules/production/pages/analytics-page";

export const Route = createFileRoute("/app/prod/analytics")({
  component: ProductionAnalyticsPage,
});
