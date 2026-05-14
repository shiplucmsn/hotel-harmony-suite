import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, Plus, Download, MoreHorizontal, Pencil, Trash2, Filter } from "lucide-react";
import { useState } from "react";
import { accounts } from "@/lib/finance-mock";
import { ConfirmDelete } from "@/components/confirm-delete";

export const Route = createFileRoute("/app/finance/accounts")({ component: AccountsPage });

const typeColor: Record<string, string> = {
  Asset: "bg-info/15 text-info border-info/20",
  Liability: "bg-warning/15 text-warning border-warning/20",
  Equity: "bg-primary/15 text-primary border-primary/20",
  Income: "bg-success/15 text-success border-success/20",
  Expense: "bg-destructive/15 text-destructive border-destructive/20",
};

function AccountsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [del, setDel] = useState(false);
  const filtered = accounts.filter(a =>
    (type === "all" || a.type === type) &&
    (a.name.toLowerCase().includes(q.toLowerCase()) || a.code.includes(q))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts"
        description="Define and organize your general ledger accounts."
        breadcrumbs={[{ label: "Finance" }, { label: "Chart of Accounts" }]}
        actions={<>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />New account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create account</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Code</Label><Input placeholder="6400" /></div>
                  <div>
                    <Label>Type</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["Asset","Liability","Equity","Income","Expense"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Name</Label><Input placeholder="Travel Expense" /></div>
                <div><Label>Currency</Label><Input defaultValue="USD" /></div>
              </div>
              <DialogFooter><Button variant="outline">Cancel</Button><Button className="gradient-primary text-primary-foreground border-0">Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </>}
      />

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search code or name…" className="pl-9" />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {["Asset","Liability","Equity","Income","Expense"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Filters</Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead>
              <TableHead className="text-right">Balance</TableHead><TableHead>Currency</TableHead>
              <TableHead>Status</TableHead><TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-xs">{a.code}</TableCell>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell><Badge variant="outline" className={typeColor[a.type]}>{a.type}</Badge></TableCell>
                <TableCell className="text-right font-semibold tabular-nums">${a.balance.toLocaleString()}</TableCell>
                <TableCell>{a.currency}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={a.status === "active" ? "bg-success/15 text-success border-success/20" : "bg-muted text-muted-foreground"}>{a.status}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => setDel(true)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <ConfirmDelete open={del} onOpenChange={setDel} title="Delete account?" description="This will archive the account permanently." />
    </div>
  );
}
