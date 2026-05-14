import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { revenueData } from "@/lib/mock-data";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

export const Route = createFileRoute("/app/analytics")({
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Deep insights across your business." breadcrumbs={[{ label: "Workspace" }, { label: "Analytics" }]} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sessions" value="48,210" change="14.2%" icon={Activity} />
        <StatCard label="MRR" value="$184k" change="6.4%" icon={DollarSign} accent="bg-success" />
        <StatCard label="New customers" value="421" change="9.1%" icon={Users} accent="bg-info" />
        <StatCard label="Churn" value="2.1%" change="0.3%" trend="down" icon={TrendingUp} accent="bg-warning" />
      </div>
      <Card>
        <CardHeader><CardTitle>Trend</CardTitle><CardDescription>Revenue trend over the last 12 months.</CardDescription></CardHeader>
        <CardContent>
          <div className="h-[340px]">
            <ResponsiveContainer>
              <AreaChart data={revenueData}>
                <defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2} fill="url(#ar)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
});
