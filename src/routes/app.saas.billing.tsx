import { createFileRoute } from "@tanstack/react-router";
import { BillingPage } from "@/modules/saas/pages/billing-page";

export const Route = createFileRoute("/app/saas/billing")({ component: BillingPage });
