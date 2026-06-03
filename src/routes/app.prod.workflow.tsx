import { createFileRoute } from "@tanstack/react-router";
import { WorkflowPage } from "@/modules/production/pages/workflow-page";

export const Route = createFileRoute("/app/prod/workflow")({
  component: WorkflowPage,
});
