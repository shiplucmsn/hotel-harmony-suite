import { createFileRoute } from "@tanstack/react-router";
import { PlanningPage } from "@/modules/production/pages/planning-page";

export const Route = createFileRoute("/app/prod/planning")({
  component: PlanningPage,
});
