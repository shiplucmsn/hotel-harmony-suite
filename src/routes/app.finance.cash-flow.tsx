import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/stat-card";
import { Download, ArrowDownToLine, ArrowUpFromLine, Wallet } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { cashFlowSeries } from "@/lib/finance-mock";

export const Route = createFileRoute("/app/finance/cash-flow")({ component: CashFlowPage });

function CashFlowPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cash Flow"
        description="Monitor cash inflows, outflows and runway."
        breadcrumbs={[{ label: "Finance" }, { label: "Cash Flow" }]}
        actions={<Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>}
      />

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <Input type="date" className="w-44" />
        <Input type="date" className="w-44" />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Net cash flow" value="$292,000" change="+12.4%" icon={Wallet} />
        <StatCard label="Inflows" value="$890,000" change="+8.1%" icon={ArrowDownToLine} accent="bg-success" />
        <StatCard label="Outflows" value="$598,000" change="+5.6%" trend="down" icon={ArrowUpFromLine} accent="bg-destructive" />
      </div>

      <Card>
        <CardHeader><CardTitle>Cash flow trend</CardTitle></CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowSeries}>
                <defs>
                  <linearGradient id="cf-in" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cf-out" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Area type="monotone" dataKey="inflow" stroke="hsl(var(--success))" fill="url(#cf-in)" strokeWidth={2} />
                <Area type="monotone" dataKey="outflow" stroke="hsl(var(--destructive))" fill="url(#cf-out)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
