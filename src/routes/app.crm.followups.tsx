import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Calendar, CheckSquare, Plus, BellRing } from "lucide-react";
import { followups } from "@/lib/crm-mock";
import { cn } from "@/lib/utils";

const typeIcon = { call: Phone, email: Mail, meeting: Calendar, task: CheckSquare };
const statusVariant: Record<string, string> = {
  upcoming: "bg-info/10 text-info",
  overdue: "bg-destructive/10 text-destructive",
  done: "bg-success/10 text-success",
};

export const Route = createFileRoute("/app/crm/followups")({
  component: () => (
    <div className="space-y-6">
      <PageHeader
        title="Follow-up Reminders"
        description="Stay on top of every call, email and meeting."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Follow-ups" }]}
        actions={
          <Dialog>
            <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Schedule Follow-up</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule Follow-up</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div><Label>Customer / Lead</Label><Input placeholder="Northwind Co" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Type</Label><Select><SelectTrigger><SelectValue placeholder="Call" /></SelectTrigger><SelectContent><SelectItem value="call">Call</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="meeting">Meeting</SelectItem><SelectItem value="task">Task</SelectItem></SelectContent></Select></div>
                  <div><Label>Due date</Label><Input type="datetime-local" /></div>
                </div>
                <div><Label>Notes</Label><Textarea placeholder="Add context..." /></div>
              </div>
              <DialogFooter><Button variant="outline">Cancel</Button><Button>Schedule</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="done">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              {followups.map((f) => {
                const Icon = typeIcon[f.type];
                return (
                  <div key={f.id} className={cn("flex items-start gap-3 rounded-lg border p-4", f.status === "overdue" && "border-destructive/40 bg-destructive/5")}>
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", f.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{f.customer}</span>
                        <Badge variant="outline" className="text-xs capitalize">{f.type}</Badge>
                        <Badge className={statusVariant[f.status]}>{f.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{f.notes}</p>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3">
                        <span className="flex items-center gap-1"><BellRing className="h-3 w-3" />{f.due}</span>
                        <span>· {f.owner}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Snooze</Button>
                      <Button size="sm">Complete</Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ),
});
