import { createFileRoute } from "@tanstack/react-router";
import { SaasDashboardPage } from "@/modules/saas/pages/saas-dashboard-page";

export const Route = createFileRoute("/app/saas")({ component: SaasDashboardPage });
