import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Users, CreditCard } from "lucide-react";
import { erpApi } from "@/lib/erp-api";
import { setTenantId } from "@/lib/api-auth";

export const Route = createFileRoute("/app/tenants")({ component: TenantsPage });

type TenantRow = { id: number | string; name: string; slug: string; status: string };

function TenantsPage() {
  const [tenantList, setTenantList] = useState<TenantRow[]>([]);

  useEffect(() => {
    void erpApi.tenants.list().then((rows) => setTenantList(rows as TenantRow[])).catch(() => setTenantList([]));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspaces"
        description="Switch between or create new workspaces."
        breadcrumbs={[{ label: "Administration" }, { label: "Workspaces" }]}
        actions={
          <Button size="sm" className="gradient-primary text-primary-foreground border-0">
            <Plus className="mr-2 h-4 w-4" />
            New workspace
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenantList.map((t) => (
          <Card key={t.id} className="group transition-all hover:shadow-elegant hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-base font-semibold text-primary-foreground shadow-glow">
                  {t.name.slice(0, 2).toUpperCase()}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="mt-4 font-semibold">{t.name}</h3>
              <Badge variant="outline" className="mt-1">
                {t.status}
              </Badge>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    Slug
                  </div>
                  <div className="font-semibold">{t.slug}</div>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    Status
                  </div>
                  <div className="font-semibold">{t.status}</div>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full" onClick={() => setTenantId(t.slug)}>
                Open workspace
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
