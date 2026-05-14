import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { workOrders, prodTone } from "@/lib/production-mock";
import { Search, Plus, MoreHorizontal, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/prod/work-orders")({ component: WorkOrdersPage });

function WorkOrdersPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(false);
  const filtered = workOrders.filter(w =>
    (tab === "all" || w.status === tab) &&
    (w.product.toLowerCase().includes(q.toLowerCase()) || w.number.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Orders"
        description="Track every production order through to completion."
        breadcrumbs={[{ label: "Production" }, { label: "Work Orders" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New work order</Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader><SheetTitle>Create work order</SheetTitle></SheetHeader>
                <div className="space-y-4 py-4">
                  <div><Label>Product</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                      <SelectContent><SelectItem value="lp">Aurora Pro Laptop</SelectItem><SelectItem value="ph">Nimbus Phone X</SelectItem></SelectContent>
                    </Select></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Quantity</Label><Input type="number" placeholder="100" /></div>
                    <div><Label>Assignee</Label><Input placeholder="Lena Vogt" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Planned</Label><Input type="date" /></div>
                    <div><Label>Due</Label><Input type="date" /></div>
                  </div>
                  <div><Label>Notes</Label><Input placeholder="Optional" /></div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setOpen(false); toast.success("Work order created"); }}>Create</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </>
        }
      />

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="in_progress">In progress</TabsTrigger>
              <TabsTrigger value="qc">QC</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative max-w-sm flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Search work orders..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead>Assignee</TableHead><TableHead>Due</TableHead><TableHead>Progress</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {filtered.map(w => (
                <TableRow key={w.id}>
                  <TableCell className="font-mono text-xs">{w.number}</TableCell>
                  <TableCell className="font-medium">{w.product}</TableCell>
                  <TableCell>{w.qty}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{w.assignee}</TableCell>
                  <TableCell className="text-sm">{w.due}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={w.progress} className="h-1.5 w-24" />
                      <span className="text-xs text-muted-foreground">{w.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={prodTone(w.status)}>{w.status.replace("_"," ")}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Marked complete")}>Mark complete</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
