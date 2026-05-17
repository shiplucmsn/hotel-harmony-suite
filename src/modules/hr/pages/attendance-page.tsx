import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarCheck, Clock, CloudUpload, UserCheck, XCircle } from "lucide-react";
import { ResponsiveContainer, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { useCreateHrAttendance, useHrAttendances, useHrEmployees, useSyncHrAttendance } from "@/hooks/hr/use-hr";

function toDayLabel(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function HrAttendancePage() {
  const [recordOpen, setRecordOpen] = useState(false);
  const [recordEmployeeId, setRecordEmployeeId] = useState<string>("");
  const [recordStatus, setRecordStatus] = useState<"present" | "absent" | "late" | "half_day" | "leave">("present");
  const { data: attendanceData, isLoading } = useHrAttendances({ per_page: 200 });
  const { data: employeesData } = useHrEmployees({ per_page: 200 });
  const createAttendance = useCreateHrAttendance();
  const syncAttendance = useSyncHrAttendance();

  const attendances = attendanceData?.data ?? [];
  const employees = employeesData?.data ?? [];

  const analytics = useMemo(() => {
    const present = attendances.filter((entry) => entry.status === "present").length;
    const late = attendances.filter((entry) => entry.status === "late").length;
    const absent = attendances.filter((entry) => entry.status === "absent").length;
    const leave = attendances.filter((entry) => entry.status === "leave").length;

    const grouped = new Map<string, { day: string; present: number; late: number; absent: number }>();
    for (const entry of attendances) {
      const day = toDayLabel(entry.attendance_date);
      if (!grouped.has(day)) grouped.set(day, { day, present: 0, late: 0, absent: 0 });
      const bucket = grouped.get(day)!;
      if (entry.status === "present") bucket.present += 1;
      if (entry.status === "late") bucket.late += 1;
      if (entry.status === "absent") bucket.absent += 1;
    }

    return {
      present,
      late,
      absent,
      leave,
      chart: Array.from(grouped.values()).slice(-7),
      avgHours:
        attendances.length > 0
          ? (attendances.reduce((sum, entry) => sum + (entry.worked_minutes ?? 0), 0) / attendances.length / 60).toFixed(1)
          : "0.0",
    };
  }, [attendances]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Attendance logs, sync health, and punctuality analytics."
        breadcrumbs={[{ label: "Human Resources" }, { label: "Attendance" }]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                syncAttendance.mutate({
                  source: "manual",
                  rows: attendances.slice(0, 5).map((entry) => ({
                    employee_id: entry.employee_id,
                    attendance_date: entry.attendance_date,
                    status: entry.status as "present" | "absent" | "late" | "half_day" | "leave",
                    check_in_at: entry.check_in_at ?? undefined,
                    check_out_at: entry.check_out_at ?? undefined,
                    worked_minutes: entry.worked_minutes,
                    external_ref: entry.external_ref ?? undefined,
                  })),
                })
              }
              disabled={syncAttendance.isPending}
            >
              <CloudUpload className="mr-2 h-4 w-4" />
              Sync sample
            </Button>
            <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  Record attendance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record attendance</DialogTitle>
                  <DialogDescription>Capture daily attendance manually. This can later be synced from device/API as well.</DialogDescription>
                </DialogHeader>
                <form
                  className="grid gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    createAttendance.mutate(
                      {
                        employee_id: Number(recordEmployeeId),
                        attendance_date: String(form.get("attendance_date")),
                        check_in_at: String(form.get("check_in_at") || ""),
                        check_out_at: String(form.get("check_out_at") || ""),
                        worked_minutes: Number(form.get("worked_minutes") || 0),
                        status: recordStatus,
                        source: "manual",
                      },
                      {
                        onSuccess: () => {
                          setRecordOpen(false);
                          setRecordEmployeeId("");
                          setRecordStatus("present");
                        },
                      },
                    );
                  }}
                >
                  <div className="grid gap-2">
                    <Label>Employee</Label>
                    <Select value={recordEmployeeId} onValueChange={setRecordEmployeeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={String(employee.id)}>
                            {employee.name} ({employee.employee_no})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Date</Label>
                      <Input type="date" name="attendance_date" required />
                    </div>
                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Select value={recordStatus} onValueChange={(value) => setRecordStatus(value as "present" | "absent" | "late" | "half_day" | "leave")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="half_day">Half day</SelectItem>
                          <SelectItem value="leave">Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-2">
                      <Label>Check in</Label>
                      <Input type="time" name="check_in_at" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Check out</Label>
                      <Input type="time" name="check_out_at" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Worked mins</Label>
                      <Input type="number" name="worked_minutes" min={0} defaultValue={480} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setRecordOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="gradient-primary border-0 text-primary-foreground"
                      disabled={createAttendance.isPending || recordEmployeeId.length === 0}
                    >
                      Save log
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Present" value={String(analytics.present)} icon={UserCheck} accent="bg-success" />
        <StatCard label="Late" value={String(analytics.late)} icon={Clock} accent="bg-warning" />
        <StatCard label="Absent" value={String(analytics.absent)} icon={XCircle} accent="bg-destructive" />
        <StatCard label="Leave" value={String(analytics.leave)} icon={CalendarCheck} accent="bg-info" />
        <StatCard label="Avg worked hours" value={analytics.avgHours} icon={Clock} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance trend (last 7 entries)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.chart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="present" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Date</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check in</TableHead>
              <TableHead>Check out</TableHead>
              <TableHead>Worked (mins)</TableHead>
              <TableHead>Sync</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  Loading attendance...
                </TableCell>
              </TableRow>
            ) : (
              attendances.slice(0, 30).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.attendance_date}</TableCell>
                  <TableCell>{entry.employee_name ?? entry.employee_no ?? `#${entry.employee_id}`}</TableCell>
                  <TableCell className="capitalize">{entry.status}</TableCell>
                  <TableCell>{entry.check_in_at ?? "-"}</TableCell>
                  <TableCell>{entry.check_out_at ?? "-"}</TableCell>
                  <TableCell>{entry.worked_minutes}</TableCell>
                  <TableCell className="capitalize">{entry.sync_status ?? "synced"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

