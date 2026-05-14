import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/app/invoices")({
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Send, track and reconcile invoices." breadcrumbs={[{ label: "Operations" }, { label: "Invoices" }]} actions={<Button className="gradient-primary text-primary-foreground border-0">+ New invoice</Button>} />
      <Card><CardContent className="p-6"><EmptyState icon={FileText} title="No invoices yet" description="Create your first invoice to bill a customer." action={<Button>Create invoice</Button>} /></CardContent></Card>
    </div>
  ),
});
