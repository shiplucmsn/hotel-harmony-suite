import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Timer, Clock, DollarSign } from "lucide-react";
import { overtime } from "@/lib/hr-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/hr/overtime")({ component: OvertimePage });

const tone: Record<string, string> = {
  approved: "bg-success/15 text-success border-success/20",
  pending: "bg-warning/15 text-warning border-warning/20",
  rejected: "bg-destructive/15 text-destructive border-destructive/20",
};

function OvertimePage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overtime"
        description="Track and approve overtime work."
        breadcrumbs={[{ label: "HR" }, { label: "Overtime" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />Log overtime</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log overtime</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2"><Label>Date *</Label><Input type="date" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>Hours *</Label><Input type="number" step="0.5" placeholder="2.0" /></div>
                  <div className="grid gap-2"><Label>Rate multiplier</Label><Input type="number" step="0.1" defaultValue={1.5} /></div>
                </div>
                <div className="grid gap-2"><Label>Project / reason</Label><Input placeholder="What were you working on?" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                <Button className="gradient-primary text-primary-foreground border-0" onClick={()=>setOpen(false)}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Hours this month" value="284" change="+12%" icon={Timer} />
        <StatCard label="Pending approval" value="14" icon={Clock} accent="bg-warning" />
        <StatCard label="Cost this month" value="$8,420" change="+9%" icon={DollarSign} accent="bg-info" />
        <StatCard label="Avg. per employee" value="3.2 h" icon={Timer} accent="bg-success" />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overtime.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.employee}</TableCell>
                <TableCell>{o.date}</TableCell>
                <TableCell>{o.hours}</TableCell>
                <TableCell>{o.rate}×</TableCell>
                <TableCell className="text-muted-foreground">{o.project}</TableCell>
                <TableCell><span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium capitalize", tone[o.status])}>{o.status}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
