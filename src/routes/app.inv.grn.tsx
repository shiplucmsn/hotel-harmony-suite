import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { grns, statusTone } from "@/lib/inventory-mock";
import { Plus, PackageCheck } from "lucide-react";

export const Route = createFileRoute("/app/inv/grn")({ component: GRNPage });

function GRNPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Goods Receive Notes (GRN)" description="Record incoming shipments from suppliers." breadcrumbs={[{ label: "Purchases" }, { label: "GRN" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New GRN</Button>}
      />

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>GRN</TableHead><TableHead>PO Reference</TableHead><TableHead>Supplier</TableHead><TableHead>Items</TableHead><TableHead>Received</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {grns.map(g => (
              <TableRow key={g.id}>
                <TableCell><span className="inline-flex items-center gap-2 font-mono text-xs"><PackageCheck className="h-4 w-4 text-success" />{g.number}</span></TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{g.po}</TableCell>
                <TableCell className="font-medium">{g.supplier}</TableCell>
                <TableCell>{g.items}</TableCell>
                <TableCell><span className={g.received < g.items ? "text-warning font-medium" : "text-success font-medium"}>{g.received} / {g.items}</span></TableCell>
                <TableCell className="text-muted-foreground">{g.date}</TableCell>
                <TableCell><Badge variant="outline" className={statusTone(g.status)}>{g.status}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
