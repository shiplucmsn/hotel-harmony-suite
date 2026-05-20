import { createFileRoute } from "@tanstack/react-router";
import { FollowupsPage } from "@/modules/crm/pages/followups-page";

export const Route = createFileRoute("/app/crm/followups")({
  component: FollowupsPage,
});
