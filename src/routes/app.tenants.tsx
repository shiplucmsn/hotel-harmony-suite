import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Users, CreditCard, Puzzle } from "lucide-react";
import { erpApi } from "@/lib/erp-api";
import { buildWorkspaceUrl } from "@/lib/tenant-resolve";
import { openApexSignup } from "@/lib/workspace-links";
import { useAuth } from "@/hooks/use-auth";
import { userHasPermission } from "@/modules/auth/auth-redirect";
import { CompanyModulesDialog } from "@/components/company-modules-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/app/tenants")({ component: TenantsPage });

type TenantRow = {
  id: number | string;
  name: string;
  slug: string;
  status: string;
  company_id?: number | null;
};

function TenantsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPlatformAdmin =
    user?.userType === "super_admin" || userHasPermission(user, "platform.tenants.manage");
  const [tenantList, setTenantList] = useState<TenantRow[]>([]);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [modulesTarget, setModulesTarget] = useState<TenantRow | null>(null);

  const onNewWorkspace = () => {
    if (isPlatformAdmin) {
      void navigate({ to: "/app/saas/tenants" });
      return;
    }
    openApexSignup();
  };

  const openWorkspace = (slug: string) => {
    window.location.href = buildWorkspaceUrl(slug, "/app/dashboard");
  };

  useEffect(() => {
    void erpApi.tenants.list().then((rows) => setTenantList(rows as TenantRow[])).catch(() => setTenantList([]));
  }, []);

  const openModules = (t: TenantRow) => {
    setModulesTarget(t);
    setModulesOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspaces"
        description="Switch between workspaces or manage module access per company."
        breadcrumbs={[{ label: "Administration" }, { label: "Workspaces" }]}
        actions={
          <Button
            size="sm"
            className="gradient-primary border-0 text-primary-foreground"
            onClick={onNewWorkspace}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isPlatformAdmin ? "Provision workspace" : "Register another company"}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {t.company_id ? (
                      <DropdownMenuItem onClick={() => openModules(t)}>
                        <Puzzle className="mr-2 h-4 w-4" />
                        Manage modules
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => openWorkspace(t.slug)}>
                  Open workspace
                </Button>
                {t.company_id ? (
                  <Button variant="outline" size="icon" onClick={() => openModules(t)} title="Manage modules">
                    <Puzzle className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {modulesTarget?.company_id ? (
        <CompanyModulesDialog
          companyId={modulesTarget.company_id}
          companyName={modulesTarget.name}
          open={modulesOpen}
          onOpenChange={setModulesOpen}
        />
      ) : null}
    </div>
  );
}
