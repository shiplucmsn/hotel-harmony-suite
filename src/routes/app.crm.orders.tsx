import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { salesOrders } from "@/lib/crm-mock";

const variant: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  processing: "bg-info/10 text-info",
  shipped: "bg-violet-500/10 text-violet-500",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export const Route = createFileRoute("/app/crm/orders")({
  component: () => (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description="Manage confirmed orders from quote to delivery."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Sales Orders" }]}
        actions={<Button className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New Order</Button>}
      />
      <Tabs defaultValue="all">
        <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="pending">Pending</TabsTrigger><TabsTrigger value="shipped">Shipped</TabsTrigger><TabsTrigger value="completed">Completed</TabsTrigger></TabsList>
      </Tabs>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-9" />
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Order #</TableHead><TableHead>Customer</TableHead><TableHead className="hidden md:table-cell">Order Date</TableHead><TableHead className="hidden md:table-cell">Delivery</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
              <TableBody>
                {salesOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.number}</TableCell>
                    <TableCell>{o.customer}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{o.date}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{o.delivery}</TableCell>
                    <TableCell><Badge className={variant[o.status]}>{o.status}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">${o.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end"><DropdownMenuItem>View</DropdownMenuItem><DropdownMenuItem>Mark as shipped</DropdownMenuItem><DropdownMenuItem>Generate invoice</DropdownMenuItem><DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem></DropdownMenuContent>
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
