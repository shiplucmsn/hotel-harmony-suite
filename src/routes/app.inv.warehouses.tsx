import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { warehouses, statusTone } from "@/lib/inventory-mock";
import { Warehouse, MapPin, Plus, Boxes, PackageCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inv/warehouses")({ component: WarehousesPage });

function WarehousesPage() {
  const [open, setOpen] = useState(false);
  const total = warehouses.reduce((a, w) => a + w.capacity, 0);
  const used = warehouses.reduce((a, w) => a + w.used, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Warehouse Management" description="Manage facilities, capacity and managers." breadcrumbs={[{ label: "Inventory" }, { label: "Warehouses" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New warehouse</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create warehouse</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3"><div><Label>Name</Label><Input /></div><div><Label>Code</Label><Input /></div></div>
                <div><Label>Location</Label><Input /></div>
                <div className="grid grid-cols-2 gap-3"><div><Label>Manager</Label><Input /></div><div><Label>Capacity</Label><Input type="number" /></div></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { setOpen(false); toast.success("Warehouse added"); }}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Warehouses" value={String(warehouses.length)} change="+1" icon={Warehouse} />
        <StatCard label="Total capacity" value={total.toLocaleString()} change="+8.4%" icon={Boxes} />
        <StatCard label="Stock units" value={used.toLocaleString()} change="+12%" icon={PackageCheck} accent="bg-success" />
        <StatCard label="Utilization" value={`${Math.round(used / total * 100)}%`} change="+3%" icon={AlertTriangle} trend="down" accent="bg-warning" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {warehouses.map(w => {
          const pct = Math.round(w.used / w.capacity * 100);
          return (
            <Card key={w.id} className="hover:shadow-elegant transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{w.name}</CardTitle>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{w.code}</p>
                  </div>
                  <Badge variant="outline" className={statusTone(w.status)}>{w.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{w.location}</div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Manager</span><span className="font-medium">{w.manager}</span></div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Capacity</span><span className="font-medium">{w.used.toLocaleString()} / {w.capacity.toLocaleString()}</span></div>
                  <Progress value={pct} />
                </div>
                <div className="flex gap-2 pt-2"><Button variant="outline" size="sm" className="flex-1">View</Button><Button variant="outline" size="sm" className="flex-1">Edit</Button></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Multi-warehouse stock matrix</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Warehouse</TableHead><TableHead>Code</TableHead><TableHead>Capacity</TableHead><TableHead>Used</TableHead><TableHead>Free</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {warehouses.map(w => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell className="font-mono text-xs">{w.code}</TableCell>
                  <TableCell>{w.capacity.toLocaleString()}</TableCell>
                  <TableCell>{w.used.toLocaleString()}</TableCell>
                  <TableCell>{(w.capacity - w.used).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className={statusTone(w.status)}>{w.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
