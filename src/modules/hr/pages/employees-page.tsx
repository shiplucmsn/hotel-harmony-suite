import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { Plus, Search, UserCog, Users, Wallet, BadgeCheck } from "lucide-react";
import { useCreateHrEmployee, useHrDepartments, useHrDesignations, useHrEmployees } from "@/hooks/hr/use-hr";

const statusTone: Record<string, string> = {
  active: "bg-success/15 text-success border-success/20",
  inactive: "bg-warning/15 text-warning border-warning/20",
  terminated: "bg-destructive/15 text-destructive border-destructive/20",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function HrEmployeesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [open, setOpen] = useState(false);
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [newDesignationId, setNewDesignationId] = useState("");
  const [createLogin, setCreateLogin] = useState(true);
  const [newPayrollFrequency, setNewPayrollFrequency] = useState<"monthly" | "biweekly" | "weekly">("monthly");
  const [newStatus, setNewStatus] = useState<"active" | "inactive" | "terminated">("active");

  const { data, isLoading } = useHrEmployees({ per_page: 100 });
  const { data: departmentsData } = useHrDepartments({ per_page: 200, status: "active" });
  const { data: designationsData } = useHrDesignations({ per_page: 300, status: "active" });
  const createEmployee = useCreateHrEmployee();
  const employees = data?.data ?? [];
  const departmentOptions = departmentsData?.data ?? [];
  const designationOptions = designationsData?.data ?? [];

  const filtered = useMemo(() => {
    return employees.filter((employee) => {
      const matchSearch =
        search.length === 0 ||
        employee.name.toLowerCase().includes(search.toLowerCase()) ||
        (employee.employee_no ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (employee.email ?? "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "all" || employee.status === status;
      const matchDepartment = department === "all" || employee.department === department;
      return matchSearch && matchStatus && matchDepartment;
    });
  }, [department, employees, search, status]);

  const activeCount = employees.filter((employee) => employee.status === "active").length;
  const monthlySalary = employees.reduce((sum, employee) => sum + Number(employee.basic_salary || 0), 0);
  const departments = [...new Set(employees.map((employee) => employee.department).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Employee master, hiring health, and payroll-ready profile coverage."
        breadcrumbs={[{ label: "Human Resources" }, { label: "Employees" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Add employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Create employee profile</DialogTitle>
                <DialogDescription>Employee creation writes the HR master that attendance, leave and payroll flows depend on.</DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  createEmployee.mutate(
                    {
                      employee_no: String(form.get("employee_no") ?? ""),
                      name: String(form.get("name") ?? ""),
                      email: String(form.get("email") ?? ""),
                      phone: String(form.get("phone") ?? ""),
                      department_id: newDepartmentId ? Number(newDepartmentId) : undefined,
                      designation_id: newDesignationId ? Number(newDesignationId) : undefined,
                      join_date: String(form.get("join_date") ?? ""),
                      basic_salary: Number(form.get("basic_salary") ?? 0),
                      payroll_frequency: newPayrollFrequency,
                      status: newStatus,
                      create_login: createLogin,
                    },
                    {
                      onSuccess: () => {
                        setOpen(false);
                        setNewDepartmentId("");
                        setNewDesignationId("");
                        setCreateLogin(true);
                        setNewPayrollFrequency("monthly");
                        setNewStatus("active");
                      },
                    },
                  );
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="employee_no">Employee no</Label>
                    <Input id="employee_no" name="employee_no" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" name="name" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={newDepartmentId || "none"} onValueChange={(value) => setNewDepartmentId(value === "none" ? "" : value)}>
                      <SelectTrigger id="department"><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {departmentOptions.map((entry) => (
                          <SelectItem key={entry.id} value={String(entry.id)}>
                            {entry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Select value={newDesignationId || "none"} onValueChange={(value) => setNewDesignationId(value === "none" ? "" : value)}>
                      <SelectTrigger id="designation"><SelectValue placeholder="Select designation" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {designationOptions
                          .filter((entry) => !newDepartmentId || entry.department_id === Number(newDepartmentId))
                          .map((entry) => (
                            <SelectItem key={entry.id} value={String(entry.id)}>
                              {entry.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="join_date">Join date</Label>
                    <Input id="join_date" name="join_date" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="basic_salary">Basic salary</Label>
                    <Input id="basic_salary" name="basic_salary" type="number" min={0} step={0.01} defaultValue={0} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Payroll frequency</Label>
                    <Select value={newPayrollFrequency} onValueChange={(value) => setNewPayrollFrequency(value as "monthly" | "biweekly" | "weekly")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={newStatus} onValueChange={(value) => setNewStatus(value as "active" | "inactive" | "terminated")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md border p-3">
                  <Checkbox id="create_login" checked={createLogin} onCheckedChange={(value) => setCreateLogin(Boolean(value))} />
                  <Label htmlFor="create_login" className="cursor-pointer">
                    Create login account with temporary password
                  </Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-primary border-0 text-primary-foreground" disabled={createEmployee.isPending}>
                    Save employee
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total employees" value={String(employees.length)} icon={Users} />
        <StatCard label="Active employees" value={String(activeCount)} icon={BadgeCheck} accent="bg-success" />
        <StatCard label="Departments" value={String(departments.length)} icon={UserCog} accent="bg-info" />
        <StatCard label="Monthly basic payroll" value={`$${monthlySalary.toLocaleString()}`} icon={Wallet} accent="bg-warning" />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, employee no or email" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {entry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <p className="p-5 text-sm text-muted-foreground">Loading employees...</p>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No employees found" description="Adjust filters or create a new employee profile." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Employee</TableHead>
                <TableHead>Employee no</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="gradient-primary text-xs text-primary-foreground">{initials(employee.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link to="/app/hr/employees/$employeeId" params={{ employeeId: String(employee.id) }} className="font-medium hover:text-primary">
                          {employee.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{employee.email ?? "No email"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{employee.employee_no}</TableCell>
                  <TableCell>{employee.department ?? "-"}</TableCell>
                  <TableCell>{employee.designation ?? "-"}</TableCell>
                  <TableCell>${Number(employee.basic_salary || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusTone[employee.status] ?? "capitalize"}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {employee.login_provision_status ?? "not_provisioned"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

