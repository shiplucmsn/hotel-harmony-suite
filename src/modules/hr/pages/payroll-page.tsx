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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleDollarSign, FileText, Play, TrendingUp, Wallet } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { useCreateHrPayroll, useHrEmployees, useHrPayrolls, usePostHrPayroll } from "@/hooks/hr/use-hr";

export function HrPayrollPage() {
  const [open, setOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cash">("bank");
  const { data: payrollData, isLoading } = useHrPayrolls({ per_page: 100 });
  const { data: employeesData } = useHrEmployees({ per_page: 200 });
  const createPayroll = useCreateHrPayroll();
  const postPayroll = usePostHrPayroll();

  const payrolls = payrollData?.data ?? [];
  const employees = employeesData?.data ?? [];

  const analytics = useMemo(() => {
    const gross = payrolls.reduce((sum, row) => sum + Number(row.basic_amount || 0) + Number(row.allowance_amount || 0), 0);
    const deductions = payrolls.reduce((sum, row) => sum + Number(row.deduction_amount || 0) + Number(row.tax_amount || 0), 0);
    const net = payrolls.reduce((sum, row) => sum + Number(row.net_amount || 0), 0);
    const posted = payrolls.filter((row) => row.status === "posted" || row.status === "paid").length;
    const draft = payrolls.filter((row) => row.status === "draft").length;

    const trend = payrolls
      .slice()
      .sort((a, b) => a.period_start.localeCompare(b.period_start))
      .map((row) => ({
        period: `${row.period_start.slice(5)}-${row.period_end.slice(8)}`,
        gross: Number(row.basic_amount || 0) + Number(row.allowance_amount || 0),
        net: Number(row.net_amount || 0),
      }))
      .slice(-8);

    return { gross, deductions, net, posted, draft, trend };
  }, [payrolls]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Payroll drafts, posting status, and accounting-impact analytics."
        breadcrumbs={[{ label: "Human Resources" }, { label: "Payroll" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
                <Play className="mr-2 h-4 w-4" />
                Create draft
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Create payroll draft</DialogTitle>
                <DialogDescription>Posting this payroll will create finance journal entries from the backend engine.</DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  const employeeId = Number(selectedEmployeeId || 0);
                  const periodStart = String(form.get("period_start") ?? "");
                  const periodEnd = String(form.get("period_end") ?? "");
                  const basicAmount = Number(form.get("basic_amount") ?? 0);
                  const allowanceAmount = Number(form.get("allowance_amount") ?? 0);
                  const deductionAmount = Number(form.get("deduction_amount") ?? 0);
                  const taxAmount = Number(form.get("tax_amount") ?? 0);

                  createPayroll.mutate(
                    {
                      employee_id: employeeId,
                      period_start: periodStart,
                      period_end: periodEnd,
                      basic_amount: basicAmount,
                      allowance_amount: allowanceAmount,
                      deduction_amount: deductionAmount,
                      tax_amount: taxAmount,
                      payment_method: paymentMethod,
                      memo: String(form.get("memo") ?? ""),
                    },
                    {
                      onSuccess: () => {
                        setOpen(false);
                        setSelectedEmployeeId("");
                        setPaymentMethod("bank");
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Period start</Label>
                    <Input type="date" name="period_start" required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Period end</Label>
                    <Input type="date" name="period_end" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Basic amount</Label>
                    <Input type="number" step={0.01} min={0} name="basic_amount" defaultValue={0} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Allowance</Label>
                    <Input type="number" step={0.01} min={0} name="allowance_amount" defaultValue={0} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Deductions</Label>
                    <Input type="number" step={0.01} min={0} name="deduction_amount" defaultValue={0} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tax</Label>
                    <Input type="number" step={0.01} min={0} name="tax_amount" defaultValue={0} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Payment method</Label>
                  <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "bank" | "cash")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gradient-primary border-0 text-primary-foreground"
                    disabled={createPayroll.isPending || selectedEmployeeId.length === 0}
                  >
                    Create draft
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Gross" value={`$${analytics.gross.toLocaleString()}`} icon={Wallet} />
        <StatCard label="Deductions + tax" value={`$${analytics.deductions.toLocaleString()}`} icon={FileText} accent="bg-warning" />
        <StatCard label="Net payout" value={`$${analytics.net.toLocaleString()}`} icon={CircleDollarSign} accent="bg-success" />
        <StatCard label="Draft runs" value={String(analytics.draft)} icon={Play} accent="bg-info" />
        <StatCard label="Posted runs" value={String(analytics.posted)} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Net vs gross trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="period" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area dataKey="gross" type="monotone" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                <Area dataKey="net" type="monotone" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Payroll no</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground">
                  Loading payroll runs...
                </TableCell>
              </TableRow>
            ) : (
              payrolls.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.number}</TableCell>
                  <TableCell>{row.employee_name ?? row.employee_no ?? `#${row.employee_id}`}</TableCell>
                  <TableCell>
                    {row.period_start} to {row.period_end}
                  </TableCell>
                  <TableCell>${(Number(row.basic_amount || 0) + Number(row.allowance_amount || 0)).toLocaleString()}</TableCell>
                  <TableCell>${Number(row.tax_amount || 0).toLocaleString()}</TableCell>
                  <TableCell>${Number(row.net_amount || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.status === "draft" ? (
                      <Button size="sm" onClick={() => postPayroll.mutate(row.id)} disabled={postPayroll.isPending} className="gradient-primary border-0 text-primary-foreground">
                        Post
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Posted</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

