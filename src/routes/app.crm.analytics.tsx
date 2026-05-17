import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "@/modules/crm/pages/analytics-page";

export const Route = createFileRoute("/app/crm/analytics")({
  component: AnalyticsPage,
});
