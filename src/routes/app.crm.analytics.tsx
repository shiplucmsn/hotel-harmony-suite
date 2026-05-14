import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ActivityTimeline } from "@/components/activity-timeline";
import { Target, DollarSign, Users, TrendingUp, Download } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { salesTrend, leadsBySource, deals } from "@/lib/crm-mock";

const COLORS = ["hsl(var(--primary))", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export const Route = createFileRoute("/app/crm/analytics")({
  component: () => (
    <div className="space-y-6">
      <PageHeader
        title="Sales Analytics"
        description="Pipeline performance, revenue trends and lead intelligence."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Analytics" }]}
        actions={<Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pipeline Value" value="$324,800" change="+18%" icon={DollarSign} />
        <StatCard label="Open Deals" value="48" change="+6" icon={Target} accent="bg-violet-500" />
        <StatCard label="New Leads" value="124" change="+22%" icon={Users} accent="bg-cyan-500" />
        <StatCard label="Win Rate" value="42%" change="+4.2%" icon={TrendingUp} accent="bg-emerald-500" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Leads by Source</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadsBySource} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {leadsBySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Deals Closed Per Month</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="deals" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Top Deals</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {deals.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <div className="font-medium">{d.title}</div>
                  <div className="text-xs text-muted-foreground">{d.customer}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${d.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{d.stage}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent CRM Activity</CardTitle></CardHeader>
        <CardContent><ActivityTimeline /></CardContent>
      </Card>
    </div>
  ),
});
