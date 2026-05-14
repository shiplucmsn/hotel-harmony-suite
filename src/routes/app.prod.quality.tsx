import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { qualityChecks, prodTone } from "@/lib/production-mock";
import { CheckCircle2, AlertTriangle, XCircle, Plus, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/app/prod/quality")({ component: QualityPage });

function QualityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Control"
        description="Inspections, defects and rework tracking."
        breadcrumbs={[{ label: "Production" }, { label: "Quality" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New inspection</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pass rate" value="94.2%" change="+1.8%" icon={ShieldCheck} />
        <StatCard label="Inspections" value="142" change="+12" icon={CheckCircle2} />
        <StatCard label="Rework" value="8" change="-2" trend="down" icon={AlertTriangle} />
        <StatCard label="Failed" value="3" change="-1" trend="down" icon={XCircle} />
      </div>

      <Card>
        <CardHeader><CardTitle>Recent quality checks</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Ref</TableHead><TableHead>Product</TableHead><TableHead>Batch</TableHead><TableHead>Inspector</TableHead><TableHead>Date</TableHead><TableHead>Defects</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
            <TableBody>
              {qualityChecks.map(q => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs">{q.ref}</TableCell>
                  <TableCell className="font-medium">{q.product}</TableCell>
                  <TableCell className="font-mono text-xs">{q.batch}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{q.inspector}</TableCell>
                  <TableCell className="text-sm">{q.date}</TableCell>
                  <TableCell><Badge variant="outline">{q.defects}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={prodTone(q.result)}>{q.result}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
