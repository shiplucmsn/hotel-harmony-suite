import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Users as UsersIcon, Shield } from "lucide-react";
import { roles, permissionGroups } from "@/lib/mock-data";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/roles")({ component: RolesPage });

function RolesPage() {
  const [active, setActive] = useState(roles[0].id);
  const role = roles.find((r) => r.id === active)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & permissions"
        description="Define what each role can see and do across modules."
        breadcrumbs={[{ label: "Administration" }, { label: "Roles" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />New role</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader><CardTitle className="text-base">Roles</CardTitle></CardHeader>
          <CardContent className="p-2 space-y-1">
            {roles.map((r) => (
              <button key={r.id} onClick={() => setActive(r.id)}
                className={cn("w-full rounded-lg p-3 text-left transition-colors",
                  r.id === active ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.name}</span>
                  <Badge variant="secondary" className="text-[10px]">{r.users}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{r.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />{role.name}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5" />{role.users} users</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{role.permissions} permissions</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Permissions</CardTitle><CardDescription>Toggle access for each capability.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {permissionGroups.map((g) => (
                <div key={g.group}>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{g.group}</h4>
                    <Button variant="ghost" size="sm" className="text-xs">Select all</Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {g.items.map((it, i) => (
                      <div key={it} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
                        <span className="text-sm">{it}</span>
                        <Checkbox defaultChecked={i < 2} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline">Discard</Button>
                <Button className="gradient-primary text-primary-foreground border-0">Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
