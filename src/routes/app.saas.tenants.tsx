import { createFileRoute } from "@tanstack/react-router";
import { TenantManagementPage } from "@/modules/saas/pages/tenant-management-page";

export const Route = createFileRoute("/app/saas/tenants")({ component: TenantManagementPage });
