import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Boxes } from "lucide-react";

export const Route = createFileRoute("/app/inventory")({
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Track stock levels across warehouses." breadcrumbs={[{ label: "Operations" }, { label: "Inventory" }]} actions={<Button className="gradient-primary text-primary-foreground border-0">+ New item</Button>} />
      <Card><CardContent className="p-6"><EmptyState icon={Boxes} title="No inventory items" description="Add your first product to start tracking stock." action={<Button>Add item</Button>} /></CardContent></Card>
    </div>
  ),
});
