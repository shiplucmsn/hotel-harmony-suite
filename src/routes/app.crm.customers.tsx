import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter } from "lucide-react";
import { customers } from "@/lib/crm-mock";

export const Route = createFileRoute("/app/crm/customers")({ component: CustomersPage });

function CustomersPage() {
  const [q, setQ] = useState("");
  const filtered = customers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Management"
        description="View, segment and manage your customer base."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Customers" }]}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New Customer</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Name</Label><Input placeholder="Acme Inc." /></div>
                  <div><Label>Type</Label><Input placeholder="Enterprise" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Email</Label><Input type="email" /></div>
                  <div><Label>Phone</Label><Input /></div>
                </div>
                <div><Label>Billing Address</Label><Input /></div>
              </div>
              <DialogFooter><Button variant="outline">Cancel</Button><Button>Save Customer</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({customers.length})</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search customers..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filters</Button>
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Open Inv.</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link to="/app/crm/customers/$customerId" params={{ customerId: c.id }} className="flex items-center gap-3 hover:underline">
                        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs gradient-primary text-primary-foreground">{c.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                        <div>
                          <div className="font-medium text-sm">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.id} · joined {c.joined}</div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="outline">{c.type}</Badge></TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{c.email}<br /><span className="text-muted-foreground">{c.phone}</span></TableCell>
                    <TableCell><Badge className={c.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>{c.status}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">${c.totalSpent.toLocaleString()}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{c.openInvoices}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View profile</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem>Create invoice</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
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
  );
}
