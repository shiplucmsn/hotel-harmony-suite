import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export const Route = createFileRoute("/app/products")({
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage your product catalog." breadcrumbs={[{ label: "Operations" }, { label: "Products" }]} actions={<Button className="gradient-primary text-primary-foreground border-0">+ New product</Button>} />
      <Card><CardContent className="p-6"><EmptyState icon={Package} title="No products yet" description="Create your first product to start selling." action={<Button>Create product</Button>} /></CardContent></Card>
    </div>
  ),
});
