import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { ShoppingCart, Boxes, Package, FileText, BarChart3 } from "lucide-react";

function makeRoute(path: string, title: string, icon: LucideIcon) {
  function Component() {
    const Icon = icon;
    return (
      <div className="space-y-6">
        <PageHeader title={title} description={`Manage ${title.toLowerCase()} for your workspace.`} breadcrumbs={[{ label: "Operations" }, { label: title }]} actions={<Button className="gradient-primary text-primary-foreground border-0">+ New {title.slice(0, -1)}</Button>} />
        <Card><CardContent className="p-6"><EmptyState icon={Icon} title={`No ${title.toLowerCase()} yet`} description={`Get started by creating your first ${title.toLowerCase().slice(0, -1)}.`} action={<Button>Create {title.slice(0, -1).toLowerCase()}</Button>} /></CardContent></Card>
      </div>
    );
  }
  return Component;
}

export const Route = createFileRoute("/app/sales")({ component: makeRoute("/app/sales", "Sales", ShoppingCart) });
