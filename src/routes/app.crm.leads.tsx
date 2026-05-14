import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { leads } from "@/lib/crm-mock";

const statusVariant: Record<string, string> = {
  new: "bg-info/10 text-info",
  contacted: "bg-warning/10 text-warning",
  qualified: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

export const Route = createFileRoute("/app/crm/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const filtered = leads.filter((l) => l.name.toLowerCase().includes(q.toLowerCase()) || l.company.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Management"
        description="Capture, qualify and convert prospects into customers."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Leads" }]}
        actions={
          <Sheet>
            <SheetTrigger asChild>
              <Button className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New Lead</Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader><SheetTitle>Create Lead</SheetTitle></SheetHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>First name</Label><Input placeholder="Emma" /></div>
                  <div><Label>Last name</Label><Input placeholder="Stone" /></div>
                </div>
                <div><Label>Company</Label><Input placeholder="Acme Co" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Email</Label><Input type="email" placeholder="emma@acme.io" /></div>
                  <div><Label>Phone</Label><Input placeholder="+1 555 0100" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Source</Label><Select><SelectTrigger><SelectValue placeholder="Website" /></SelectTrigger><SelectContent><SelectItem value="web">Website</SelectItem><SelectItem value="ref">Referral</SelectItem><SelectItem value="event">Event</SelectItem></SelectContent></Select></div>
                  <div><Label>Estimated value</Label><Input placeholder="$10,000" /></div>
                </div>
              </div>
              <SheetFooter><Button variant="outline">Cancel</Button><Button>Create Lead</Button></SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search leads..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Select><SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="qualified">Qualified</SelectItem></SelectContent></Select>
              <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filters</Button>
              <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
              <span className="font-medium">{selected.length} selected</span>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline">Assign owner</Button>
                <Button size="sm" variant="outline">Change status</Button>
                <Button size="sm" variant="destructive">Delete</Button>
              </div>
            </div>
          )}

          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={(v) => setSelected(v ? filtered.map((l) => l.id) : [])} /></TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden lg:table-cell">Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id} className="cursor-pointer">
                    <TableCell><Checkbox checked={selected.includes(l.id)} onCheckedChange={(v) => setSelected(v ? [...selected, l.id] : selected.filter((s) => s !== l.id))} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{l.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                        <div>
                          <div className="font-medium text-sm">{l.name}</div>
                          <div className="text-xs text-muted-foreground">{l.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{l.company}</TableCell>
                    <TableCell className="hidden lg:table-cell"><Badge variant="outline">{l.source}</Badge></TableCell>
                    <TableCell><Badge className={statusVariant[l.status]}>{l.status}</Badge></TableCell>
                    <TableCell className="text-right font-medium">${l.value.toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{l.owner}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem>Convert to customer</DropdownMenuItem>
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

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing 1–{filtered.length} of {filtered.length} leads</span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="h-8 px-3">1</Button>
              <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
