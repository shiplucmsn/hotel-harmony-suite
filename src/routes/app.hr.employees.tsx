import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { ConfirmDelete } from "@/components/confirm-delete";
import { EmptyState } from "@/components/empty-state";
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye, Download, Upload, Mail, UserCog } from "lucide-react";
import { employees, type Employee } from "@/lib/hr-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/hr/employees")({ component: EmployeesPage });

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success border-success/20",
  "on-leave": "bg-warning/15 text-warning border-warning/20",
  probation: "bg-info/15 text-info border-info/20",
  terminated: "bg-destructive/15 text-destructive border-destructive/20",
};

const initials = (n: string) => n.split(" ").map(w => w[0]).slice(0, 2).join("");

function EmployeesPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | undefined>();
  const [delOpen, setDelOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => employees.filter((e) =>
    (dept === "all" || e.department === dept) &&
    (status === "all" || e.status === status) &&
    (e.name.toLowerCase().includes(q.toLowerCase()) || e.email.toLowerCase().includes(q.toLowerCase()) || e.code.toLowerCase().includes(q.toLowerCase()))
  ), [q, dept, status]);

  const allChecked = selected.length === filtered.length && filtered.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Centralized directory of your workforce."
        breadcrumbs={[{ label: "Human Resources" }, { label: "Employees" }]}
        actions={<>
          <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" />Import</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button asChild size="sm" className="gradient-primary text-primary-foreground border-0">
            <Link to="/app/hr/employees/new"><Plus className="mr-2 h-4 w-4" />Add employee</Link>
          </Button>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total employees" value="248" change="+4.2%" icon={UserCog} />
        <StatCard label="Active" value="231" change="+1.8%" icon={UserCog} accent="bg-success" />
        <StatCard label="On leave" value="9" change="-0.4%" icon={UserCog} trend="down" accent="bg-warning" />
        <StatCard label="On probation" value="8" change="+12%" icon={UserCog} accent="bg-info" />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, code or email…" className="pl-9" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="w-[170px]"><Filter className="mr-1 h-3.5 w-3.5" /><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {["Engineering","Sales","Finance","Marketing","Operations","Human Resources"].map((d)=> <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["active","on-leave","probation","terminated"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {selected.length > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm">
            <span className="font-medium">{selected.length} selected</span>
            <Button variant="ghost" size="sm"><Mail className="mr-1 h-3.5 w-3.5" />Email</Button>
            <Button variant="ghost" size="sm"><Download className="mr-1 h-3.5 w-3.5" />Export</Button>
            <Button variant="ghost" size="sm" className="text-destructive">Deactivate</Button>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={UserCog} title="No employees found" description="Try changing your filters or add a new employee." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-10"><Checkbox checked={allChecked} onCheckedChange={(v) => setSelected(v ? filtered.map(e=>e.id) : [])} /></TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell><Checkbox checked={selected.includes(e.id)} onCheckedChange={(v) => setSelected(v ? [...selected, e.id] : selected.filter(s=>s!==e.id))} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="gradient-primary text-primary-foreground text-xs">{initials(e.name)}</AvatarFallback></Avatar>
                      <div>
                        <Link to="/app/hr/employees/$employeeId" params={{ employeeId: e.id }} className="font-medium hover:text-primary">{e.name}</Link>
                        <p className="text-xs text-muted-foreground">{e.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{e.code}</TableCell>
                  <TableCell className="text-muted-foreground">{e.department}</TableCell>
                  <TableCell>{e.designation}</TableCell>
                  <TableCell><Badge variant="outline">{e.type}</Badge></TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize", statusStyles[e.status])}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />{e.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link to="/app/hr/employees/$employeeId" params={{ employeeId: e.id }} className="gap-2"><Eye className="h-4 w-4" />View</Link></DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => { setEditing(e); setDrawerOpen(true); }}><Edit className="h-4 w-4" />Quick edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDelOpen(true)}><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {employees.length}</p>
          <Pagination className="m-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
              <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
              <PaginationItem><PaginationNext href="#" /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Quick edit employee</SheetTitle>
            <SheetDescription>Update key information for {editing?.name}.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Full name</Label><Input defaultValue={editing?.name} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Department</Label><Input defaultValue={editing?.department} /></div>
              <div className="grid gap-2"><Label>Designation</Label><Input defaultValue={editing?.designation} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Phone</Label><Input defaultValue={editing?.phone} /></div>
              <div className="grid gap-2"><Label>Location</Label><Input defaultValue={editing?.location} /></div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={() => setDrawerOpen(false)}>Save changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDelete open={delOpen} onOpenChange={setDelOpen} title="Delete employee?" description="This will permanently remove the employee record. This action cannot be undone." />
    </div>
  );
}
