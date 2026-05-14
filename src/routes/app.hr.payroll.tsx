import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, TrendingUp, Users, Receipt, Download, Play } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { payrollTrend, employees } from "@/lib/hr-mock";

export const Route = createFileRoute("/app/hr/payroll")({ component: PayrollPage });

function PayrollPage() {
  const sample = employees.slice(0, 6);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Run, monitor and export monthly payroll."
        breadcrumbs={[{ label: "HR" }, { label: "Payroll" }]}
        actions={<>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Play className="mr-2 h-4 w-4" />Run payroll</Button>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="May gross" value="$352,000" change="+2.4%" icon={Wallet} />
        <StatCard label="Net payout" value="$281,600" change="+2.1%" icon={Receipt} accent="bg-success" />
        <StatCard label="Headcount" value="248" change="+4" icon={Users} accent="bg-info" />
        <StatCard label="YoY growth" value="+11.2%" icon={TrendingUp} accent="bg-warning" />
      </div>

      <Card>
        <CardHeader><CardTitle>Payroll trend</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={payrollTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="gross" stroke="hsl(var(--primary))" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="deductions" stroke="hsl(var(--destructive))" fillOpacity={0} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader><CardTitle>May 2026 — payslips</CardTitle></CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Employee</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sample.map(e => {
              const gross = Math.round(e.salary / 12);
              const ded = Math.round(gross * 0.2);
              return (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>${gross.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">-${ded.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">${(gross-ded).toLocaleString()}</TableCell>
                  <TableCell><Badge className="bg-success/15 text-success border-success/20" variant="outline">Paid</Badge></TableCell>
                  <TableCell><Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
