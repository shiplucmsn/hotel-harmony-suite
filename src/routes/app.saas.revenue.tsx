import { createFileRoute } from "@tanstack/react-router";
import { RevenueAnalyticsPage } from "@/modules/saas/pages/revenue-analytics-page";

export const Route = createFileRoute("/app/saas/revenue")({ component: RevenueAnalyticsPage });
