import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { tenantSubscriptionApi } from "@/modules/platform/tenant-subscription-api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { withTenantKey } from "@/lib/tenant-query";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/modules/auth/auth-api";

export const Route = createFileRoute("/app/subscription")({ component: SubscriptionPage });

function SubscriptionPage() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const token = useAuthStore((s) => s.token);

  const { data: plansRes, isLoading: plansLoading } = useQuery({
    queryKey: withTenantKey(["tenant", "subscription", "plans"]),
    queryFn: () => tenantSubscriptionApi.listPlans(),
  });

  const { data: currentRes, isLoading: currentLoading } = useQuery({
    queryKey: withTenantKey(["tenant", "subscription", "current"]),
    queryFn: () => tenantSubscriptionApi.current(),
  });

  const plans = plansRes?.data ?? [];
  const current = currentRes?.data?.subscription;
  const currentPlanCode = current?.plan?.code ?? "starter";

  useEffect(() => {
    if (!token || !currentRes) return;
    void authApi.me().then(setUser);
  }, [token, currentRes, setUser]);

  const upgrade = useMutation({
    mutationFn: (planCode: string) => tenantSubscriptionApi.upgrade(planCode),
    onSuccess: async (res) => {
      toast.success(`Upgraded to ${res.data?.plan?.name ?? "new plan"}. Payment can be added later.`);
      await queryClient.invalidateQueries({ queryKey: withTenantKey(["tenant"]) });
      const user = await authApi.me();
      setUser(user);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not upgrade plan")),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription & plans"
        description="Choose a package for your workspace. Upgrades apply immediately — billing integration comes later."
        breadcrumbs={[{ label: "Account" }, { label: "Subscription" }]}
      />

      {current && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current plan</CardTitle>
            <CardDescription>
              Status: <span className="font-medium text-foreground">{current.status}</span>
              {current.trial_ends_at ? (
                <>
                  {" "}
                  · Trial ends {new Date(current.trial_ends_at).toLocaleDateString()}
                </>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="gradient-primary border-0 text-primary-foreground">
                {current.plan?.name ?? currentPlanCode}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ${Number(current.plan?.price_monthly ?? 0).toFixed(0)}/month
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {(plansLoading || currentLoading) && (
          <p className="text-sm text-muted-foreground md:col-span-3">Loading plans…</p>
        )}
        {plans.map((plan) => {
          const isCurrent = plan.code === currentPlanCode && current?.status === "active";
          const highlighted = plan.code === "professional";

          return (
            <Card
              key={plan.code}
              className={cn(
                "relative flex flex-col",
                highlighted && "border-primary shadow-md",
                isCurrent && "ring-2 ring-primary/40",
              )}
            >
              {highlighted ? (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 gradient-primary border-0 text-primary-foreground text-[10px]">
                  Popular
                </Badge>
              ) : null}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.code === "enterprise" ? <Sparkles className="h-4 w-4 text-primary" /> : null}
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description ?? plan.code}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="text-3xl font-semibold">
                  ${Number(plan.price_monthly).toFixed(0)}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                {plan.trial_days > 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">{plan.trial_days}-day free trial</p>
                ) : null}
                <ul className="mt-4 flex-1 space-y-1.5 text-sm text-muted-foreground">
                  {(plan.module_keys ?? []).slice(0, 8).map((key) => (
                    <li key={key} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                      <span className="capitalize">{key.replace(/_/g, " ")}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn("mt-6 w-full", highlighted && "gradient-primary border-0 text-primary-foreground")}
                  variant={highlighted ? "default" : "outline"}
                  disabled={isCurrent || upgrade.isPending}
                  onClick={() => upgrade.mutate(plan.code)}
                >
                  {isCurrent ? "Current plan" : upgrade.isPending ? "Upgrading…" : "Upgrade now"}
                </Button>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">No payment required yet</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
