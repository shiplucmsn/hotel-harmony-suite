import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Briefcase, MoreHorizontal, Edit, Trash2, Users, Search } from "lucide-react";
import { useCreateHrDepartment, useDeleteHrDepartment, useHrDepartments, useHrEmployees, useUpdateHrDepartment } from "@/hooks/hr/use-hr";
import { toast } from "sonner";

export const Route = createFileRoute("/app/hr/departments")({ component: DepartmentsPage });

function DepartmentsPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");
  const [departmentHeadId, setDepartmentHeadId] = useState("");
  const { data, isLoading } = useHrDepartments({ per_page: 200, search: query || undefined });
  const { data: employeesData } = useHrEmployees({ per_page: 500, status: "active" });
  const createDepartment = useCreateHrDepartment();
  const updateDepartment = useUpdateHrDepartment();
  const deleteDepartment = useDeleteHrDepartment();
  const departments = data?.data ?? [];
  const employees = employeesData?.data ?? [];

  const departmentCards = useMemo(() => {
    return departments.map((department) => {
      const monthlyBudget = employees
        .filter((employee) => employee.department_id === department.id)
        .reduce((sum, employee) => sum + Number(employee.basic_salary || 0), 0);
      return {
        ...department,
        monthlyBudget,
      };
    });
  }, [departments, employees]);

  function resetForm(): void {
    setEditingId(null);
    setDepartmentName("");
    setDepartmentDescription("");
    setDepartmentHeadId("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Live department analytics based on employee master data."
        breadcrumbs={[{ label: "HR" }, { label: "Departments" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />New department</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create department</DialogTitle>
                <DialogDescription>
                  Departments CRUD is fully database-backed. Employee create/edit forms use this master.
                </DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-4 py-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const name = departmentName.trim();
                  if (!name) {
                    toast.error("Department name is required");
                    return;
                  }

                  const payload = {
                    name,
                    description: departmentDescription.trim() || undefined,
                    head_employee_id: departmentHeadId ? Number(departmentHeadId) : undefined,
                  };

                  if (editingId) {
                    updateDepartment.mutate(
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

                  createDepartment.mutate(payload, {
                    onSuccess: () => {
                      setOpen(false);
                      resetForm();
                    },
                  });
                }}
              >
                <div className="grid gap-2">
                  <Label>Name *</Label>
                  <Input value={departmentName} onChange={(event) => setDepartmentName(event.target.value)} placeholder="e.g. Customer Success" />
                </div>
                <div className="grid gap-2">
                  <Label>Department head</Label>
                  <Select value={departmentHeadId || "none"} onValueChange={(value) => setDepartmentHeadId(value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={String(employee.id)}>
                          {employee.name} ({employee.employee_no})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea rows={3} placeholder="Department scope and responsibility" value={departmentDescription} onChange={(event) => setDepartmentDescription(event.target.value)} />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-primary text-primary-foreground border-0" disabled={createDepartment.isPending || updateDepartment.isPending}>
                    {editingId ? "Save changes" : "Create"}
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
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search department" />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="py-10 text-sm text-muted-foreground">Loading departments...</CardContent>
          </Card>
        ) : departmentCards.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="py-6">
              <EmptyState
                icon={Briefcase}
                title="No departments found"
                description="Create a department by assigning one or more employees to a department name."
              />
            </CardContent>
          </Card>
        ) : (
          departmentCards.map((department) => (
            <Card key={department.id} className="group transition-all hover:-translate-y-0.5 hover:shadow-elegant">
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Briefcase className="h-5 w-5" /></div>
                  <CardTitle className="text-base">{department.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="gap-2"
                      onClick={() => {
                        setEditingId(department.id);
                        setDepartmentName(department.name);
                        setDepartmentDescription(department.description ?? "");
                        setDepartmentHeadId(department.head_employee_id ? String(department.head_employee_id) : "");
                        setOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive" onClick={() => deleteDepartment.mutate(department.id)}>
                      <Trash2 className="h-4 w-4" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">Head: <span className="font-medium text-foreground">{department.head_employee_name ?? "Unassigned"}</span></p>
                <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                  <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />Members</div>
                  <span className="font-semibold">{department.members_count}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Monthly base payroll</span>
                  <span className="font-medium text-foreground">${department.monthlyBudget.toLocaleString()}</span>
                </div>
                {department.description ? <p className="text-xs text-muted-foreground">{department.description}</p> : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
