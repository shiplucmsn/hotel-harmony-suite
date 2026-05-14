import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Users, CreditCard } from "lucide-react";
import { tenants } from "@/lib/mock-data";

export const Route = createFileRoute("/app/tenants")({ component: TenantsPage });

function TenantsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspaces"
        description="Switch between or create new workspaces."
        breadcrumbs={[{ label: "Administration" }, { label: "Workspaces" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />New workspace</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((t) => (
          <Card key={t.id} className="group transition-all hover:shadow-elegant hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-base font-semibold text-primary-foreground shadow-glow">{t.initials}</div>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
              <h3 className="mt-4 font-semibold">{t.name}</h3>
              <Badge variant="outline" className="mt-1">{t.plan}</Badge>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-muted/40 p-2"><div className="flex items-center gap-1 text-muted-foreground text-xs"><Users className="h-3 w-3" />Members</div><div className="font-semibold">28</div></div>
                <div className="rounded-md bg-muted/40 p-2"><div className="flex items-center gap-1 text-muted-foreground text-xs"><CreditCard className="h-3 w-3" />MRR</div><div className="font-semibold">$1,420</div></div>
              </div>
              <Button variant="outline" className="mt-4 w-full">Open workspace</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
