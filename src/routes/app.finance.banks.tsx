import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Building2, ArrowRightLeft, Trash2, Pencil } from "lucide-react";
import { bankAccounts } from "@/lib/finance-mock";

export const Route = createFileRoute("/app/finance/banks")({ component: BanksPage });

function BanksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Accounts"
        description="Connected bank, savings and credit accounts."
        breadcrumbs={[{ label: "Finance" }, { label: "Banks" }]}
        actions={
          <Dialog>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />Add account</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Connect bank account</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>Account name</Label><Input placeholder="Operating" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Bank</Label><Input placeholder="Chase" /></div>
                  <div><Label>Currency</Label><Input defaultValue="USD" /></div>
                </div>
                <div><Label>Account number</Label><Input placeholder="1234567890" /></div>
                <div>
                  <Label>Type</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{["Checking","Savings","Credit"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button variant="outline">Cancel</Button><Button className="gradient-primary text-primary-foreground border-0">Connect</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bankAccounts.map(b => (
          <Card key={b.id} className="relative overflow-hidden transition hover:shadow-elegant">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <CardContent className="relative p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{b.bank} · {b.number}</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                    <DropdownMenuItem><ArrowRightLeft className="mr-2 h-4 w-4" />Transfer</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Disconnect</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-5 text-3xl font-bold tracking-tight tabular-nums">
                {b.balance < 0 ? "-" : ""}${Math.abs(b.balance).toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{b.currency} · {b.type}</div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="outline" className={b.status === "active" ? "bg-success/15 text-success border-success/20" : "bg-destructive/15 text-destructive border-destructive/20"}>{b.status}</Badge>
                <Button size="sm" variant="ghost" className="text-primary"><ArrowRightLeft className="mr-2 h-4 w-4" />Transactions</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
