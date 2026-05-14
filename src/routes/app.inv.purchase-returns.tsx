import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { purchaseReturns, statusTone } from "@/lib/inventory-mock";
import { Plus, Undo2 } from "lucide-react";

export const Route = createFileRoute("/app/inv/purchase-returns")({ component: ReturnsPage });

function ReturnsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Purchase Returns" description="Manage outbound returns to suppliers." breadcrumbs={[{ label: "Purchases" }, { label: "Returns" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New return</Button>}
      />

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Supplier</TableHead><TableHead>Reason</TableHead><TableHead>Qty</TableHead><TableHead>Refund amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {purchaseReturns.map(r => (
              <TableRow key={r.id}>
                <TableCell><span className="inline-flex items-center gap-2 font-mono text-xs"><Undo2 className="h-4 w-4 text-primary" />{r.number}</span></TableCell>
                <TableCell className="font-medium">{r.supplier}</TableCell>
                <TableCell className="text-muted-foreground">{r.reason}</TableCell>
                <TableCell>{r.qty}</TableCell>
                <TableCell className="font-semibold">${r.amount.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{r.date}</TableCell>
                <TableCell><Badge variant="outline" className={statusTone(r.status)}>{r.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
