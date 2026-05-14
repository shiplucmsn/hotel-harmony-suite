import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { suppliers, statusTone } from "@/lib/inventory-mock";
import { Plus, Star, Mail, Phone, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inv/suppliers")({ component: SuppliersPage });

function SuppliersPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader title="Supplier Management" description="Vendor directory & relationships." breadcrumbs={[{ label: "Purchases" }, { label: "Suppliers" }]}
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New supplier</Button></SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Add supplier</SheetTitle></SheetHeader>
              <div className="space-y-3 py-4">
                <div><Label>Company name</Label><Input /></div>
                <div className="grid grid-cols-2 gap-3"><div><Label>Contact person</Label><Input /></div><div><Label>Country</Label><Input /></div></div>
                <div className="grid grid-cols-2 gap-3"><div><Label>Email</Label><Input type="email" /></div><div><Label>Phone</Label><Input /></div></div>
                <div><Label>Tax ID</Label><Input /></div>
              </div>
              <SheetFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { setOpen(false); toast.success("Supplier added"); }}>Save</Button></SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search suppliers…" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map(s => (
          <Card key={s.id} className="hover:shadow-elegant transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12"><AvatarFallback className="gradient-primary text-primary-foreground">{s.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
                  <div>
                    <CardTitle className="text-base">{s.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{s.contact} · {s.country}</p>
                  </div>
                </div>
                <Badge variant="outline" className={statusTone(s.status)}>{s.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" />{s.email}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4" />{s.phone}</div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-warning text-warning" /><span className="font-medium">{s.rating}</span></div>
                <div className="text-sm"><span className="text-muted-foreground">Balance:</span> <span className="font-semibold">${s.balance.toLocaleString()}</span></div>
              </div>
              <div className="flex gap-2"><Button variant="outline" size="sm" className="flex-1">Ledger</Button><Button variant="outline" size="sm" className="flex-1">New PO</Button></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
