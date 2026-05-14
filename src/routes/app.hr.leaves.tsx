import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarRange, Plus, Check, X, Clock, CheckCircle2, XCircle } from "lucide-react";
import { leaveRequests } from "@/lib/hr-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/hr/leaves")({ component: LeavesPage });

const tone: Record<string, string> = {
  pending: "bg-warning/15 text-warning border-warning/20",
  approved: "bg-success/15 text-success border-success/20",
  rejected: "bg-destructive/15 text-destructive border-destructive/20",
};

function LeavesPage() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? leaveRequests : leaveRequests.filter(l => l.status === tab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave requests"
        description="Manage and approve time-off requests."
        breadcrumbs={[{ label: "HR" }, { label: "Leaves" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />Request leave</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New leave request</DialogTitle>
                <DialogDescription>Submit a request for time off.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Leave type *</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{["Annual","Sick","Unpaid","Maternity","Bereavement"].map(t=> <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>From *</Label><Input type="date" /></div>
                  <div className="grid gap-2"><Label>To *</Label><Input type="date" /></div>
                </div>
                <div className="grid gap-2"><Label>Reason</Label><Textarea rows={3} placeholder="Optional notes" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button className="gradient-primary text-primary-foreground border-0" onClick={() => { toast.success("Leave request submitted"); setOpen(false); }}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending" value="12" icon={Clock} accent="bg-warning" />
        <StatCard label="Approved (mo)" value="38" change="+5%" icon={CheckCircle2} accent="bg-success" />
        <StatCard label="Rejected (mo)" value="3" icon={XCircle} accent="bg-destructive" />
        <StatCard label="Total leaves" value="142" change="+8%" icon={CalendarRange} />
      </div>

      <Card>
        <Tabs value={tab} onValueChange={setTab}>
          <CardHeader className="pb-0">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-4">
            <TabsContent value={tab} className="mt-0 space-y-3">
              {filtered.map(l => (
                <div key={l.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback className="gradient-primary text-primary-foreground text-xs">{l.employee.split(" ").map(w=>w[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{l.employee}</p>
                      <p className="text-xs text-muted-foreground">{l.from} → {l.to} · {l.days} day{l.days>1?"s":""} · {l.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{l.type}</Badge>
                    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize", tone[l.status])}>{l.status}</span>
                    {l.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={()=>toast.error("Leave rejected")}><X className="mr-1 h-3.5 w-3.5" />Reject</Button>
                        <Button size="sm" className="gradient-primary text-primary-foreground border-0" onClick={()=>toast.success("Leave approved")}><Check className="mr-1 h-3.5 w-3.5" />Approve</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
