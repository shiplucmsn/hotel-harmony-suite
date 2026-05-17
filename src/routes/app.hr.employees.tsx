import { createFileRoute } from "@tanstack/react-router";
import { HrEmployeesPage } from "@/modules/hr/pages/employees-page";

export const Route = createFileRoute("/app/hr/employees")({
  component: HrEmployeesPage,
});

