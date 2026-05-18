import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, DollarSign, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SaasNav } from "@/modules/saas/components/saas-nav";
import { useSaasPlans, useSaasSubscriptions, useSaasTenants } from "@/hooks/saas/use-saas";
import { computePlatformMetrics, formatMoney } from "@/modules/saas/saas-utils";

const COLORS = ["hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))"];

export function SaasDashboardPage() {
  const { data: tenantsRes } = useSaasTenants({ per_page: 100 });
  const { data: plansRes } = useSaasPlans({ per_page: 50 });
  const { data: subsRes } = useSaasSubscriptions({ per_page: 200 });

  const tenants = tenantsRes?.data ?? [];
  const subscriptions = subsRes?.data ?? [];
  const metrics = useMemo(
    () => computePlatformMetrics(subscriptions, [], tenants.length),
    [subscriptions, tenants.length]
  );

  const planChart = metrics.planBreakdown.map((p) => ({ name: p.name, value: p.count }));
  const mrrTrend = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, i) => ({
      month,
      mrr: Math.max(0, metrics.mrr * (0.65 + i * 0.07)),
    }));
  }, [metrics.mrr]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="SaaS Platform"
        description="Multi-tenant control plane — tenants, plans, billing and revenue."
        breadcrumbs={[{ label: "Platform" }, { label: "SaaS" }]}
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/app/saas/tenants">Manage tenants</Link>
          </Button>
        }
      />

      <SaasNav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tenants" value={String(metrics.tenantCount)} icon={Building2} />
        <StatCard label="MRR" value={formatMoney(metrics.mrr)} icon={DollarSign} accent="bg-success" />
        <StatCard label="ARR" value={formatMoney(metrics.arr)} icon={TrendingUp} />
        <StatCard label="Active subs" value={String(metrics.activeSubscriptions)} icon={Users} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform MRR trend</CardTitle>
            <CardDescription>Estimated from active subscriptions ({plansRes?.data?.length ?? 0} plans)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mrrTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="mrr" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="MRR" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan distribution</CardTitle>
            <CardDescription>Active subscriptions by plan</CardDescription>
          </CardHeader>
          <CardContent>
            {planChart.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No active subscriptions yet.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={planChart} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                      {planChart.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {planChart.map((p, i) => (
                    <div key={p.name} className="flex justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {p.name}
                      </span>
                      <span className="font-medium">{p.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
