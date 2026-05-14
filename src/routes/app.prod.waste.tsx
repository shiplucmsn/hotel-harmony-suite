import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { wasteRecords } from "@/lib/production-mock";
import { Trash2, Plus, TrendingDown, DollarSign, Recycle } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const wasteByReason = [
  { name: "Defective", value: 480 },
  { name: "Spillage", value: 120 },
  { name: "Expiry", value: 220 },
  { name: "QC reject", value: 1320 },
];
const COLORS = ["hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--success))", "hsl(var(--destructive))"];

export const Route = createFileRoute("/app/prod/waste")({ component: WastePage });

function WastePage() {
  const total = wasteRecords.reduce((s, w) => s + w.cost, 0);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Waste Management"
        description="Reduce loss across production lines and storage."
        breadcrumbs={[{ label: "Production" }, { label: "Waste" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Log waste</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Waste cost (mo)" value={`$${total.toLocaleString()}`} change="-8.2%" trend="down" icon={DollarSign} />
        <StatCard label="Records" value={String(wasteRecords.length)} icon={Trash2} />
        <StatCard label="Recovered" value="$320" change="+15%" icon={Recycle} />
        <StatCard label="Loss rate" value="1.4%" change="-0.3%" trend="down" icon={TrendingDown} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Waste log</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Ref</TableHead><TableHead>Source</TableHead><TableHead>Reason</TableHead><TableHead>Qty</TableHead><TableHead>Cost</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {wasteRecords.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-xs">{w.ref}</TableCell>
                    <TableCell>{w.source}</TableCell>
                    <TableCell>{w.reason}</TableCell>
                    <TableCell>{w.qty}</TableCell>
                    <TableCell className="text-destructive font-medium">${w.cost}</TableCell>
                    <TableCell className="text-sm">{w.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>By reason</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={wasteByReason} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {wasteByReason.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
