import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { taxRates } from "@/lib/finance-mock";

export const Route = createFileRoute("/app/finance/tax")({ component: TaxPage });

function TaxPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax & VAT Settings"
        description="Configure tax rates, regions and compliance defaults."
        breadcrumbs={[{ label: "Finance" }, { label: "Tax" }]}
        actions={
          <Dialog>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />New rate</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add tax rate</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>Name</Label><Input placeholder="Standard VAT" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Rate (%)</Label><Input type="number" placeholder="20" /></div>
                  <div><Label>Region</Label><Input placeholder="EU" /></div>
                </div>
              </div>
              <DialogFooter><Button variant="outline">Cancel</Button><Button className="gradient-primary text-primary-foreground border-0">Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader><CardTitle>Defaults</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div><div className="font-medium">Prices include tax</div><div className="text-xs text-muted-foreground">Display gross by default</div></div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div><div className="font-medium">Auto compound</div><div className="text-xs text-muted-foreground">Apply taxes on top of taxes</div></div>
            <Switch />
          </div>
          <div>
            <Label>Default rate</Label>
            <Input defaultValue="Standard VAT (20%)" />
          </div>
          <div>
            <Label>Tax ID</Label>
            <Input placeholder="EU123456789" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader><CardTitle>Tax rates</CardTitle></CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Name</TableHead><TableHead>Rate</TableHead><TableHead>Region</TableHead>
              <TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {taxRates.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="font-semibold tabular-nums">{t.rate}%</TableCell>
                <TableCell>{t.region}</TableCell>
                <TableCell>{t.type}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={t.status === "active" ? "bg-success/15 text-success border-success/20" : "bg-muted text-muted-foreground"}>{t.status}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
