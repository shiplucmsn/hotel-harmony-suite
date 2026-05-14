import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products } from "@/lib/inventory-mock";
import { CalendarClock, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/app/inv/expiry")({ component: ExpiryPage });

function ExpiryPage() {
  const items = products.filter(p => p.expiry);
  const now = new Date("2026-05-12");
  const withDays = items.map(p => {
    const days = Math.ceil((new Date(p.expiry!).getTime() - now.getTime()) / 86400000);
    return { ...p, days };
  }).sort((a, b) => a.days - b.days);

  return (
    <div className="space-y-6">
      <PageHeader title="Expiry Tracking" description="Monitor products approaching expiration." breadcrumbs={[{ label: "Inventory" }, { label: "Expiry" }]} />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Expiring < 30 days" value={String(withDays.filter(p => p.days < 30).length)} icon={AlertTriangle} accent="bg-destructive" trend="down" change="2 items" />
        <StatCard label="Expiring < 90 days" value={String(withDays.filter(p => p.days < 90).length)} icon={CalendarClock} accent="bg-warning" change="3 items" />
        <StatCard label="Tracked items" value={String(items.length)} icon={CheckCircle2} accent="bg-success" change="+1" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Expiry calendar</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Batch</TableHead><TableHead>Stock</TableHead><TableHead>Expiry</TableHead><TableHead>Days left</TableHead></TableRow></TableHeader>
            <TableBody>
              {withDays.map(p => {
                const tone = p.days < 30 ? "bg-destructive/15 text-destructive border-destructive/30" : p.days < 90 ? "bg-warning/15 text-warning border-warning/30" : "bg-success/15 text-success border-success/30";
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium flex items-center gap-2"><span className="text-xl">{p.image}</span>{p.name}</TableCell>
                    <TableCell className="font-mono text-xs">{p.batch}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell className="text-muted-foreground">{p.expiry}</TableCell>
                    <TableCell><Badge variant="outline" className={tone}>{p.days} days</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
