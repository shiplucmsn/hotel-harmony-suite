import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, Download, MoreHorizontal, Pencil, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import { journalEntries, accounts } from "@/lib/finance-mock";

export const Route = createFileRoute("/app/finance/journal")({ component: JournalPage });

const statusColor: Record<string, string> = {
  posted: "bg-success/15 text-success border-success/20",
  draft: "bg-warning/15 text-warning border-warning/20",
  void: "bg-muted text-muted-foreground",
};

function JournalPage() {
  const [q, setQ] = useState("");
  const filtered = journalEntries.filter(j =>
    j.number.toLowerCase().includes(q.toLowerCase()) || j.memo.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal Entries"
        description="Manual debit/credit postings to your ledger."
        breadcrumbs={[{ label: "Finance" }, { label: "Journal" }]}
        actions={<>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Sheet>
            <SheetTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />New entry</Button></SheetTrigger>
            <SheetContent className="sm:max-w-2xl overflow-y-auto">
              <SheetHeader><SheetTitle>New journal entry</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" /></div>
                  <div><Label>Reference</Label><Input placeholder="INV-1042" /></div>
                </div>
                <div><Label>Memo</Label><Textarea rows={2} placeholder="Description…" /></div>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[0,1].map(i => (
                        <TableRow key={i}>
                          <TableCell>
                            <Select><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                              <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell><Input type="number" placeholder="0.00" className="text-right" /></TableCell>
                          <TableCell><Input type="number" placeholder="0.00" className="text-right" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button variant="outline" size="sm" className="w-full"><Plus className="mr-2 h-4 w-4" />Add line</Button>
              </div>
              <SheetFooter className="mt-6"><Button variant="outline">Save draft</Button><Button className="gradient-primary text-primary-foreground border-0">Post entry</Button></SheetFooter>
            </SheetContent>
          </Sheet>
        </>}
      />

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search entries…" className="pl-9" />
        </div>
        <Input type="date" className="w-44" />
        <Input type="date" className="w-44" />
        <Select defaultValue="all">
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="void">Void</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Number</TableHead><TableHead>Date</TableHead><TableHead>Reference</TableHead>
              <TableHead>Memo</TableHead><TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead><TableHead>Status</TableHead><TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(j => (
              <TableRow key={j.id}>
                <TableCell className="font-mono text-xs">{j.number}</TableCell>
                <TableCell>{j.date}</TableCell>
                <TableCell className="text-muted-foreground">{j.reference}</TableCell>
                <TableCell className="font-medium">{j.memo}</TableCell>
                <TableCell className="text-right tabular-nums">${j.debit.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">${j.credit.toLocaleString()}</TableCell>
                <TableCell><Badge variant="outline" className={statusColor[j.status]}>{j.status}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><FileText className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                      <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Void</DropdownMenuItem>
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
