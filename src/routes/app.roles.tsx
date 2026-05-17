import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Shield, Users as UsersIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { requirePermission } from "@/core/auth/require-permission";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import {
  useCreateRole,
  useDeleteRole,
  usePermissionCatalog,
  useRole,
  useRoles,
  useSyncRolePermissions,
} from "@/hooks/rbac/use-roles";
import type { PermissionDto, RoleDto } from "@/modules/rbac/types";

export const Route = createFileRoute("/app/roles")({
  beforeLoad: () => requirePermission("core.roles.view"),
  component: RolesPage,
});

function RolesPage() {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: catalog, isLoading: catalogLoading } = usePermissionCatalog();
  const createRole = useCreateRole();
  const deleteRole = useDeleteRole();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set());
  const [newRoleName, setNewRoleName] = useState("");

  const activeRole = useMemo(
    () => roles?.find((r) => r.id === activeId) ?? roles?.[0],
    [roles, activeId]
  );

  const { data: roleDetail } = useRole(activeRole?.id ?? null);
  const syncPerms = useSyncRolePermissions(activeRole?.id ?? 0);

  useEffect(() => {
    if (roles?.length && activeId == null) {
      setActiveId(roles[0].id);
    }
  }, [roles, activeId]);

  useEffect(() => {
    const perms = roleDetail?.permissions ?? activeRole?.permissions;
    if (!perms) return;
    setSelectedPermIds(new Set(perms.map((p) => p.id)));
  }, [activeRole?.id, activeRole?.permissions, roleDetail?.permissions]);

  const togglePerm = (perm: PermissionDto) => {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(perm.id)) next.delete(perm.id);
      else next.add(perm.id);
      return next;
    });
  };

  const toggleModule = (perms: PermissionDto[], checked: boolean) => {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      perms.forEach((p) => (checked ? next.add(p.id) : next.delete(p.id)));
      return next;
    });
  };

  if (rolesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & permissions"
        description="Define what each role can see and do across modules."
        breadcrumbs={[{ label: "Administration" }, { label: "Roles" }]}
        actions={
          <PermissionGate permission="core.roles.manage">
            <Button
              size="sm"
              className="border-0 gradient-primary text-primary-foreground"
              onClick={() => {
                if (!newRoleName.trim()) return;
                createRole.mutate(
                  { name: newRoleName.trim() },
                  { onSuccess: (role) => setActiveId(role.id) }
                );
                setNewRoleName("");
              }}
              disabled={createRole.isPending || !newRoleName.trim()}
            >
              {createRole.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              New role
            </Button>
          </PermissionGate>
        }
      />

      <PermissionGate permission="core.roles.manage">
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="new-role">Quick create role</Label>
              <Input
                id="new-role"
                placeholder="e.g. Warehouse Manager"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </PermissionGate>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {(roles ?? []).map((role) => (
              <RoleListItem
                key={role.id}
                role={role}
                active={role.id === activeRole?.id}
                onSelect={() => setActiveId(role.id)}
                onDelete={() => deleteRole.mutate(role.id)}
              />
            ))}
          </CardContent>
        </Card>

        {activeRole ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      {activeRole.name}
                    </CardTitle>
                    <CardDescription>{activeRole.description ?? "No description"}</CardDescription>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-3.5 w-3.5" />
                      {activeRole.users_count ?? 0} users
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{selectedPermIds.size} permissions</span>
                    {activeRole.is_system ? <Badge variant="secondary">System</Badge> : null}
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Permissions</CardTitle>
                <CardDescription>Toggle access for each capability.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {catalogLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  Object.entries(catalog ?? {}).map(([module, perms]) => {
                    const allChecked = perms.every((p) => selectedPermIds.has(p.id));
                    const someChecked = perms.some((p) => selectedPermIds.has(p.id));

                    return (
                      <div key={module}>
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-semibold capitalize">{module}</h4>
                          <PermissionGate permission="core.roles.manage">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() => toggleModule(perms, !allChecked)}
                            >
                              {allChecked ? "Clear all" : someChecked ? "Select all" : "Select all"}
                            </Button>
                          </PermissionGate>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {perms.map((perm) => (
                            <div
                              key={perm.id}
                              className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5"
                            >
                              <div>
                                <span className="text-sm">{perm.name}</span>
                                <p className="text-[10px] text-muted-foreground">{perm.slug}</p>
                              </div>
                              <Checkbox
                                checked={selectedPermIds.has(perm.id)}
                                disabled={activeRole.is_system || activeRole.slug === "super-admin"}
                                onCheckedChange={() => togglePerm(perm)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}

                <PermissionGate permission="core.roles.manage">
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      className="border-0 gradient-primary text-primary-foreground"
                      disabled={
                        syncPerms.isPending ||
                        activeRole.is_system ||
                        activeRole.slug === "super-admin"
                      }
                      onClick={() => syncPerms.mutate([...selectedPermIds])}
                    >
                      {syncPerms.isPending ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </PermissionGate>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RoleListItem({
  role,
  active,
  onSelect,
  onDelete,
}: {
  role: RoleDto;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg p-3 text-left transition-colors",
        active ? "bg-primary/10 text-primary" : "hover:bg-muted"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{role.name}</span>
        <Badge variant="secondary" className="text-[10px]">
          {role.users_count ?? 0}
        </Badge>
      </div>
      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{role.description ?? role.slug}</p>
      <PermissionGate permission="core.roles.manage">
        {!role.is_system ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-7 text-xs text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </Button>
        ) : null}
      </PermissionGate>
    </button>
  );
}
