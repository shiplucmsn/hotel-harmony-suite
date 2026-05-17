import { createFileRoute } from "@tanstack/react-router";
import { HrEmployeeDetailPage } from "@/modules/hr/pages/employee-detail-page";

export const Route = createFileRoute("/app/hr/employees/$employeeId")({
  component: EmployeeDetailRoutePage,
});

function EmployeeDetailRoutePage() {
  const { employeeId } = Route.useParams();
  return <HrEmployeeDetailPage employeeId={employeeId} />;
}

