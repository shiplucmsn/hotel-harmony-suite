import { createFileRoute } from "@tanstack/react-router";
import { ExpiryPage } from "@/modules/inventory/pages/expiry-page";

export const Route = createFileRoute("/app/inv/expiry")({
  component: ExpiryPage,
});
