import { createFileRoute } from "@tanstack/react-router";
import { PlansPage } from "@/modules/saas/pages/plans-page";

export const Route = createFileRoute("/app/saas/plans")({ component: PlansPage });
