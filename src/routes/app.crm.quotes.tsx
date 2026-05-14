import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Plus, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { quotes } from "@/lib/crm-mock";

const variant: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-info/10 text-info",
  accepted: "bg-success/10 text-success",
  expired: "bg-destructive/10 text-destructive",
};

export const Route = createFileRoute("/app/crm/quotes")({
  component: () => (
    <div className="space-y-6">
      <PageHeader
        title="Quotation System"
        description="Create, send and track quotes through approval."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Quotations" }]}
        actions={
          <Sheet>
            <SheetTrigger asChild><Button className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New Quote</Button></SheetTrigger>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
              <SheetHeader><SheetTitle>New Quotation</SheetTitle></SheetHeader>
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Customer</Label><Input placeholder="Northwind Co" /></div>
                  <div><Label>Quote #</Label><Input placeholder="QT-2046" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" /></div>
                  <div><Label>Expires</Label><Input type="date" /></div>
                </div>
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">LINE ITEMS</div>
                  {[1, 2].map((i) => (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <Input className="col-span-6" placeholder="Description" />
                      <Input className="col-span-2" placeholder="Qty" />
                      <Input className="col-span-2" placeholder="Price" />
                      <Input className="col-span-2" placeholder="Total" disabled />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="mt-2"><Plus className="h-3 w-3 mr-1" />Add line</Button>
                </div>
                <div className="flex justify-end gap-6 pr-2 text-sm">
                  <div className="space-y-1 text-right text-muted-foreground"><div>Subtotal</div><div>Tax (10%)</div><div className="font-semibold text-foreground">Total</div></div>
                  <div className="space-y-1 text-right font-medium"><div>$10,000</div><div>$1,000</div><div className="font-semibold text-base">$11,000</div></div>
                </div>
              </div>
              <SheetFooter><Button variant="outline">Save Draft</Button><Button>Send Quote</Button></SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search quotes..." className="pl-9" />
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Quote #</TableHead><TableHead>Customer</TableHead><TableHead className="hidden md:table-cell">Date</TableHead><TableHead className="hidden md:table-cell">Expiry</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
              <TableBody>
                {quotes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.number}</TableCell>
                    <TableCell>{q.customer}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{q.date}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{q.expiry}</TableCell>
                    <TableCell><Badge className={variant[q.status]}>{q.status}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">${q.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end"><DropdownMenuItem>Preview</DropdownMenuItem><DropdownMenuItem>Send</DropdownMenuItem><DropdownMenuItem>Convert to invoice</DropdownMenuItem><DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem></DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
});
