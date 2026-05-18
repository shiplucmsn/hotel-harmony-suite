import { createFileRoute } from "@tanstack/react-router";
import { PipelinePage } from "@/modules/crm/pages/pipeline-page";

export const Route = createFileRoute("/app/crm/pipeline")({
  component: PipelinePage,
});
