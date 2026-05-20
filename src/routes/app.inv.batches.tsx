import { createFileRoute } from "@tanstack/react-router";
import { BatchesPage } from "@/modules/inventory/pages/batches-page";

export const Route = createFileRoute("/app/inv/batches")({
  component: BatchesPage,
});
