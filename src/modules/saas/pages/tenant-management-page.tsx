import { useMemo, useState } from "react";
import { MoreHorizontal, Pause, Play, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SaasNav } from "@/modules/saas/components/saas-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import {
  useProvisionTenant,
  useSaasPlans,
  useSaasSubscriptions,
  useSaasTenants,
  useUpdateTenantStatus,
} from "@/hooks/saas/use-saas";
import { setTenantId } from "@/lib/api-auth";
import type { SaasPlanDto, SaasSubscriptionDto, TenantDto } from "@/modules/saas/types";

export function TenantManagementPage() {
  const [search, setSearch] = useState("");
  const { data: tenantsRes, isLoading } = useSaasTenants({ per_page: 100 });
  const { data: subsRes } = useSaasSubscriptions({ per_page: 200 });
  const { data: plansRes } = useSaasPlans({ per_page: 50, is_active: true });
  const updateStatus = useUpdateTenantStatus();

  const subsByTenant = useMemo(() => {
    const map = new Map<string, SaasSubscriptionDto>();
    for (const sub of subsRes?.data ?? []) {
      if (!map.has(sub.tenant_id)) map.set(sub.tenant_id, sub);
    }
    return map;
  }, [subsRes?.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (tenantsRes?.data ?? []).filter(
      (t) => !q || t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
    );
  }, [tenantsRes?.data, search]);

  const setStatus = (tenant: TenantDto, status: string) => {
    updateStatus.mutate({ id: tenant.id, status });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant management"
        description="Provision workspaces, manage lifecycle and subscription assignment."
        breadcrumbs={[{ label: "Platform" }, { label: "SaaS" }, { label: "Tenants" }]}
      />
      <SaasNav />

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>All tenants</CardTitle>
            <CardDescription>{filtered.length} workspace(s)</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tenants…"
                className="h-8 w-56 pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ProvisionTenantDialog plans={plansRes?.data ?? []} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading tenants…</p>
          ) : filtered.length === 0 ? (
            <EmptyState title="No tenants" description="Provision your first tenant to get started." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const sub = subsByTenant.get(t.slug);
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-xs font-semibold text-primary-foreground">
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sub?.plan?.name ?? "—"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sub?.status === "active" ? "default" : "secondary"}>
                          {sub?.status ?? "none"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.status === "active" || t.status === "trial"
                              ? "default"
                              : t.status === "suspended"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTenantId(t.slug)}>Open workspace</DropdownMenuItem>
                            {t.status === "suspended" ? (
                              <DropdownMenuItem onClick={() => setStatus(t, "active")}>
                                <Play className="mr-2 h-4 w-4" /> Activate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setStatus(t, "suspended")}>
                                <Pause className="mr-2 h-4 w-4" /> Suspend
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProvisionTenantDialog({ plans }: { plans: SaasPlanDto[] }) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [planId, setPlanId] = useState<string>("");
  const provision = useProvisionTenant();

  const submit = () => {
    provision.mutate(
      {
        slug,
        name,
        owner_email: ownerEmail,
        owner_name: ownerName || undefined,
        plan_id: planId ? Number(planId) : undefined,
        billing_cycle: "monthly",
      },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          New tenant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Provision tenant</DialogTitle>
          <DialogDescription>Create company, tenant, owner user and subscription.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Company name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="acme" />
          </div>
          <div className="space-y-1.5">
            <Label>Owner email</Label>
            <Input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Owner name</Label>
            <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="gradient-primary border-0 text-primary-foreground"
            disabled={!slug || !name || !ownerEmail || provision.isPending}
            onClick={submit}
          >
            {provision.isPending ? "Provisioning…" : "Create tenant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
