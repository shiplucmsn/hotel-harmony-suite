import { createFileRoute } from "@tanstack/react-router";
import { CustomerDashboardPage } from "@/modules/crm/pages/customer-dashboard-page";

export const Route = createFileRoute("/app/crm/customers/$customerId")({
  component: () => {
    const { customerId } = Route.useParams();
    return <CustomerDashboardPage customerId={customerId} />;
  },
});
