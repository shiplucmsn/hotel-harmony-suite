import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CalendarDays, Mail, Phone, Wallet } from "lucide-react";
import { useHrAttendances, useHrDepartments, useHrDesignations, useHrEmployees, useHrLeaves, useHrPayrolls, useUpdateHrEmployee } from "@/hooks/hr/use-hr";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type Props = {
  employeeId: string;
};

export function HrEmployeeDetailPage({ employeeId }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const numericId = Number(employeeId);
  const { data: employeesData } = useHrEmployees({ per_page: 200 });
  const { data: attendanceData } = useHrAttendances({ per_page: 200, employee_id: numericId });
  const { data: leavesData } = useHrLeaves({ per_page: 100, employee_id: numericId });
  const { data: payrollData } = useHrPayrolls({ per_page: 100, employee_id: numericId });
  const { data: departmentsData } = useHrDepartments({ per_page: 300, status: "active" });
  const { data: designationsData } = useHrDesignations({ per_page: 300, status: "active" });
  const updateEmployee = useUpdateHrEmployee();

  const employee = useMemo(() => employeesData?.data.find((entry) => entry.id === numericId), [employeesData?.data, numericId]);
  const attendance = attendanceData?.data ?? [];
  const leaves = leavesData?.data ?? [];
  const payrolls = payrollData?.data ?? [];
  const departmentOptions = departmentsData?.data ?? [];
  const designationOptions = designationsData?.data ?? [];

  if (!employee) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Employee"
          description="No matching employee found."
          breadcrumbs={[{ label: "Human Resources" }, { label: "Employees", to: "/app/hr/employees" }, { label: "Not found" }]}
          actions={
            <Button asChild variant="outline" size="sm">
              <Link to="/app/hr/employees">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.name}
        description={`${employee.designation ?? "Employee"} · ${employee.department ?? "No department"}`}
        breadcrumbs={[{ label: "Human Resources" }, { label: "Employees", to: "/app/hr/employees" }, { label: employee.name }]}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/app/hr/employees">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button size="sm" className="gradient-primary border-0 text-primary-foreground" onClick={() => setEditOpen(true)}>
              Edit profile
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="gradient-primary text-primary-foreground">{initials(employee.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{employee.name}</p>
              <p className="text-xs text-muted-foreground">{employee.employee_no}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="outline" className="capitalize">
                  {employee.status}
                </Badge>
                <Badge variant="outline">{employee.payroll_frequency ?? "monthly"}</Badge>
                <Badge variant="outline" className="capitalize">
                  Login: {employee.login_provision_status ?? "not_provisioned"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="grid gap-1 text-sm">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {employee.email ?? "-"}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {employee.phone ?? "-"}
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Joined {employee.join_date ?? "-"}
            </p>
            <p className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />${Number(employee.basic_salary || 0).toLocaleString()} basic
            </p>
            {(employee.login_provision_status === "failed" || employee.login_provision_status === "not_provisioned") && employee.email ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateEmployee.mutate({
                    id: employee.id,
                    body: { create_login: true, force_reprovision_login: true },
                  })
                }
              >
                Retry login setup
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leave</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="mt-4">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check in</TableHead>
                  <TableHead>Check out</TableHead>
                  <TableHead>Worked mins</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.slice(0, 20).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.attendance_date}</TableCell>
                    <TableCell className="capitalize">{entry.status}</TableCell>
                    <TableCell>{entry.check_in_at ?? "-"}</TableCell>
                    <TableCell>{entry.check_out_at ?? "-"}</TableCell>
                    <TableCell>{entry.worked_minutes}</TableCell>
                  </TableRow>
                ))}
                {attendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-muted-foreground">
                      No attendance logs found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="leaves" className="mt-4">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Type</TableHead>
                  <TableHead>Range</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="capitalize">{entry.leave_type}</TableCell>
                    <TableCell>
                      {entry.start_date} to {entry.end_date}
                    </TableCell>
                    <TableCell>{entry.days}</TableCell>
                    <TableCell className="capitalize">{entry.status}</TableCell>
                  </TableRow>
                ))}
                {leaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-muted-foreground">
                      No leave records found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="payroll" className="mt-4">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Number</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Net amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.number}</TableCell>
                    <TableCell>
                      {row.period_start} to {row.period_end}
                    </TableCell>
                    <TableCell>${Number(row.net_amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{row.status}</TableCell>
                  </TableRow>
                ))}
                {payrolls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-muted-foreground">
                      No payroll runs found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit employee profile</DialogTitle>
            <DialogDescription>Keep employee master data aligned for attendance, leave and payroll downstream flows.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              updateEmployee.mutate(
                {
                  id: employee.id,
                  body: {
                    name: String(form.get("name") ?? employee.name),
                    email: String(form.get("email") ?? employee.email ?? ""),
                    phone: String(form.get("phone") ?? employee.phone ?? ""),
                    department_id: Number(form.get("department_id") || employee.department_id || 0) || undefined,
                    designation_id: Number(form.get("designation_id") || employee.designation_id || 0) || undefined,
                    basic_salary: Number(form.get("basic_salary") ?? employee.basic_salary),
                  },
                },
                { onSuccess: () => setEditOpen(false) },
              );
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input name="name" defaultValue={employee.name} required />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input name="email" type="email" defaultValue={employee.email ?? ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input name="phone" defaultValue={employee.phone ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label>Basic salary</Label>
                <Input name="basic_salary" type="number" min={0} step={0.01} defaultValue={employee.basic_salary ?? 0} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Department</Label>
                <Select name="department_id" defaultValue={employee.department_id ? String(employee.department_id) : "none"}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {departmentOptions.map((department) => (
                      <SelectItem key={department.id} value={String(department.id)}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Designation</Label>
                <Select name="designation_id" defaultValue={employee.designation_id ? String(employee.designation_id) : "none"}>
                  <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {designationOptions
                      .filter((designation) => !employee.department_id || designation.department_id === employee.department_id)
                      .map((designation) => (
                        <SelectItem key={designation.id} value={String(designation.id)}>
                          {designation.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary border-0 text-primary-foreground" disabled={updateEmployee.isPending}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

