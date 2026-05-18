import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SaasNav } from "@/modules/saas/components/saas-nav";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSaasPlans, useSaasSubscriptions, useSaasTenants } from "@/hooks/saas/use-saas";
import { saasApi } from "@/modules/saas/saas-api";
import { computePlatformMetrics, formatMoney, revenueByMonth, subscriptionMrr } from "@/modules/saas/saas-utils";
import type { SaasBillingInvoiceDto } from "@/modules/saas/types";

export function RevenueAnalyticsPage() {
  const { data: tenantsRes } = useSaasTenants({ per_page: 100 });
  const { data: subsRes } = useSaasSubscriptions({ per_page: 200 });
  const { data: plansRes } = useSaasPlans({ per_page: 50 });
  const [allInvoices, setAllInvoices] = useState<SaasBillingInvoiceDto[]>([]);

  const tenants = tenantsRes?.data ?? [];
  const subscriptions = subsRes?.data ?? [];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const chunks: SaasBillingInvoiceDto[] = [];
      for (const tenant of tenants.slice(0, 20)) {
        try {
          const res = await saasApi.invoices({ tenant_id: tenant.slug, per_page: 50 });
          chunks.push(...res.data);
        } catch {
          // skip tenant without invoices access
        }
      }
      if (!cancelled) setAllInvoices(chunks);
    })();
    return () => {
      cancelled = true;
    };
  }, [tenants]);

  const metrics = useMemo(
    () => computePlatformMetrics(subscriptions, allInvoices, tenants.length),
    [subscriptions, allInvoices, tenants.length]
  );

  const revenueTrend = useMemo(() => revenueByMonth(allInvoices), [allInvoices]);

  const mrrByPlan = useMemo(() => {
    const map = new Map<string, number>();
    for (const sub of subscriptions) {
      if (!["trial", "active", "grace"].includes(sub.status)) continue;
      const name = sub.plan?.name ?? "Unknown";
      map.set(name, (map.get(name) ?? 0) + subscriptionMrr(sub));
    }
    return Array.from(map.entries()).map(([name, mrr]) => ({ name, mrr }));
  }, [subscriptions]);

  const arpu = metrics.activeSubscriptions > 0 ? metrics.mrr / metrics.activeSubscriptions : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue analytics"
        description="MRR, ARR and collections across the SaaS platform."
        breadcrumbs={[{ label: "Platform" }, { label: "SaaS" }, { label: "Revenue" }]}
      />
      <SaasNav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="MRR" value={formatMoney(metrics.mrr)} icon={DollarSign} accent="bg-success" />
        <StatCard label="ARR" value={formatMoney(metrics.arr)} icon={TrendingUp} />
        <StatCard label="ARPU" value={formatMoney(arpu)} icon={Users} />
        <StatCard label="Collected" value={formatMoney(metrics.collected)} icon={DollarSign} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Collected revenue</CardTitle>
            <CardDescription>Paid subscription invoices by month</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No paid invoice history yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MRR by plan</CardTitle>
            <CardDescription>{plansRes?.data?.length ?? 0} plans · {metrics.activeSubscriptions} active subs</CardDescription>
          </CardHeader>
          <CardContent>
            {mrrByPlan.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No subscription revenue data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mrrByPlan}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mrr" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="MRR" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
