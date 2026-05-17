import { createFileRoute } from "@tanstack/react-router";
import { HrPayrollPage } from "@/modules/hr/pages/payroll-page";

export const Route = createFileRoute("/app/hr/payroll")({
  component: HrPayrollPage,
});

