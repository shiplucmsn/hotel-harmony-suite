import { createFileRoute } from "@tanstack/react-router";
import { HrLeavesPage } from "@/modules/hr/pages/leaves-page";

export const Route = createFileRoute("/app/hr/leaves")({
  component: HrLeavesPage,
});

