import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/stat-card";
import { Search, Plus, Download, MoreHorizontal, Pencil, Trash2, Receipt, CheckCircle2, Clock, Upload } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useState } from "react";
import { expenses, expenseBreakdown } from "@/lib/finance-mock";
import { ConfirmDelete } from "@/components/confirm-delete";

export const Route = createFileRoute("/app/finance/expenses")({ component: ExpensesPage });

const statusColor: Record<string, string> = {
  approved: "bg-success/15 text-success border-success/20",
  pending: "bg-warning/15 text-warning border-warning/20",
  rejected: "bg-destructive/15 text-destructive border-destructive/20",
  reimbursed: "bg-info/15 text-info border-info/20",
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--info))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

function ExpensesPage() {
  const [q, setQ] = useState("");
  const [del, setDel] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const filtered = expenses.filter(e => e.vendor.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id: string) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Management"
        description="Capture, categorize and approve company expenses."
        breadcrumbs={[{ label: "Finance" }, { label: "Expenses" }]}
        actions={<>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Sheet>
            <SheetTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />Add expense</Button></SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader><SheetTitle>New expense</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <div><Label>Vendor</Label><Input placeholder="e.g. Google Ads" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" /></div>
                  <div><Label>Amount</Label><Input type="number" placeholder="0.00" /></div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{["Marketing","Travel","Software","Rent","Office","Misc"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Notes</Label><Textarea rows={2} /></div>
                <div>
                  <Label>Receipt</Label>
                  <div className="mt-1 flex items-center justify-center rounded-lg border-2 border-dashed py-8 text-sm text-muted-foreground">
                    <Upload className="mr-2 h-4 w-4" /> Drag &amp; drop or click to upload
                  </div>
                </div>
              </div>
              <SheetFooter className="mt-6"><Button variant="outline">Cancel</Button><Button className="gradient-primary text-primary-foreground border-0">Submit</Button></SheetFooter>
            </SheetContent>
          </Sheet>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="This month" value="$11,302" change="+8.1%" icon={Receipt} />
        <StatCard label="Approved" value="$9,260" change="+12.4%" icon={CheckCircle2} accent="bg-success" />
        <StatCard label="Pending" value="$1,962" icon={Clock} accent="bg-warning" />
        <StatCard label="Rejected" value="$95" trend="down" icon={Trash2} accent="bg-destructive" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>By category</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                    {expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top categories</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {expenseBreakdown.map(c => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <span>{c.name}</span>
                <span className="font-medium tabular-nums">${c.value.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search vendor…" className="pl-9" />
        </div>
        <Select defaultValue="all"><SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            {Object.keys(statusColor).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {sel.length > 0 && <Button size="sm" variant="outline">Approve {sel.length}</Button>}
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-10"><Checkbox /></TableHead>
              <TableHead>Number</TableHead><TableHead>Date</TableHead><TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead><TableHead>Paid by</TableHead>
              <TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(e => (
              <TableRow key={e.id}>
                <TableCell><Checkbox checked={sel.includes(e.id)} onCheckedChange={() => toggle(e.id)} /></TableCell>
                <TableCell className="font-mono text-xs">{e.number}</TableCell>
                <TableCell>{e.date}</TableCell>
                <TableCell className="font-medium">{e.vendor}</TableCell>
                <TableCell>{e.category}</TableCell>
                <TableCell className="text-muted-foreground">{e.paidBy}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">${e.amount.toLocaleString()}</TableCell>
                <TableCell><Badge variant="outline" className={statusColor[e.status]}>{e.status}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDel(true)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <ConfirmDelete open={del} onOpenChange={setDel} />
    </div>
  );
}
