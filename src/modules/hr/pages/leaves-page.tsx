import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Check, Clock, Plus, X } from "lucide-react";
import { useApproveHrLeave, useCreateHrLeave, useHrEmployees, useHrLeaves, useRejectHrLeave } from "@/hooks/hr/use-hr";

const tone: Record<string, string> = {
  pending: "bg-warning/15 text-warning border-warning/20",
  approved: "bg-success/15 text-success border-success/20",
  rejected: "bg-destructive/15 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground",
};

export function HrLeavesPage() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedLeaveType, setSelectedLeaveType] = useState<"annual" | "sick" | "casual" | "unpaid">("annual");
  const { data: leavesData, isLoading } = useHrLeaves({ per_page: 100 });
  const { data: employeesData } = useHrEmployees({ per_page: 200 });
  const createLeave = useCreateHrLeave();
  const approveLeave = useApproveHrLeave();
  const rejectLeave = useRejectHrLeave();

  const leaves = leavesData?.data ?? [];
  const employees = employeesData?.data ?? [];

  const filtered = useMemo(() => {
    if (tab === "all") return leaves;
    return leaves.filter((entry) => entry.status === tab);
  }, [leaves, tab]);

  const pending = leaves.filter((entry) => entry.status === "pending").length;
  const approved = leaves.filter((entry) => entry.status === "approved").length;
  const rejected = leaves.filter((entry) => entry.status === "rejected").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave"
        description="Leave requests, approval pipeline, and policy compliance."
        breadcrumbs={[{ label: "Human Resources" }, { label: "Leave" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Request leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit leave request</DialogTitle>
                <DialogDescription>Submitting leave updates employee availability used by attendance and payroll planning.</DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  createLeave.mutate(
                    {
                      employee_id: Number(selectedEmployeeId),
                      leave_type: selectedLeaveType,
                      start_date: String(form.get("start_date")),
                      end_date: String(form.get("end_date")),
                      reason: String(form.get("reason") || ""),
                    },
                    {
                      onSuccess: () => {
                        setOpen(false);
                        setSelectedEmployeeId("");
                        setSelectedLeaveType("annual");
                      },
                    },
                  );
                }}
              >
                <div className="grid gap-2">
                  <Label>Employee</Label>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
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
                <div className="grid gap-2">
                  <Label>Leave type</Label>
                  <Select value={selectedLeaveType} onValueChange={(value) => setSelectedLeaveType(value as "annual" | "sick" | "casual" | "unpaid")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Start date</Label>
                    <Input type="date" name="start_date" required />
                  </div>
                  <div className="grid gap-2">
                    <Label>End date</Label>
                    <Input type="date" name="end_date" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Reason</Label>
                  <Textarea name="reason" rows={3} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gradient-primary border-0 text-primary-foreground"
                    disabled={createLeave.isPending || selectedEmployeeId.length === 0}
                  >
                    Submit
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending approvals" value={String(pending)} icon={Clock} accent="bg-warning" />
        <StatCard label="Approved" value={String(approved)} icon={Check} accent="bg-success" />
        <StatCard label="Rejected" value={String(rejected)} icon={X} accent="bg-destructive" />
        <StatCard label="Total requests" value={String(leaves.length)} icon={Plus} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Approval queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading leave requests...</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{entry.employee_name ?? entry.employee_no ?? `#${entry.employee_id}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.start_date} to {entry.end_date} • {entry.days} day(s)
                    </p>
                    {entry.reason ? <p className="mt-1 text-xs text-muted-foreground">{entry.reason}</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {entry.leave_type}
                    </Badge>
                    <Badge variant="outline" className={tone[entry.status] ?? "capitalize"}>
                      {entry.status}
                    </Badge>
                    {entry.status === "pending" ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => rejectLeave.mutate(entry.id)} disabled={rejectLeave.isPending}>
                          <X className="mr-1 h-3.5 w-3.5" />
                          Reject
                        </Button>
                        <Button size="sm" className="gradient-primary border-0 text-primary-foreground" onClick={() => approveLeave.mutate(entry.id)} disabled={approveLeave.isPending}>
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Approve
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
              {filtered.length === 0 ? <p className="text-sm text-muted-foreground">No requests for this filter.</p> : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

