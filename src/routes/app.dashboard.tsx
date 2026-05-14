import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTimeline } from "@/components/activity-timeline";
import { revenueData, salesByCategory } from "@/lib/mock-data";
import { DollarSign, Users, ShoppingCart, TrendingUp, Download, MoreHorizontal } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard });

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  expenses: { label: "Expenses", color: "var(--chart-2)" },
};

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back, Alicia. Here's what's happening today."
        breadcrumbs={[{ label: "Workspace" }, { label: "Dashboard" }]}
        actions={<>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0">+ New report</Button>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total revenue" value="$842,650" change="12.4%" icon={DollarSign} />
        <StatCard label="Active customers" value="3,284" change="8.2%" icon={Users} accent="bg-info" />
        <StatCard label="Orders this month" value="1,429" change="3.1%" trend="down" icon={ShoppingCart} accent="bg-warning" />
        <StatCard label="Conversion rate" value="4.86%" change="0.4%" icon={TrendingUp} accent="bg-success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Revenue overview</CardTitle>
              <CardDescription>Revenue vs expenses, last 12 months</CardDescription>
            </div>
            <Tabs defaultValue="12m" className="hidden sm:block">
              <TabsList>
                <TabsTrigger value="3m">3M</TabsTrigger>
                <TabsTrigger value="6m">6M</TabsTrigger>
                <TabsTrigger value="12m">12M</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2} fill="url(#rev)" />
                  <Area type="monotone" dataKey="expenses" stroke="var(--chart-2)" strokeWidth={2} fill="url(#exp)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by category</CardTitle>
            <CardDescription>Distribution this quarter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={salesByCategory} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {salesByCategory.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top performing channels</CardTitle>
            <CardDescription>Sales volume by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer height={260}>
              <BarChart data={[
                { ch: "Direct", v: 4200 }, { ch: "Email", v: 3100 }, { ch: "Referral", v: 2700 },
                { ch: "Organic", v: 2400 }, { ch: "Paid", v: 1900 }, { ch: "Social", v: 1450 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="ch" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="v" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest events in your workspace</CardDescription>
            </div>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <ActivityTimeline />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pipeline status</CardTitle>
            <CardDescription>Open opportunities by stage</CardDescription>
          </div>
          <Badge variant="secondary">Live</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { name: "Discovery", count: 24, value: "$184k", color: "bg-chart-1" },
              { name: "Qualified", count: 18, value: "$320k", color: "bg-chart-2" },
              { name: "Proposal", count: 12, value: "$245k", color: "bg-chart-3" },
              { name: "Negotiation", count: 7, value: "$162k", color: "bg-chart-4" },
              { name: "Won", count: 9, value: "$210k", color: "bg-chart-5" },
            ].map((s) => (
              <div key={s.name} className="rounded-lg border p-4 transition-all hover:shadow-card hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.name}</span>
                  <span className={`h-2 w-2 rounded-full ${s.color}`} />
                </div>
                <div className="mt-2 text-2xl font-semibold">{s.count}</div>
                <div className="text-sm text-muted-foreground">{s.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
