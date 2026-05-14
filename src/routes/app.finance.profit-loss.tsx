import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/stat-card";
import { Download, TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { plSeries } from "@/lib/finance-mock";

export const Route = createFileRoute("/app/finance/profit-loss")({ component: PLPage });

function PLPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profit & Loss"
        description="Income statement showing revenue, costs and net profit."
        breadcrumbs={[{ label: "Finance" }, { label: "Profit & Loss" }]}
        actions={<Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export PDF</Button>}
      />

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <Input type="date" className="w-44" defaultValue="2026-01-01" />
        <Input type="date" className="w-44" defaultValue="2026-06-30" />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value="$613,000" change="+18.2%" icon={DollarSign} />
        <StatCard label="COGS" value="$242,000" change="+9.4%" trend="down" icon={TrendingDown} accent="bg-destructive" />
        <StatCard label="Net profit" value="$206,000" change="+22.6%" icon={TrendingUp} accent="bg-success" />
        <StatCard label="Margin" value="33.6%" change="+2.1%" icon={Percent} accent="bg-info" />
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly P&amp;L</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plSeries}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                <Bar dataKey="cogs" fill="hsl(var(--destructive))" radius={[4,4,0,0]} />
                <Bar dataKey="opex" fill="hsl(var(--warning))" radius={[4,4,0,0]} />
                <Bar dataKey="profit" fill="hsl(var(--success))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Statement breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            ["Revenue", 613000, false],
            ["— Sales", 482000, false],
            ["— Services", 131000, false],
            ["Cost of goods sold", -242000, true],
            ["Gross profit", 371000, false],
            ["Operating expenses", -165000, true],
            ["— Salaries", -98000, true],
            ["— Marketing", -42000, true],
            ["— Other", -25000, true],
            ["Net profit", 206000, false],
          ].map(([label, val, neg]) => (
            <div key={label as string} className={`flex items-center justify-between py-2 border-b last:border-0 ${typeof label === 'string' && (label === 'Net profit' || label === 'Gross profit') ? 'font-semibold' : ''}`}>
              <span className={(label as string).startsWith("—") ? "pl-4 text-muted-foreground text-sm" : ""}>{label}</span>
              <span className={`tabular-nums ${neg ? "text-destructive" : ""}`}>${Math.abs(val as number).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
