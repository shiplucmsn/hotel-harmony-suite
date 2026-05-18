import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Factory, ShieldCheck, Activity, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";
import { useProductionWorkOrders } from "@/hooks/production/use-production";

export const Route = createFileRoute("/app/prod/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const { data } = useProductionWorkOrders({ per_page: 300 });
  const workOrders = data?.data ?? [];

  const metrics = useMemo(() => {
    const output = workOrders.reduce((sum, wo) => sum + Number(wo.actual_qty || 0), 0);
    const planned = workOrders.reduce((sum, wo) => sum + Number(wo.planned_qty || 0), 0);
    const completed = workOrders.filter((wo) => wo.status === "completed");
    const qualityPassRate = planned > 0 ? Math.round((output / planned) * 1000) / 10 : 0;
    const throughput = completed.length
      ? Math.round(output / Math.max(1, completed.length))
      : 0;
    const oee = planned > 0 ? Math.min(100, Math.round((output / planned) * 100)) : 0;
    return { output, oee, qualityPassRate: Math.max(0, Math.min(100, qualityPassRate)), throughput };
  }, [workOrders]);

  const productionTrend = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const grouped = new Map<string, { actual: number }>();
    days.forEach((day) => grouped.set(day, { actual: 0 }));
    for (const wo of workOrders) {
      const date = wo.completed_at ?? wo.updated_at ?? wo.created_at;
      if (!date) continue;
      const day = days[new Date(date).getDay()];
      const current = grouped.get(day);
      if (!current) continue;
      current.actual += Number(wo.actual_qty || 0);
      grouped.set(day, current);
    }
    return days.map((day) => ({ day, actual: grouped.get(day)?.actual ?? 0 }));
  }, [workOrders]);

  const oeeTrend = useMemo(() => {
    const recent = [...workOrders]
      .sort((a, b) => {
        const ad = new Date(a.created_at ?? 0).getTime();
        const bd = new Date(b.created_at ?? 0).getTime();
        return ad - bd;
      })
      .slice(-6);

    return recent.map((wo, index) => {
      const ratio = wo.planned_qty > 0 ? (wo.actual_qty / wo.planned_qty) * 100 : 0;
      return {
        week: `W${index + 1}`,
        oee: Math.max(0, Math.min(100, Math.round(ratio))),
      };
    });
  }, [workOrders]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Analytics"
        description="Throughput, OEE, and quality KPIs at a glance."
        breadcrumbs={[{ label: "Production" }, { label: "Analytics" }]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Output (wk)" value={metrics.output.toLocaleString()} icon={Factory} />
        <StatCard label="OEE" value={`${metrics.oee}%`} icon={Activity} />
        <StatCard label="Pass rate" value={`${metrics.qualityPassRate}%`} icon={ShieldCheck} />
        <StatCard label="Throughput" value={`${metrics.throughput}/wo`} icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Throughput trend</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area dataKey="actual" stroke="hsl(var(--primary))" fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>OEE — last 6 weeks</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={oeeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[60, 100]} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line dataKey="oee" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
