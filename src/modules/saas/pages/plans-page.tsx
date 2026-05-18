import { useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SaasNav } from "@/modules/saas/components/saas-nav";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { useCreateSaasPlan, useSaasPlans, useUpdateSaasPlan } from "@/hooks/saas/use-saas";
import { formatMoney, planPriceLabel } from "@/modules/saas/saas-utils";
import type { SaasPlanDto } from "@/modules/saas/types";
import { cn } from "@/lib/utils";

export function PlansPage() {
  const { data: plansRes, isLoading } = useSaasPlans({ per_page: 50 });
  const plans = plansRes?.data ?? [];
  const activeCount = plans.filter((p) => p.is_active).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription plans"
        description="Define pricing, limits and module entitlements per plan."
        breadcrumbs={[{ label: "Platform" }, { label: "SaaS" }, { label: "Plans" }]}
        actions={<PlanFormDialog />}
      />
      <SaasNav />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total plans" value={String(plans.length)} icon={CheckCircle2} />
        <StatCard label="Active plans" value={String(activeCount)} icon={CheckCircle2} accent="bg-success" />
        <StatCard
          label="Avg monthly"
          value={formatMoney(
            plans.length ? plans.reduce((s, p) => s + p.price_monthly, 0) / plans.length : 0
          )}
          icon={CheckCircle2}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">Loading plans…</p>
      ) : plans.length === 0 ? (
        <EmptyState title="No plans" description="Create your first SaaS plan." action={<PlanFormDialog />} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan }: { plan: SaasPlanDto }) {
  const updatePlan = useUpdateSaasPlan();

  return (
    <Card className={cn("relative", plan.is_active && "border-primary/40")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{plan.name}</CardTitle>
          <Badge variant={plan.is_active ? "default" : "secondary"}>{plan.is_active ? "Active" : "Inactive"}</Badge>
        </div>
        <CardDescription>{plan.code}</CardDescription>
        <div className="pt-2">
          <span className="text-3xl font-bold">{planPriceLabel(plan)}</span>
          <span className="text-sm text-muted-foreground"> / month</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">{plan.description ?? "No description"}</p>
        <ul className="space-y-1">
          <li>Seats: {plan.seats_limit ?? "Unlimited"}</li>
          <li>Storage: {plan.storage_limit_mb ? `${plan.storage_limit_mb} MB` : "Unlimited"}</li>
          <li>Trial: {plan.trial_days} days</li>
        </ul>
        <div className="flex flex-wrap gap-1">
          {(plan.module_keys ?? []).slice(0, 6).map((k) => (
            <Badge key={k} variant="outline" className="text-xs">
              {k}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <Label htmlFor={`active-${plan.id}`} className="text-xs">
            Active
          </Label>
          <Switch
            id={`active-${plan.id}`}
            checked={plan.is_active}
            onCheckedChange={(checked) => updatePlan.mutate({ id: plan.id, body: { is_active: checked } })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PlanFormDialog() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [priceMonthly, setPriceMonthly] = useState("0");
  const [seatsLimit, setSeatsLimit] = useState("");
  const createPlan = useCreateSaasPlan();

  const submit = () => {
    createPlan.mutate(
      {
        code,
        name,
        price_monthly: Number(priceMonthly),
        seats_limit: seatsLimit ? Number(seatsLimit) : null,
        module_keys: ["workspace", "crm", "inventory", "reports"],
        is_active: true,
      },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          New plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create plan</DialogTitle>
          <DialogDescription>Plans control pricing, limits and enabled modules.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="pro" />
          </div>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pro" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Monthly price</Label>
            <Input type="number" min={0} value={priceMonthly} onChange={(e) => setPriceMonthly(e.target.value)} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Seat limit</Label>
            <Input type="number" min={1} value={seatsLimit} onChange={(e) => setSeatsLimit(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="gradient-primary border-0 text-primary-foreground"
            disabled={!code || !name || createPlan.isPending}
            onClick={submit}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
