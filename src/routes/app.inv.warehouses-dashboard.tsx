import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { warehouses, stockTrend } from "@/lib/inventory-mock";
import { Warehouse, Activity, PackageCheck, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";

export const Route = createFileRoute("/app/inv/warehouses-dashboard")({ component: Dashboard });

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Multi-Warehouse Dashboard" description="Cross-facility analytics & utilization." breadcrumbs={[{ label: "Inventory" }, { label: "Multi-Warehouse" }]} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active warehouses" value="3" change="+1" icon={Warehouse} />
        <StatCard label="Inbound (mo)" value="1,960" change="+7.6%" icon={TrendingUp} accent="bg-success" />
        <StatCard label="Outbound (mo)" value="1,720" change="+4.8%" icon={Activity} />
        <StatCard label="Fill rate" value="94.2%" change="+1.2%" icon={PackageCheck} accent="bg-success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Inbound vs Outbound</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockTrend}>
                <defs>
                  <linearGradient id="in" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                  <linearGradient id="out" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" /><YAxis /><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Area dataKey="inbound" stroke="hsl(var(--primary))" fill="url(#in)" />
                <Area dataKey="outbound" stroke="hsl(var(--success))" fill="url(#out)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Stock by warehouse</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouses.map(w => ({ name: w.name, used: w.used, free: w.capacity - w.used }))}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" /><YAxis /><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} /><Legend />
                <Bar dataKey="used" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="free" stackId="a" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Utilization</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {warehouses.map(w => {
            const pct = Math.round(w.used / w.capacity * 100);
            return (
              <div key={w.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm"><span className="font-medium">{w.name}</span><span className="text-muted-foreground">{pct}%</span></div>
                <Progress value={pct} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
