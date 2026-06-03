import { createFileRoute } from "@tanstack/react-router";
import { MachinesPage } from "@/modules/production/pages/machines-page";

export const Route = createFileRoute("/app/prod/machines")({
  component: MachinesPage,
});
