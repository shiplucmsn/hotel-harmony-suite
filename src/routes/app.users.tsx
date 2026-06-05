import { createFileRoute, Link } from "@tanstack/react-router";
import { requirePermission } from "@/core/auth/require-permission";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { useRbacUsers } from "@/hooks/rbac/use-roles";
import { UserRolesDialog } from "@/components/user-roles-dialog";
import type { RbacUserDto } from "@/modules/rbac/types";
import { useMemo, useState } from "react";
import { BranchContextChip } from "@/components/branch-context-chip";
import { PageHeader } from "@/components/page-header";
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
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye, Download, Mail, Shield } from "lucide-react";
import { mockUsers, type User } from "@/lib/mock-data";
import { UserFormDialog } from "@/components/user-form-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/users")({
  beforeLoad: () => requirePermission("core.users.view"),
  component: UsersPage,
});

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success border-success/20",
  invited: "bg-info/15 text-info border-info/20",
  suspended: "bg-destructive/15 text-destructive border-destructive/20",
};

function UsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [editing, setEditing] = useState<User | undefined>();
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [rolesUser, setRolesUser] = useState<RbacUserDto | null>(null);
  const [rolesOpen, setRolesOpen] = useState(false);

  const { data: rbacUsersRes, isLoading } = useRbacUsers(q);
  const apiUsers = rbacUsersRes?.data ?? [];

  const filtered = useMemo(() => {
    const source =
      apiUsers.length > 0
        ? apiUsers.map((u) => ({
            id: String(u.id),
            name: u.name,
            email: u.email,
            role: u.roles?.[0]?.name ?? u.user_type,
            department: "—",
            status: u.is_active ? ("active" as const) : ("suspended" as const),
            lastActive: "—",
            rbac: u,
          }))
        : mockUsers.map((u) => ({ ...u, rbac: null as RbacUserDto | null }));

    return source.filter(
      (u) =>
        (role === "all" || u.role === role) &&
        (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
    );
  }, [q, role, apiUsers]);

  const allChecked = selected.length === filtered.length && filtered.length > 0;
  const initials = (n: string) => n.split(" ").map(w => w[0]).slice(0, 2).join("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage team members, roles and access."
        breadcrumbs={[{ label: "Administration" }, { label: "Users" }]}
        actions={<>
          <BranchContextChip />
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button asChild variant="outline" size="sm"><Link to="/app/users/new">Page form</Link></Button>
          <Button size="sm" onClick={() => { setEditing(undefined); setOpen(true); }} className="gradient-primary text-primary-foreground border-0">
            <Plus className="mr-2 h-4 w-4" />Invite user
          </Button>
        </>}
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[160px]"><Filter className="mr-1 h-3.5 w-3.5" /><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {["Admin", "Manager", "Sales", "Accountant", "Viewer"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm">
            <span className="font-medium">{selected.length} selected</span>
            <Button variant="ghost" size="sm"><Mail className="mr-1 h-3.5 w-3.5" />Email</Button>
            <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-10">
                <Checkbox checked={allChecked} onCheckedChange={(v) => setSelected(v ? filtered.map(u => u.id) : [])} />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} className="group">
                <TableCell>
                  <Checkbox
                    checked={selected.includes(u.id)}
                    onCheckedChange={(v) => setSelected(v ? [...selected, u.id] : selected.filter(s => s !== u.id))}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className="gradient-primary text-primary-foreground text-xs">{initials(u.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <Link to="/app/users/$userId" params={{ userId: u.id }} className="font-medium hover:text-primary">{u.name}</Link>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{u.department}</TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize", statusStyles[u.status])}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {u.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.lastActive}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link to="/app/users/$userId" params={{ userId: u.id }} className="gap-2"><Eye className="h-4 w-4" />View</Link></DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => { setEditing(u); setOpen(true); }}><Edit className="h-4 w-4" />Edit</DropdownMenuItem>
                      <PermissionGate permission="core.users.manage">
                        <DropdownMenuItem
                          className="gap-2"
                          disabled={!u.rbac}
                          onClick={() => {
                            if (u.rbac) {
                              setRolesUser(u.rbac);
                              setRolesOpen(true);
                            }
                          }}
                        >
                          <Shield className="h-4 w-4" />
                          Assign roles
                        </DropdownMenuItem>
                      </PermissionGate>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {mockUsers.length} users</p>
          <Pagination className="m-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
              <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
              <PaginationItem><PaginationNext href="#" /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>

      <UserFormDialog open={open} onOpenChange={setOpen} user={editing} />
      <ConfirmDelete open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete user?" description="This will permanently remove this user and all their access. This cannot be undone." />
      <UserRolesDialog user={rolesUser} open={rolesOpen} onOpenChange={setRolesOpen} />
    </div>
  );
}
