import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Edit, Trash2, Search } from "lucide-react";
import {
  useCreateHrDesignation,
  useDeleteHrDesignation,
  useHrDepartments,
  useHrDesignations,
  useUpdateHrDesignation,
} from "@/hooks/hr/use-hr";

export const Route = createFileRoute("/app/hr/designations")({ component: DesignationsPage });

function DesignationsPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const { data } = useHrDesignations({ per_page: 200, search: q || undefined });
  const { data: departmentsData } = useHrDepartments({ per_page: 200, status: "active" });
  const createDesignation = useCreateHrDesignation();
  const updateDesignation = useUpdateHrDesignation();
  const deleteDesignation = useDeleteHrDesignation();
  const designations = data?.data ?? [];
  const departments = departmentsData?.data ?? [];

  function resetForm(): void {
    setEditingId(null);
    setTitle("");
    setLevel("");
    setDepartmentId("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Designations"
        description="Manage job titles and levels."
        breadcrumbs={[{ label: "HR" }, { label: "Designations" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />New designation</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Update designation" : "Create designation"}</DialogTitle></DialogHeader>
              <form
                className="grid gap-4 py-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const payload = {
                    title,
                    level: level || undefined,
                    department_id: departmentId ? Number(departmentId) : undefined,
                  };
                  if (editingId) {
                    updateDesignation.mutate(
                      { id: editingId, body: payload },
                      {
                        onSuccess: () => {
                          setOpen(false);
                          resetForm();
                        },
                      },
                    );
                    return;
                  }
                  createDesignation.mutate(payload, {
                    onSuccess: () => {
                      setOpen(false);
                      resetForm();
                    },
                  });
                }}
              >
                <div className="grid gap-2">
                  <Label>Title *</Label>
                  <Input placeholder="e.g. Product Manager" value={title} onChange={(event) => setTitle(event.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Level</Label>
                    <Select value={level || "none"} onValueChange={(value) => setLevel(value === "none" ? "" : value)}>
                      <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No level</SelectItem>
                        {["L1","L2","L3","L4","L5","L6"].map((entry) => <SelectItem key={entry} value={entry}>{entry}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Department</Label>
                    <Select value={departmentId || "none"} onValueChange={(value) => setDepartmentId(value === "none" ? "" : value)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {departments.map((department) => <SelectItem key={department.id} value={String(department.id)}>{department.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
                  <Button className="gradient-primary text-primary-foreground border-0" type="submit" disabled={createDesignation.isPending || updateDesignation.isPending}>
                    {editingId ? "Save" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search designations…" className="pl-9" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Title</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Headcount</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {designations.map((designation) => (
              <TableRow key={designation.id}>
                <TableCell className="font-medium">{designation.title}</TableCell>
                <TableCell><Badge variant="outline">{designation.level ?? "-"}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{designation.department_name ?? "-"}</TableCell>
                <TableCell>{designation.members_count}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => {
                          setEditingId(designation.id);
                          setTitle(designation.title);
                          setLevel(designation.level ?? "");
                          setDepartmentId(designation.department_id ? String(designation.department_id) : "");
                          setOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive" onClick={() => deleteDesignation.mutate(designation.id)}>
                        <Trash2 className="h-4 w-4" />Delete
                      </DropdownMenuItem>
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
